# AI监控降噪-error-triage-面试卡片

## 1. 请介绍一下你做的 AI 监控降噪项目，解决什么问题？

## 答案

**定位**：接口错误告警的智能上报判定系统——每条告警走一次 LLM，判断「该不该上报、定什么等级」，把噪音挡在派发之前。

**痛点**：商旅（机酒火）线上接口错误告警量大、噪音占比高：
- 业务正常拒绝（无票、已退改、重复提交、超时未支付取消）刷屏
- 低价值展示类错误（NPS、公告、分享页）占用注意力
- 信息不全的原始告警难以人工快速判断
- 三方/非自有接口异常让值班「背锅」

**结果**：真故障被淹没，值班被刷屏，漏看风险上升。

**目标输出**（每条告警）：
1. `should_report`：是否值得上报
2. `severity`：P0～P3
3. `error_type` + 中文 `reason`

**核心原则**：宁可误报不可误杀；判定交给模型，工程只做路由与编排；引擎领域无关，业务知识在可插拔 Domain。

---

## 2. 系统整体架构是怎样的？引擎和业务怎么解耦？

## 答案

**两大块**：
1. **运行时引擎** `error-triage/`：收告警 → 路由 → LLM 判定 → 派发
2. **接入工具链** Claude Skills：从业务代码摘接口清单 → 生成 Domain 配置

**分层**：
- **入口层**（领域无关）：`server.js`（HTTP）/ `consumer.js`（Kafka），只负责收包后调 `handleAlarm`
- **处理核** `pipeline.js`：按 `DOMAIN` 加载 `domains/<team>`，编排 triage + dispatch
- **三大引擎**：`router`（url→分类）/ `triage`（拼 Prompt、解析）/ `llm`（网关适配）
- **可插拔 Domain**：`rules.js` + `prompts/`，换团队 = 换 `DOMAIN` + 加文件夹，引擎零改动

**设计要点**：入口无关、领域可插拔、引擎不含业务知识、全程兜底（异常一律保守上报）。

---

## 3. 一条告警从进入到派发经过哪些步骤？

## 答案

| 步骤 | 模块 | 行为 |
|------|------|------|
| 1 收包 | server/consumer | 解析 JSON；不校验字段是否齐全 |
| 2 编排 | pipeline | `handleAlarm` → `triage` → `dispatch` |
| 3 路由 | router | url → pathname → 归属判别 → 有序规则 → category key |
| 4 拼 Prompt | triage | system = `_base.md` + `<key>.md`；user = 序列化 alarm |
| 5 调模型 | llm | 网关一次调用，`temperature=0`，超时约 10s |
| 6 解析 | triage | 抽 JSON、校验字段；失败 → fallback 保守上报 |
| 7 派发 | pipeline | `should_report=true` 按 severity 推送，否则丢弃 |

**入参硬依赖**：只有 `url`；其余缺失则「信息不足默认上报」。

---

## 4. 为什么每条告警都走 LLM，不做规则预过滤？

## 答案

**决策**：每条告警都走 LLM，前期不做规则旁路预过滤。

**理由**：
1. **保证判定质量**：业务拒绝语义复杂（同码不同场景、主流程 vs 展示），硬规则容易误杀真故障
2. **调策略不改代码**：阈值、severity 基线、business_reject 清单都在 Prompt 里，改 Prompt = 调阈值
3. **性能用别的手段补**：后续靠结果缓存、异步、聚合降成本，而不是砍掉 LLM 调用

**对应原则**：判定交给模型，工程只做路由与编排。

**面试可补充**：这是阶段一的质量优先选择；若线上成本压力大，可在「评测证明规则等价」后再加旁路，但当前明确非目标。

---

## 5. 「宁可误报不可误杀」在工程上如何落地？

## 答案

**产品原则**：漏报（FN）优先压到接近 0，误报（FP）在 FN 达标后再降。

**工程落地**：
1. **信息不足默认上报**：缺 errorCode / 模糊 errmsg → 倒向上报，`unknown`，severity ≥ P2
2. **链路异常兜底**：超时 / 网关报错 / JSON 解析失败 → 一律 `should_report=true, severity=P2`，永不吞告警、不卡队列
3. **路由未命中兜底**：自有前缀内未覆盖接口 → `fallbackKey`（保守上报）；清单过期只降 severity 精度，不造成漏报
4. **评测纪律**：FN 是头号指标；正负样本平衡，防止「一律不报」刷高分

