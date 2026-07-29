# 商旅 AI 智能监控降噪 · 实习产出描述

> 与 `滴滴实习描述.md` 同级，作为实习期间 **AI 工程产出** 单独成条  
> 项目：ai-monitor-deposer / error-triage  
> 角色：参与设计与实现（引擎编排 / Domain / Skills / Eval）  
> 条目格式：`简述名称：具体内容`

---

## 一、总述

面向商旅机酒火线上接口错误告警「噪音高、真故障易被淹没」的问题，参与落地 **告警到达值班前的 LLM 智能降噪判定**：每条告警走一次大模型，输出是否上报、P0–P3 等级、错误类型与中文依据。

工程原则是 **判定交给模型，工程只做路由与编排**；业务知识下沉到可插拔 Domain，引擎领域无关。配套 Claude Code Skills 做接口发现与 Domain 接入，并以漏报率优先搭建 Eval 闭环；异常一律保守上报（宁可误报不可误杀）。

**现状口径**：火车票 Domain 已接入；机票/酒店 url 清单已摘、Domain 待 onboard；派发通道当前为日志占位，接缝已预留。

---

## 二、分述 · 能力要点

| 维度 | 内容 |
|------|------|
| 判定输出 | `should_report` + `severity` + `error_type` + `reason` |
| 架构 | HTTP/Kafka 双入口 → router → Prompt 拼装 → LLM 网关 → 解析/兜底 → 派发 |
| Domain | `rules.js` + `prompts/`（`_base` + `<key>`），换团队只换配置 |
| Skills | `discover-triage-urls`（广召回/增量/drift-check）→ `onboard-triage-domain` |
| Eval | `/judge` + `/eval`；gold 对比；漏报率 FN 为头号指标 |
| 技术栈 | Node.js · LLM Gateway · Prompt 工程 · Kafka · Agent Skills |

---

## 三、简历可粘贴写法（多版本）

> 标题行建议：  
> **商旅接口错误告警智能降噪（error-triage）** | 实习产出 · AI 工程 | 2026  
> 或挂在实习经历下作并列项目：与「滴滴企业版商旅前端实习」同级展示

---

### 写法 1：紧凑 4 条

**商旅 AI 告警智能降噪（error-triage）** | Node.js / LLM | 实习产出

- 业务问题：机酒火接口告警噪音高（业务拒绝/展示类/三方异常），真故障易被淹没，需在派发前智能判定
- 核心链路：落地「每条告警一次 LLM」判定，输出是否上报、P0–P3、错误类型与中文依据
- 可插拔架构：引擎领域无关；业务知识在 Domain（路由表 + `_base`/分类 Prompt），换团队零改引擎
- 接入与评测：Skills 完成接口发现与 Domain 生成；`/eval` 以漏报优先做 Prompt 回归；异常保守上报

---

### 写法 2：标准 4 条（通用推荐）

**商旅接口错误告警智能降噪（error-triage）** | LLM 编排 / Prompt / Eval | 实习产出

- 降噪判定落地：告警到达值班前完成智能判定（`should_report` + severity + reason），把噪音挡在 IM/工单之前
- 引擎与 Domain 解耦：HTTP/Kafka 双入口 → 路由 → Prompt 编排 → 网关；业务知识全部下沉 `domains/<team>/`
- 安全底线：宁可误报不可误杀——信息不足默认上报，超时/解析失败统一 P2 上报，漏报率 FN 为评测头号指标
- Skills + Eval 闭环：discover/onboard 降低接入成本；`/judge`/`/eval` 支持 gold 对比与 Prompt 回归；火车 Domain 已接入

---

### 写法 3：突出 AI / Agent 工程（投 LLM 应用岗）

**AI 告警降噪判定服务** | Prompt 工程 · Agent Skills · Eval | 实习产出

- 工程理念：判定交给模型，工程只做路由与编排；调阈值 = 改 Prompt，不做规则旁路预过滤
- Agent Skills 产品化：探针 Skill 广召回核心链路 url；接入 Skill 生成路由与 Prompt 骨架；drift-check 零 LLM 盯清单漂移
- 动态 Prompt：system = `_base` + 当前 category，按路由 key 按需加载，避免全量规则塞入
- 数据驱动调优：`/eval` 批量 vs gold；人机协作改 Prompt（AI 归因，人守 gold 与上线终审）

---

### 写法 4：突出架构与可扩展（投后端 / 平台岗）

**商旅告警降噪引擎（error-triage）** | Node.js / 可插拔 Domain | 实习产出

- 双入口编排：HTTP 与 Kafka 统一进入 `handleAlarm`，判定与派发管线领域无关
- 路由引擎：pathname 归一 + 自有前缀归属 + 有序规则匹配 → category key；未命中走保守 fallback
- Domain 可插拔：换业务 = 换 `DOMAIN` + 配置目录，引擎零改动；火车已接入，机酒清单已摘
- 演进接缝：派发/缓存/中心化配置边界已预留，当前聚焦判定质量与接入链路跑通

---

### 写法 5：量化 / 关键词向

**AI 监控降噪（error-triage）** | 实习产出

- 判定能力：单条告警 LLM 输出上报决策 + P0–P3 + 中文依据
- 架构能力：双入口 + 可插拔 Domain + 动态 Prompt 拼装
- 工程能力：discover/onboard Skills + drift-check；Eval 闭环（漏报优先）
- 技术关键词：LLM · Prompt Engineering · Kafka · Agent Skills · 告警降噪

---

### 写法 6：申请表简述

**产出名称**：商旅接口错误告警智能降噪（error-triage）  
**类型**：实习期间 AI 工程产出

- 产出目标：在告警派发前用大模型过滤噪音、标定严重等级，降低值班漏看风险
- 本人工作：参与引擎编排、Domain/Prompt 配置、Skills 接入与 Eval 评测闭环
- 关键约束：宁可误报不可误杀；模型/解析失败时保守上报
- 当前状态：火车 Domain 已接入；机酒待 onboard；真实派发通道为下一阶段

---

### 选用建议

| 简历情况 | 推荐写法 |
|----------|----------|
| 与实习经历并列、常规前端+AI | **写法 2** |
| 投 AI / LLM / Agent | **写法 3** |
| 投后端 / 平台 / 架构 | 写法 4 |
| 一页纸极简 | 写法 1 或 5 |
| 申请表 | 写法 6 |

**诚实边界**：不写「已全量机酒火降噪 X%」「已对接电话告警」；缓存/中心化属规划，勿写成已上线。

---

## 四、与实习主经历怎么摆

| 摆法 | 说明 |
|------|------|
| 同级三条 | ① 商旅前端实习 ② AI 智能监控降噪 ③ 黑客松 Token 治理 |
| 实习下子项目 | 在实习经历末条加「同期产出：告警降噪引擎…」 |
| AI 岗置顶 | 将本条放在实习经历之上或紧挨其下 |

---

_整理日期：2026-07-29_  
_详版面试素材：`ai 智能监控/resume-ai-monitor-deposer.md`、面试卡片_
