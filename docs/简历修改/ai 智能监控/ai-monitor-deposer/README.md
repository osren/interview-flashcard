# ai-monitordeposer

一套**接口错误告警的智能上报判定**系统：每条告警走一次 LLM，判断「该不该上报、定什么等级」，把噪音挡在派发之前，只把真正该看的告警送出去。

系统分两部分：

- **运行时引擎** `src/plugins/error-triage/` —— 常驻服务，通用引擎一份，各团队各带一个 `domain`（路由表 + 判定 prompt）。详见 [`src/plugins/error-triage/README.md`](src/plugins/error-triage/README.md)。
- **接入工具链**（两个 Claude Code skill）—— 把「一个接口散落各处的项目」半自动地变成「引擎能直接加载的 domain」，人工只需在关键处拍板。

```
                探针                        接入生成器                     运行时
┌────────────┐  discover-triage-urls  ┌──────────────┐  onboard-triage-domain  ┌──────────────┐
│  业务代码库 │ ─────────────────────▶ │ <team>-urls.js│ ──────────────────────▶ │ domains/<team>│ ─▶ error-triage 服务
│ (fe-esflight│   收集接口/区分核心链路 │  (人工确认)   │   生成 rules.js+prompts │  rules+prompts │    每条告警走 LLM
│  等)        │   生成清单表           └──────────────┘                         └──────────────┘
└────────────┘
                 └── 增量/sync 模式：项目新增接口时只分类 delta，不重扫全量 ──┘
```

---

## 组成

### 1. 探针 skill：`discover-triage-urls`

> `.claude/skills/discover-triage-urls/`

从一个**接口调用散落各处**的前端/后端项目里，自动发现并摘取「核心业务链路」的接口 url，产出一份带中文注释、按链路分组的清单 `<team>-urls.js`。

它只产出**中间物 = url 清单**，不生成 rules/prompts、不碰引擎——清单必须经人工确认，再交给下游。核心能力：

- **先探技术栈再套 playbook**：JS/TS 前端、原生 App、后端服务、OpenAPI/proto 各有不同的 url 落法；有权威接口源（网关注册表、OpenAPI）优先用它，grep 只作补充。
- **广召回摘取**：grep 广撒网 + `Explore` agent 补读内联调用/动态拼接，宁可多抓后剪，不静默漏；同时捕获**链路级语义**（这条链路干嘛的、什么算「正常业务拒绝」），作为下游生成专属 prompt 的原料。
- **两维度正交打标**：
  - **归属**（决定是否 non-core）——纯前缀判定，`ownedPrefixes` 内 = 自有，之外 = non-core。
  - **核心 vs 边缘**（决定 severity 基线）——反查「这接口挂了用户还能不能走完主流程」；注意业务专属高危轴（如网约车安全类天然 P0）。
- **增量 / sync 模式**：项目后续新增接口时，先用 `scripts/drift-check.sh`（纯 grep、零 LLM、可挂 CI）廉价算出 delta，再**只对新增的几条 url 跑语义分类**，token 消耗 ∝ delta 而非项目大小。清单头记录源码 commit SHA，供 `git diff` 精确定位改动。

产出示例（当前仓库已摘出的清单）：`flight-urls.js`、`hotel-urls.js`、`train-urls.js`。

### 2. 接入生成器 skill：`onboard-triage-domain`

> `.claude/skills/onboard-triage-domain/`

吃一份 url 清单（优先用探针产物），生成引擎能直接加载的一个 domain 骨架：

```
src/plugins/error-triage/domains/<team>/
├── rules.js                 url → category key 路由表（有序，命中靠前优先）
└── prompts/
    ├── _base.md             通用核（输出 schema + error_type 枚举 + 全局降噪规则）+ 业务槽
    ├── non-core.md          非自有/三方接口判定（基线 P3）
    └── <key>.md             每个 category 一个（payment/order/query/...）
```

`_base.md` 用「通用核原样复用 + 业务槽按目标业务填」的方式生成，不照抄范本；仍需人工拍板的 severity 基线、business_reject 清单会用 `<!-- TODO -->` 标出。