**一句话**：降噪可以错报噪音，但不能把真故障静默丢掉。

---

## 6. 路由引擎怎么设计？ownedPrefixes 和 fallback 起什么作用？

## 答案

`createRouter(rules, { fallbackKey, ownedPrefixes })` 流程：

1. **pathname 归一化**：去掉 host 与 query，避免 token/sig 误匹配
2. **归属判别优先**：配了 `ownedPrefixes` 且路径不在前缀内 → 直接 `non-core`（规则救不回）
3. **有序匹配**：命中靠前优先；特例必须排在宽松规则前
4. **未命中兜底**：自有域内未覆盖 → `fallbackKey` 保守上报

**火车票示例**：`ownedPrefixes = ['/esapp/']`，`fallbackKey = 'order'`，分类含 payment / order / refund-change / query / user-auth / order-detail / display / non-core。

**关键决策**：
- 三方不背锅：非自有前缀落 non-core，基线 P3、单点默认不上报
- 阻塞主流程的非自有路径可「提升」进 ownedPrefixes，避免被归属判别压成 non-core 导致漏报

---

## 7. Prompt 是怎么组织的？调判定松紧改哪里？

## 答案

**Domain 结构**：
```
domains/<team>/
├── rules.js
└── prompts/
    ├── _base.md        # 通用核：schema、枚举、全局规则
    ├── non-core.md     # 非自有接口
    └── <key>.md        # 各 category 判定要点
```

**拼装**：`system = _base + <category>.md`，`user = 序列化 alarm`。

**调松紧对照表**：

| 想调什么 | 改哪里 |
|----------|--------|
| 全局置信度 / 高频升级 / severity 总纲 | `_base.md` |
| 某类基线 / business_reject 清单 | `<key>.md` |
| 只派发 P0/P1 | 派发层 `dispatch` 加 severity 闸门 |

**注意**：Prompt 启动时读入缓存，改完需重启；上报侧尽量填全 `url + errorCode + count`，否则阈值形同虚设。

---

## 8. severity（P0–P3）怎么定？为什么余票查询异常可以判 P1？

## 答案

**火车票主流程链**：查询(余票) → 填单/校验 → 下单占座 → 支付 → 出票 → 退改。

| 等级 | 含义 |
|------|------|
| P0 / P1 | 阻断主流程链的真异常 |
| P2 | 影响单用户但有兜底；信息不足保守上报的下限 |
| P3 | 纯展示 / 弱业务；或不上报时的占位级 |

**余票查询判 P1 的理由**：查询是下单主流程入口，挂了等于阻塞下单，不能因为名义上是「查询」就降级。

**反例**：展示类、NPS、公告等弱业务 → P3 或不上报。

---

## 9. business_reject（业务正常拒绝）如何识别？上线前要注意什么？

## 答案

**定义**：接口返回了错误形态，但属于业务预期路径（无票、已退改、重复提交、待核验等），不应打扰值班。

**落地方式**：
- 判定规则沉淀在各分类 Prompt 的 business_reject 清单与语义说明中
- discover Skill 会从业务代码捕获「码 → 原文 (文件:行)」证据，便于人工核验

**上线前必做**：
- business_reject 码 **回源码逐条核对**（含自有封装库 import 链）
- 避免 Prompt 草稿标错码导致真故障被当成正常拒绝（误杀）

**风险缓解**：discover 强制带证据 + emit 自检 + 人工回源；评测里必须保留足够「真故障」正样本。

---

## 10. 两个 Skill（discover / onboard）分别做什么？为什么要人工确认？

## 答案

**接入流水线**：
```
项目源码 ─[discover]→ url 清单 ─人工确认→ [onboard]→ domain 骨架 → 启动服务
```

**discover-triage-urls（探针）**：
- 输入：团队名 + 业务项目路径
- 输出：带中文注释、按链路分组的 `<team>-urls.js`
- 能力：先探技术栈、广召回、归属/核心边缘正交打标、sync 增量、emit 前自检
- 不做：不生成 rules/prompts，不碰引擎

**onboard-triage-domain（接入生成器）**：
- 输入：已确认的 url 清单
- 输出：`domains/<team>/{rules.js, prompts/...}`
- `_base` 通用核复用，业务槽按目标业务填，禁止照抄火车票例子

**必须人工拍板**：核心链路划定、ownedPrefixes、severity 基线、business_reject 清单、rules 特例排序。生成物是草稿，上线前需回源核验。

