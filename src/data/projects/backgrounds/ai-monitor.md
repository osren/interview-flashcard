# 商旅 AI 告警智能降噪判定服务（error-triage）

## 速览事实卡

| 项 | 事实 |
|---|---|
| 定位 | 告警派发前的智能判定：每条告警走一次 LLM，判「该不该报、什么级别」 |
| 输出 | `should_report` / `severity`(P0–P3) / `error_type` / `reason` / `confidence` / `_category` |
| 核心原则 | 宁可误报不可误杀；漏报率 FN 是头号指标 |
| 兜底 | 超时 / 网关异常 / 解析失败 → 一律 `should_report=true, severity=P2` |
| 架构 | 入口（HTTP+Kafka）→ pipeline → router / triage / llm，业务全在 `domains/<team>/` |
| 调松紧 | 引擎无硬编码阈值，改 prompt 即改判定；prompt 启动缓存，改完要重启 |
| 一致性 | `temperature = 0`，临界 severity 以生产模型实跑为准 |
| 落地边界 | train domain 已接入；机酒只摘了 url 清单；`dispatch` 是日志占位；无频次统计/聚合/缓存；**没有线上降噪百分比可宣称** |
| 不能说 | 「已全量生产降噪 90%」「替代了根因定位」 |

## 一句话定位

在商旅（机票 / 酒店 / 火车票）接口错误告警派发之前，用大模型对**每条**告警做一次「该不该上报、定什么级别」的判定，把业务正常拒绝和低价值噪音挡在值班面前。引擎领域无关，业务知识全部放在可插拔 domain 配置里。

## 业务背景与痛点

告警噪音有四类，共同结果是**真故障被淹没、值班被刷屏、漏看风险上升**：

| 噪音类型 | 典型表现 |
|---|---|
| 业务正常拒绝 | 无票、已退改、重复提交、待核验、超时未支付被取消 |
| 低价值展示类错误 | NPS、公告、分享页、首页配置 |
| 信息不全的原始告警 | 缺 errorCode、只有模糊 errmsg |
| 三方 / 非自有接口异常 | 营销中台、感知中台、外部域名 |

核心取舍是**宁可误报不可误杀**：误报只是多一条噪音，漏报可能让主链路故障无人处理。因此漏报率（FN）是头号指标，压到接近 0 之后才谈降噪。

## 判定输出契约

入参唯一硬依赖是 `url`，其余字段缺失时一律倒向"保守上报"。出参：

```json
{
  "should_report": true,
  "severity": "P1",
  "error_type": "param_validate_failed",
  "reason": "transferLeftTicket 属下单主流程入口，参数错误判 P1",
  "confidence": 0.86,
  "_category": "query"
}
```

severity 基线（火车票）：

- **P0 / P1**：阻断主流程链（查询 → 填单 → 下单 → 支付 → 出票 → 退改）
- **P2**：影响单用户但有兜底；也是信息不足时保守上报的下限
- **P3**：纯展示 / 弱业务，或 `should_report=false` 时的占位级

## 架构与分层

```text
HTTP / Kafka 入口 → handleAlarm → router（url→category）→ triage（拼 prompt + 调 LLM + 解析）→ dispatch
```

三条边界：

1. **入口无关**：`server.js`（HTTP）与 `consumer.js`（Kafka）都只调同一个 `handleAlarm`，核心行为不分叉。
2. **引擎领域无关**：`router.js` / `triage.js` / `llm.js` 里没有任何业务知识。
3. **业务可插拔**：换团队 = 换 `DOMAIN` 环境变量 + 加一个 `domains/<team>/`，引擎零改动。

目录骨架（`src/plugins/error-triage/`）：

```text
router.js      url → category（领域无关）
triage.js      拼 system/user prompt、调模型、解析 JSON、兜底
llm.js         公司大模型网关适配层（鉴权头 / 请求体 / 取文本路径）
pipeline.js    按 DOMAIN 装配 triage + dispatch，导出 handleAlarm
server.js      HTTP：/triage /judge /eval /health
consumer.js    Kafka 入口（kafkajs，跨分区并发≈LLM 并发）
domains/<team>/  rules.js + prompts/{_base,non-core,<key>}.md
eval/          datasets/<domain>.jsonl、run.js、score.js、score-lib.js
```