### 3. 运行时引擎：`error-triage`

> `src/plugins/error-triage/`（引擎代码零业务痕迹，接入新团队**不改任何引擎代码**）

- HTTP 入口 `server.js`（`POST /triage`）与 Kafka 入口 `consumer.js`，都只调用同一个 `handleAlarm`。
- **每条告警 = 一次 LLM 调用**，返回标准 JSON：`should_report` / `severity` / `error_type` / `reason` / `confidence`。
- **永不吞告警**：LLM 超时/网关报错/输出无法解析 → 一律保守上报（`P2`）。
- **信息不足倒向上报**：缺关键字段时上报而非放过。
- **按 pathname 路由 + 归属判别**：自有前缀外的接口（营销中台、三方等）落 `non-core`，保守上报只作用于自有接口。

完整的环境变量、启动方式、输入/输出字段见 [引擎 README](src/plugins/error-triage/README.md)。

---

## 典型工作流

**首次接入一个新业务：**

```
1. /discover-triage-urls   团队名=<team>，项目路径=<业务代码库>
     → 产出 <team>-urls.js，人工确认核心链路划定 / ownedPrefixes / 死代码 / 动态路径归一

2. /onboard-triage-domain  团队名=<team>，url 清单=<team>-urls.js
     → 产出 domains/<team>/{rules.js, prompts/...}

3. 人工核验（上线前必做）：生成的 prompt 是草稿——business_reject 错误码/语义来自探针摘取，
   需回源码逐条核对（本项目 train 首轮就核出多处偏差：语义标错 2023/2035/3037、归属挂错 2032、
   轮询态标签 303/105 错位）。注意证据链有时要顺 import 追进自有封装库（如轮询态真值在
   @didi/es-train-foundation 的 BaseOrderStatus 枚举，不在 app 源码）。
   一并确认 ownedPrefixes、各类 severity 基线、rules 特例排序。

4. DOMAIN=<team> LLM_GATEWAY_ENDPOINT=... node src/plugins/error-triage/server.js
```

**项目后续新增了接口（增量同步）：**

```
1. bash .claude/skills/discover-triage-urls/scripts/drift-check.sh <项目/src> <team>-urls.js [关注前缀...]
     → 零 LLM 检出「新增未接入」「疑似删除」，退出码 1 表示有漂移（可挂 CI）

2. /discover-triage-urls （sync 模式）  → 只分类新增的几条 url，合并回 <team>-urls.js

3. 需要时再跑 /onboard-triage-domain 更新 rules/prompts；若新增项都落进已有 category，往往只需在 rules.js 补几条 pattern
```

> 即使清单暂时过期，引擎也**不会漏报**：自有前缀内未命中规则 → 落 `fallbackKey` 保守上报；非自有 → non-core 兜底。所以同步只是提升 severity 精度，不紧迫，可批量低频做。

---

## 调整判定（降噪松紧 / 触发阈值）

引擎里**没有硬编码数值阈值**，该不该触发、定什么级全由 LLM 按 prompt 判。所以"调阈值"= 改 prompt：

- **全局阈值**（跨所有接口）→ `domains/<team>/prompts/_base.md`：置信度阈值（默认 `0.6` 以下倒向上报）、高频升级的 `count` 阈值、severity 总纲。（env 策略依部署而定：本服务只接收正式环境告警，`env` 恒为 `prod`，不做环境降级。）
- **单类阈值** → 对应 `<key>.md`：该类的 severity 基线、business_reject 码清单、升级条件。
- ⚠️ prompt 在服务启动时读入缓存，**改完需重启服务生效**。
- 想要"按级别硬过滤派发"（如只 page P0/P1）→ 那是派发层的事，在 `pipeline.js` 的 `dispatch` 加一道 severity 闸门（可做成环境变量），不必动 prompt。

判定阈值依赖输入字段才生效：`count` 驱动高频升级、`errorCode` 驱动 business_reject 码匹配——**上报侧尽量把 `url + errorCode + count` 填全**，否则对应阈值形同虚设。（本服务 prod-only，`env` 恒为 `prod`，不参与降级。）