---

## 11. 接口清单过期会不会漏报？drift-check 解决什么问题？

## 答案

**不会漏报**：
- 自有前缀内未命中规则 → `fallbackKey` 保守上报
- 非自有 → `non-core` 兜底
- 清单过期只降低 severity 精度，不是漏报

因此同步不紧迫，可低频批量做。

**drift-check.sh**：
- 纯 grep、零 LLM，对比「项目源码 vs 清单」算 delta
- 退出码 1 = 有漂移；可挂 CI / pre-commit
- 角色是哨兵不是真相：最终归类仍由 sync 的 agent 分类步确认

**sync 模式**：已有清单时再跑 discover → 只对新增 url 做语义分类，token ∝ delta。

---

## 12. 评测闭环怎么设计？为什么不看笼统准确率？

## 答案

**闭环**：
```
拉异常 → 指纹去重成 case → 标 gold → run/eval（只判定不派发）
→ score 出指标 + 失败清单 → 归因改 Prompt → 数据集冻结重跑
```

**指标分开看**：

| 指标 | 优先级 |
|------|--------|
| 漏报率 FN | 头号，先压到 ≈0 |
| 误报率 FP | FN 达标后再降 |
| severity 完全一致 / 差一级 / 差多级 | 主精度 |
| error_type 准确率 | 辅助归因 |
| missing | 工程健康度 |

**不看笼统准确率的原因**：真实数据里 business_reject 占多数，「一律不报」也能刷高准确率，但会牺牲召回、漏掉真故障。

**纪律**：数据集冻结、train 调 / holdout 验、最终数字用生产模型、正负样本平衡。

---

## 13. Prompt 调优是人做还是 AI 做？自动调优有什么护栏？

## 答案

**人机协作**：
- AI：错误分析、归因到具体规则、出 Prompt diff
- 人：守 gold、severity / business_reject 业务语义、上线终审

**一句话**：改 Prompt 的「手」可以是 AI，但标准答案（gold）和最终拍板必须在人手里。

**若启用全自动闭环，四道护栏缺一不可**：
1. holdout 不参与调（防过拟合）
2. gold 冻结，AI 碰不到（防刷分）
3. FN 与 FP 一起卡（防「一律上报」钻空子）
4. 上线前人闸门

---

## 14. LLM 网关故障或解析失败时系统会怎样？

## 答案

**统一兜底**：`should_report=true, severity=P2`。

**工程意义**：
- 永不吞告警
- 不向入口层抛错卡死 Kafka 消费（位移仍可提交）
- 降噪能力暂时降级为「全部保守上报」，可用性优先于降噪率

**相关参数**：LLM 调用 `temperature=0`（判定要稳定），超时约 10s。

---

## 15. HTTP 和 Kafka 双入口如何统一？对外有哪些 API？

## 答案

**统一点**：两个入口唯一职责都是拿到一条 alarm → `handleAlarm(alarm)`（评测用 `triage`）。

**对外能力**：

| 能力 | API | 说明 |
|------|-----|------|
| 判定 + 派发 | `POST /triage` | 生产主链路 |
| 只判定不派发 | `POST /judge` | 回放 / 攒 gold，不触发真实告警 |
| 批量评测 | `POST /eval` | 批量判定 + vs gold 打分 |
| 健康检查 | `/health` | 运维 |

**价值**：业务方 / 监控平台只需投递单条错误事件；调优与生产共用同一套路由和 Prompt，保证评测口径一致。

---

## 16. 试点内嵌和中心化配置有什么区别？为什么分两阶段？

## 答案

**阶段一 · 试点内嵌（当前）**：
- 引擎 + Domain 放在项目内，机酒火试点维护
- 快速验证判定效果、打磨 Prompt，不引入额外基础设施

**阶段二 · 中心化（推广）**：
- Domain 抽到配置中心，eval-as-a-service
- 团队只填配置自助接入，无需各自维护一份框架

**为什么分两阶段**：早期降低落地成本；跑通后再规模化，避免一上来就上配置中心导致验证慢、耦合重。

---

## 17. 当前落地到哪一步？后续还有哪些待建设？

## 答案

**已就绪**：
- 通用引擎（HTTP / Kafka）
- 火车票 Domain（business_reject 已回源核验）
- 机酒 url 清单已摘取（Domain 待 onboard）
- `/judge` `/eval` 与本地 eval CLI