## 单条告警的 7 步

| 步骤 | 模块 | 行为 |
|---|---|---|
| 1 收包 | server / consumer | 解析 JSON，**不校验字段是否齐全** |
| 2 编排 | pipeline | `handleAlarm` → `triage` → `dispatch` |
| 3 路由 | router | url → pathname → 归属判断 → 有序规则 → key |
| 4 拼 prompt | triage | system = `_base.md` + `<key>.md`；user = 序列化后的 alarm |
| 5 调模型 | llm | 网关一次调用，`temperature = 0`，超时约 10s |
| 6 解析 | triage | 抽 JSON、校验字段；失败即走保守兜底 |
| 7 派发 | pipeline | `should_report=true` 按 severity 推送，否则丢弃 |

## 路由引擎细节

`createRouter(rules, { fallbackKey, ownedPrefixes })`，四步：

1. **pathname 归一化**：去掉 host 与 query，避免 token / sign 参数被误匹配。
2. **归属判别优先**：配了 `ownedPrefixes` 且路径不在前缀内 → 直接判 `non-core`，后面的规则救不回来（"三方不背锅"）。
3. **有序匹配**：命中靠前的规则优先，特例必须排在宽松规则之前。
4. **未命中兜底**：自有域内未覆盖的接口落 `fallbackKey`，保守上报。

火车票示例：`ownedPrefixes = ['/esapp/']`，`fallbackKey = 'order'`，分类含 `payment / order / refund-change / query / user-auth / order-detail / display / non-core`。

## 关键设计决策

| 决策 | 理由 |
|---|---|
| 每条告警都走 LLM | 先保证判定质量；性能靠缓存 / 异步解决，而不是减少调用 |
| 信息不足默认上报 | 宁可误报不可误杀 |
| 余票查询异常可判 P1 | 查询是下单主流程入口，挂了等于阻塞下单 |
| 只判正式环境 | 上报侧源头已过滤，`env` 恒为 `prod` |
| 三方不背锅 | 非自有前缀落 `non-core`，基线 P3、单点默认不上报 |
| 阻塞主流程的非自有路径可"提升"进 ownedPrefixes | 否则会被归属判别直接压成 non-core 导致漏报 |
| 调阈值 = 改 prompt | 引擎里不硬编码数值阈值；prompt 启动时读入缓存，**改完要重启** |

## Skill 工具链：散落接口 → 可用 domain

```
首次：业务源码 ─[discover 全量]→ <team>-urls.js ─人工确认→ [onboard]→ domains/<team>/ → 起服务
维护：新接口 ─[drift-check 纯 grep]→ [discover sync 仅增量]→ 确认 → 改 rules/prompt
```

- **Skill A `discover-triage-urls`（探针）**：先探技术栈再套 playbook；广召回 grep + 补读动态拼接；打两个正交标签（是否 non-core、核心 vs 边缘 severity 基线）；已有清单时自动 sync，只对 delta 做语义分类；emit 前把业务码标签回行号重读自检。
- **Skill B `onboard-triage-domain`（接入生成器）**：产出 `rules.js` + `prompts/`。`_base.md` 的通用核（输出 schema、`error_type` 枚举、信息不足上报、高频升级、business_reject 不上报）原样复用，业务槽按目标业务填，禁止照抄火车票例子。
- **`drift-check.sh`**：纯 grep、零 LLM，退出码 1 表示有漂移，可挂 CI / pre-commit。

**人工拍板点**：核心链路划定、`ownedPrefixes`、各类 severity 基线、business_reject 清单、rules 特例排序、疑似死代码与主动放弃的覆盖盲区。

**为什么清单过期不会漏报**：自有前缀内未命中的新接口走 `fallbackKey` 保守上报，非自有走 `non-core` 不背锅。清单过期只会降低 severity 精度，不会造成漏报。这是能放心用增量同步的前提。

## 评测闭环与指标

```
MCP 拉异常 → 指纹去重成 case → 标 gold（模型草标 + 人工纠正）
  → run.js 或 POST /eval（真实模型，只判定不派发）
  → score 出指标 + 失败清单
  → 归因到具体 prompt 规则 → 改 prompt
  → 数据集冻结重跑对比
```

