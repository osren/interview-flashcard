# 谭成

2001.05 | 四川省成都市 | 15281070525 | 1529924810@qq.com | 前端开发工程师（AI 应用方向）

---

## 教育背景

**2024.09 — 2027.06**　重庆邮电大学　计算机科学与技术（硕士）　专业排名：前 10%  
**2020.09 — 2024.06**　西南石油大学　数据科学与大数据技术（本科）　专业排名：前 5%  
英语四级 · 英语六级 · 校二等奖学金 · 校三等奖学金

---

## 实习经历

**滴滴出行 · 企业版商旅（商旅体验）** | 前端开发实习生 | 2026.01 — 2026.07  
汇报关系：向商旅前端 Mentor / 组长汇报；与 PM、RD、QA 协作需求评审与发版验收

**项目一：AI 规范驱动的 C/B 双端业务交付**

- **项目描述**：作为**前端开发**，负责/参与商旅 C 端机/火预订链路与 B 端甲子配置中台功能交付；在团队 AI Coding Spec 约束下用大模型 + Agent Skills 加速需求理解、方案草案与规范编码，人工把关样式兼容与发版质量，支撑企业客户日常预订与后台配置运营。
- **技术栈**：React 17、TypeScript、Ant Design、Redux、AI Coding Spec、Cooper、Agent Skills
- **主要工作**：
  - **个人职责**：负责/协助 `fe-esflight`（机票）、`fe-estrain`（火车票）预订端需求与 `jiazi` 后台配置模块的前端实现、联调与上线
  - 规范底座：业务仓接入 `fe-estrip-ai-coding-spec`（Rules + Agent 约束 + Skills），让大模型在组内规范下协作
  - 模型 + Skills 协同：Cooper 读 PRD → 工作流 Skill 走需求/设计/开发 → 页面组件脚手架 → code-review 质检
  - **业务结果**：规范约束下完成 C 端 + B 端中台 **20+** 项交付、**15 次 release** 稳定发版；代表需求含机票分享扩量、超标预警、**B 端机票政策域多模块配置（航司销控/佣金出账等）**等已上线特性

**项目二：Agent 驱动的页面性能复盘 Skill**

- **项目描述**：作为**独立推动者**，将页面性能复盘流程固化为 Agent Skill，与业务仓 PerfMonitor/Omega 运行时监控联动，形成「Skill 定位瓶颈 → 改造 → 线上指标验收」闭环，改善商旅首页/列表等核心页加载与交互体验。
- **技术栈**：Agent Skill、Prompt 工程、PerfMonitor、Omega、Web Vitals、React
- **主要工作**：
  - **个人职责**：编写 Skill 规程与接入文档，推动业务仓埋点改造与优化方案落地，并用 Omega 指标验收
  - Skill 工程：固化加载 / 交互 / 监听三阶段分析规程，报告强制输出 P0/P1/P2 优先级与瓶颈清单
  - **业务结果**：列表 LCP **1400→1160ms（↓17%）**、星河底部菜单切换卡顿约 **↓27%**，经线上监控验收；Skill 规范可复用于团队 Agent 工作流

**项目三：商旅 AI 告警智能降噪判定服务（error-triage）**

- **项目描述**：参与商旅 AI 告警智能降噪判定服务的设计与实现，面向机酒火接口告警「噪音高、真故障易被淹没」问题，在告警派发前用 LLM 做分级判定；工程负责路由编排与 Eval 闭环，模型负责语义判定，目标是把业务正常拒绝/展示类噪音挡在 IM/工单之前。
- **技术栈**：Node.js、Prompt 工程、Agent Skills、Eval、LLM Gateway
- **主要工作**：
  - **个人职责**：参与引擎脚手架、火车票 Domain（路由表 + Prompt）配置，以及 discover/onboard Skills 与 `/eval` 评测链路搭建
  - 工程理念：判定交给模型，工程只做路由与编排；调优聚焦 Prompt 而非规则旁路
  - **评测成果**（gold 集）：以**漏报率 FN 为头号指标**，holdout 集 FN 压至 **≈0**；Prompt 迭代可将典型 business_reject 误报 **FP 1/1→0/1**（评测样例）；severity 一致率同步提升
  - **业务价值**：火车票 Domain 已接入并完成回源核验；机酒 url 清单已摘、Domain 待 onboard；派发通道当前为日志占位（真实 IM/工单接缝已预留）
  - 技术实现：动态 Prompt 按 category 拼装（`_base` + 分类规则）；`/judge`/`/eval` 支持 gold 对比与 Prompt 回归，解析/超时失败保守上报

---

## 项目经历

**InterviewFlash · 秋招面试一体化 AI 备战平台** | 2025.12 — 2026.09 | 个人项目  
Github：https://github.com/osren/interview-flashcard

- **项目描述**：独立设计并开发面向秋招的**面试备战 Web 应用**，将闪卡刷题、AI 讲解/追问、秋招投递追踪、JD 智能解析、简历定向优化、面经复盘打通为「背题 → 模拟追问 → 按 JD 补弱 → 投递管理」闭环；未登录可用本地能力，登录后 Supabase 云同步。
- **技术栈**：React 18、TypeScript、Vite 5、Tailwind CSS、Zustand、Framer Motion、Supabase（Auth / Postgres / Edge Functions）、DeepSeek LLM、Recharts
- **主要工作**：
  - **产品架构**：覆盖刷题、面经、秋招投递、简历等 8+ 模块；题库按章动态加载，Campus Tab keep-alive 优化首屏与切换体验
  - **AI 讲解/追问**：CardAIPanel 侧滑面板，基于闪卡上下文构建 Explain / Follow-up Prompt，注入项目案例与候选人背景；SSE 流式输出，会话本地缓存避免重复扣费
  - **LLM 工程化**：Edge Function 统一代理 DeepSeek，JWT 鉴权 + 日额度 RPC 原子扣减；JD 结构化解析、简历定向优化，API Key 不出前端
  - **秋招投递**：ProgressRaceChart 竞赛图追踪各岗位阶段，行内切换状态；AI 解析 JD 入库，S/A/B 分级看板 + 岗位库云同步
  - **简历辅助**：Markdown 简历 + 岗位 JD → 生成优化副本与变更摘要，支撑按 JD 自查背诵与关键词对齐
  - **性能与同步**：路由/章节懒加载 + Vite 拆包；学习进度与投递数据 debounce 云同步 merge

---

## 专业技能

- **Web 前端**：熟练掌握 React、TypeScript；熟悉 Vue；具备小程序 / H5 多端经验；熟练使用 Ant Design、Tailwind CSS；熟悉 Redux、Zustand
- **AI 应用与 LLM 工程**：熟悉 Prompt 工程与大模型结构化输出；熟悉 Eval 评测闭环与人在回路写回；了解 LLM 代理鉴权、SSE 流式交互与 AI Coding 协作开发
- **工程化与其他**：熟悉 Vite、Webpack、Git；了解 Node.js、Supabase Edge Functions；熟悉 HTML5 / CSS3、JavaScript（ES6+）