**待建设**：
- 真实派发通道（接 IM / 电话 / 工单，替换日志占位）
- 频次统计（指纹滑动窗口驱动高频升级）
- 告警聚合（同指纹时间窗合并防风暴）
- 结果缓存（同指纹短 TTL 复用判定，降成本）
- 探针下探共享组件库（避免只扫业务仓漏接口）
- BFF 统一封装、中心化配置

**面试建议**：主动说清「判定链路已通、派发与缓存是下一阶段」，体现演进意识而不夸大上线范围。

---

## 18. 这个项目里你个人贡献可以怎么讲？（结合前端实习背景）

## 答案

**可诚实对齐的贡献叙事**（按实际参与度选用）：

1. **问题定义与方案理解**：从值班噪音痛点抽象为「上报判定」而非「根因定位」，边界清晰（非目标：不做 incident-triage）
2. **架构落地**：参与/熟悉领域无关引擎 + 可插拔 Domain；理解路由、Prompt 拼装、兜底与 API 契约
3. **业务 Domain**：火车票分类、主流程 severity 基线、business_reject 回源核验
4. **AI 工程化**：discover / onboard Skills、drift-check、Eval 指标与人机协作调 Prompt
5. **与前端的关系**：告警来自前端/BFF 接口错误上报；未来 BFF 封装 triage 可降低业务侧接入成本；Skill 从前端仓库摘 url 是典型前端仓库治理场景

**避免**：把「脚手架已搭」说成「已全量生产降噪并量化提升 X%」——文档未给线上降噪百分比，派发通道仍为占位。

---

## 19. 如果面试官问：降噪和故障根因定位有什么区别？

## 答案

| 维度 | error-triage（本项目） | incident-triage |
|------|------------------------|-----------------|
| 问题 | 这条告警该不该报、定什么级 | 故障根因是什么、怎么处置 |
| 时机 | 派发之前 | 告警已触发之后 |
| 输出 | should_report / severity / type / reason | 根因假设、影响面、处置建议 |
| 原则 | 宁可误报不可误杀 | 定位准、可行动 |

本项目 **明确非目标**：不替代故障根因定位。降噪解决的是「注意力分配」，不是「根因分析」。

---

## 20. 举一个端到端判定例子（面试口述用）

## 答案

**输入**：`/railway/train/transferLeftTicket` 返回 `{ errcode: "1", errmsg: "参数错误" }`

**过程**：
1. 路由：url 含 `LeftTicket` → 分类 `query`（余票查询）
2. 规则：transferLeftTicket 是下单主流程必经入口，参数错误也阻塞下单
3. 按 query 细则：余票查询异常一律 P1

**输出**：
```json
{
  "should_report": true,
  "severity": "P1",
  "error_type": "param_validate_failed",
  "reason": "transferLeftTicket 属下单主流程入口，参数错误判 P1",
  "confidence": 0.86
}
```

**可对比反例**：无票 / 已退改等 business_reject → `should_report=false`；非自有营销中台接口 → non-core，基线 P3、单点默认不上报。

---

## 21. 已知风险有哪些？如何缓解？

## 答案

| 风险 | 缓解 |
|------|------|
| Prompt 草稿业务码标错 | discover 带证据 + emit 自检 + 上线前人工回源 |
| 清单过期 | fallback / non-core 兜底不漏报；drift-check 盯漂移 |
| 模型临界抖动（P2↔P1） | temperature=0；生产模型实跑验收；eval 回归 |
| LLM 故障 | 永不吞告警，统一 P2 保守上报 |
| 为降噪牺牲漏报 | FN 头号指标 + 正负样本平衡纪律 |

---

## 22. 和纯规则引擎方案比，LLM 方案的 tradeoff 是什么？

## 答案

**LLM 方案优势**：
- 能吃语义（errmsg、业务上下文），少写大量脆弱规则
- 策略迭代快（改 Prompt），引擎稳定
- 适合「正常拒绝 vs 真故障」这种灰色地带

**代价**：
- 延迟与成本（每条一次调用）→ 用缓存/聚合/异步补
- 输出需结构化约束与解析兜底
- 临界 severity 可能抖动 → 评测 + 生产模型验收
- 依赖 Prompt 质量与 gold 标注成本

**为何现阶段选 LLM**：噪音形态多、业务语义重，规则预过滤误杀成本高；先用 LLM 保证召回与可解释 reason，再在有数据证明后再考虑规则旁路。

---