指标分开看，**不看笼统准确率**：

| 指标 | 含义 | 优先级 |
|---|---|---|
| FN（漏报率） | gold 该报、判成不报 | 头号指标，先压到≈0 |
| FP（误报率） | gold 不报、判成报 | FN 达标后再降噪 |
| severity 完全一致 | 与 gold 同级 | 主精度 |
| severity 差一级 / 差多级 | 临界偏差 vs 严重偏差 | 差多级进失败清单 |
| error_type 准确率 | 类型是否命中 gold | 辅助归因 |
| missing | 没跑出判定的 case | 工程健康度 |

为什么不能看笼统准确率：真实数据里 business_reject 占多数，"一律不报"就能拿到表面高分，却把真故障全漏掉。所以必须正负样本平衡，保留足够的"真故障"正样本。

调优纪律五条：漏报优先；一轮调优期间数据集冻结；train 调 / holdout 验，holdout 不涨即过拟合要回退；最终数字必须用生产模型跑；正负样本平衡。

人机分工：错误分析与 prompt diff 由 AI 做，gold 与 severity / business_reject 业务语义由人守，上线终审必须过人。全自动闭环的四道护栏：holdout 不参与调、gold 冻结且 AI 碰不到、FN 与 FP 一起卡、上线前人闸门。

验收建议（试点）：holdout FN ≈ 0；holdout FP 相对基线明显下降；severity 差多级趋近 0；网关故障时仍能保守上报且 Kafka 位移可提交；主流程链（查 / 下 / 付 / 退）人工抽检与业务共识一致。

## 运行与参数

- Node 18+（内置 fetch、ESM），`"type": "module"`，Kafka 入口需 `kafkajs`。
- 环境变量：`DOMAIN`（默认 train）、`LLM_GATEWAY_ENDPOINT`、`LLM_GATEWAY_KEY`、`LLM_MODEL`（默认 gpt-4o-mini）、`PORT`（8080）、`KAFKA_BROKERS / KAFKA_TOPIC / KAFKA_GROUP`（topic 默认 alerts）、`KAFKA_CONCURRENCY`（4）、`EVAL_CONCURRENCY`（4）。
- 三个 HTTP 端点：`/triage`（生产主链路，会派发）、`/judge`（只判定不派发，用于回放与攒 gold）、`/eval`（批量判定 + 对比 gold 打分）、`/health`。
- 已知延迟来源：每条一次网关调用；结果缓存、频次统计、聚合都还只是留了接缝。

## 现状边界（讲清楚，别说过头）

- 通用引擎（HTTP / Kafka 双入口）✅ 就绪；火车票 domain ✅ 已接入，business_reject 已回源核验。
- 机票 / 酒店 url 清单 ✅ 已摘取，domain 待 onboard。
- **真实派发通道 ⏳**：`dispatch` 目前是日志占位，IM / 电话 / 工单还没接。
- 频次统计、告警聚合、结果缓存 ⏳ 未做；中心化配置与 eval-as-a-service 属阶段二规划。
- 没有可靠的线上降噪百分比，因此只能表述为"判定服务 + 业务配置 + 评测链路建设"，不能表述为"已全量生产降噪 90%"。

## 常见追问与易错点

- **为什么不做规则预过滤？** 前期要保证判定质量、避免规则误杀；性能问题用缓存 / 异步去解，不靠减少 LLM 调用。
- **模型挂了怎么办？** 超时 / 网关报错 / 解析失败 / 最低字段不合法，统一 `should_report=true, severity=P2`。永不吞告警、不卡队列。
- **怎么保证不同次判定一致？** `temperature=0`，同一模型同一 prompt 方向可复现；临界 severity（P2↔P1）以生产模型实跑为准，不用更强模型的结果糊过去。
- **接入新团队要改引擎吗？** 不改，只加 `domains/<team>/` 并换 `DOMAIN`。
- **Skill 会不会把配置写错？** 会。所以 discover 强制带证据（码 → 原文，文件:行），emit 前回行号自检，上线前人工回源核对 import 链。
- **这套和 incident-triage 什么关系？** 本服务只判"要不要上报、什么级别"，不做根因定位，那是 incident-triage 工作流的职责。