## 调优判定质量（eval 闭环）

改 prompt 不能靠感觉——`src/plugins/error-triage/eval/` 提供一套**可度量、可回归**的评测闭环，把"人肉调 prompt"变成"跑分 + 错误分析 + 冻结重跑"。详见 [eval README](src/plugins/error-triage/eval/README.md)。

```
MCP 拉某 url 全部异常 → 按指纹去重成 unique case → 标 gold（模型草标 + 人工纠正）
        → node eval/run.js（接生产模型判定，不派发）→ node eval/score.js（对比 gold 出指标）
        → 看失败清单归因到具体 prompt 规则 → 改 prompt → 数据集冻结重跑对比
```

- **数据集** `eval/datasets/<domain>.jsonl`：每行一个 case（`alarm` + `gold` + `split`）= 考卷加标准答案。
- **run.js**：读数据集 → 逐条走真实 `triage`（同路由/同 prompt/同模型，**只判定不派发**）→ `outputs/`。
- **score.js**：outputs vs gold → 指标（**漏报率 FN 为头号指标** + 误报率 + severity + error_type）+ 失败清单，train / holdout 分开出。
- **纪律**：漏报优先、数据集冻结、train 调 holdout 验（防过拟合）、最终数字用生产模型跑、正负样本平衡。

```bash
DOMAIN=train LLM_GATEWAY_ENDPOINT=... LLM_GATEWAY_KEY=... node src/plugins/error-triage/eval/run.js
DOMAIN=train node src/plugins/error-triage/eval/score.js > src/plugins/error-triage/eval/reports/v1.md
```

**其他团队用 = 调 API，不集成项目**：eval 和判定一样对外是服务，不需要别的团队 clone 代码。`server.js` 暴露两个 endpoint：

- `POST /judge` —— 只判定、不派发（回放/调优用，不会触发真实告警）：`{ alarm } → 判定结果`。
- `POST /eval` —— 批量判定 + 对比 gold 打分：`{ dataset:[{case_id,alarm,gold,split}] } → { report, outputs }`。

团队侧只管：用自己的 MCP 拉数据 → 去重标 gold → 调 `/eval` 拿报告 → 改自己的 prompt（配置中心）→ 再调。中心侧持有引擎、模型凭证与统一打分口径。演进路线同 domain 配置：**阶段一试点内嵌（我们代跑）→ 阶段二 eval-as-a-service**（多团队按 `domain` 路由，数据集按团队存中心）。

## 当前状态

- 引擎：通用引擎 + Kafka/HTTP 双入口就绪。
- **已接入 domain**：`train`（火车票，`domains/train/`）——由 `train-urls.js` 经 onboard 生成，全部路由已用 `createRouter` 跑通，**各类 business_reject 错误码/轮询态已全部回 `fe-estrain` 源码逐条核验并附证据引用**（无核验债）。
- **待接入清单**（已摘取、尚无 domain）：`flight-urls.js`、`hotel-urls.js`。

## 后续演进

- **探针下探组件库接口**：`discover-triage-urls` 持续建设。当前只扫业务项目自身源码，接口若被封装在共享**组件库的组件**里（项目只引用组件、看不到组件内部的接口调用）会整类漏。探针需能下探到依赖的组件库，识别组件可能触发的接口，补上这块盲区。
- **BFF 侧封装该服务**：在 BFF 层统一封装判定/上报能力（BFF 捕获接口错误 → 调 `triage`），业务接入更轻，不必每个前端/客户端各自对接。
- 其余优化见汇报文档"待接入/优化"表：真实派发通道、频次统计（count）、告警聚合、结果缓存、项目组自定义可配置化。

## 运行前提

- **Node 18+**（内置 `fetch`、ESM 顶层 `await`），`"type": "module"`。
- Kafka 入口需 `npm i kafkajs`。
- 接网关前先按 `src/plugins/error-triage/llm.js` 里的 `TODO` 改鉴权头 / 请求体字段 / 响应取文本路径。
