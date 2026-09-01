# 谭成

2001.05 | 四川省成都市 | 15281070525 | 1529924810@qq.com | 前端开发工程师（AI 应用方向）

---

## 教育背景

**2024.09 — 2027.06**　重庆邮电大学　计算机科学与技术（硕士）　专业排名：前 10%  
**2020.09 — 2024.06**　西南石油大学　数据科学与大数据技术（本科）　专业排名：前 5%  
英语四级 · 英语六级 · 校二等奖学金 · 校三等奖学金

---

## 实习经历

**滴滴出行 · 企业版商旅** | 前端开发实习生 | 2026.01 — 2026.07

**项目一：AI 规范驱动的 C/B 双端业务交付**

- **项目描述**：在团队 AI Coding Spec 约束下，参与商旅 C 端预订链路与 B 端配置中台开发；用大模型 + Agent Skills 加速需求理解、方案草案与规范编码，人工把关样式兼容与发版质量。
- **技术栈**：React 17、TypeScript、Ant Design、Redux、AI Coding Spec、Cooper、Agent Skills
- **主要工作**：
  - 规范底座：业务仓接入 `fe-estrip-ai-coding-spec`（Rules + Agent 约束 + Skills），让大模型在组内规范下协作
  - 模型 + Skills 协同：Cooper 读 PRD → 工作流 Skill 走需求/设计/开发 → 页面组件脚手架 → code-review 质检
  - 人机门禁：AI 加速定位与草案生成；样式/星河兼容、主链路边界与发版质量由人工把关
  - 业务闭环：规范约束下完成 C 端 + B 端中台 **20+** 项交付并稳定发版，证明 AI 是杠杆而非替代

**项目二：Agent 驱动的页面性能复盘 Skill**

- **项目描述**：将页面性能复盘流程固化为 Agent Skill，与 PerfMonitor/Omega 运行时监控联动，形成「Skill 定位瓶颈 → 改造 → 线上指标验收」闭环。
- **技术栈**：Agent Skill、Prompt 工程、PerfMonitor、Omega、Web Vitals、React
- **主要工作**：
  - Skill 工程：固化加载 / 交互 / 监听三阶段分析规程，报告强制输出 P0/P1/P2 优先级与瓶颈清单
  - 监控联动：与业务仓运行时监控打通，列表 LCP **1400→1160ms（↓17%）**、菜单切换卡顿约 **↓27%** 经线上指标验收
  - 可复用交付：沉淀 Skill 规范与接入文档，可复用于团队 Agent 工作流

**项目三：商旅 AI 告警智能降噪判定服务（error-triage）**

- **项目描述**：面向机酒火多 Domain 接口告警的 LLM 判定引擎，在派发前智能过滤噪音；工程负责路由编排与 Eval 闭环，模型负责语义判定。
- **技术栈**：Node.js、Prompt 工程、Agent Skills、Eval、LLM Gateway
- **主要工作**：
  - 工程理念：判定交给模型，工程只做路由与编排；调优聚焦 Prompt 而非规则旁路
  - Skills 产品化：探针发现核心链路、接入生成 Domain 骨架、清单漂移检测，降低业务 onboarding 成本
  - 数据驱动：Eval 批量对比 gold 集，人机协作迭代 Prompt；漏报优先，火车 Domain 已接入
  - 技术实现：动态 Prompt 按 category 按需拼装（`_base` + 分类规则）；`/judge`/`/eval` 支持 gold 对比与 Prompt 回归，解析失败保守上报

---

## 项目经历

**GResume · AI 驱动简历优化与 JD 派生** | 2025.10 — 2026.06 | 个人项目  
Github：https://github.com/506-FETL/resume

- **项目描述**：独立开发 AI 驱动的**简历创作**平台，模型负责判定与生成，工程负责编排、校验与人在回路写回；聚焦 TipTap 编辑、模板换肤与 PDF 导出，密钥经 `llm-proxy` 不出前端。
- **技术栈**：React 19、TypeScript、Vite、TipTap、Zustand、Supabase Edge Functions、DeepSeek LLM、Automerge（CRDT）
- **主要工作**：
  - ATS 闭环：一次结构化扫描产出五维分 + findings + path 级 suggestions，Issue-fix 对比确认后写入，避免「只打分不落地」
  - 双入口改写：Optimize 整份修复 vs 编辑器划词（STAR/量化/强动词/润色/JD 靠拢）多候选应用，能力复用同一 LLM 网关
  - JD 工作流：解析关键词 → 克隆底稿 → 白名单字段改写 → 匹配度与血缘树；后台任务可续跑
  - 协作底座：Automerge CRDT + Supabase Realtime 支持分享链接、远程光标与离线合并

**InterviewFlash · AI 增强面试备考闪卡** | 2025.12 — 2026.09 | 个人项目  
Github：https://github.com/osren/interview-flashcard

- **项目描述**：面向**面试背题与模拟追问**的 AI 增强闪卡系统，将 LLM 讲解/追问、JD 结构化解析与复习进度打通，形成「背题 → 模拟追问 → 按 JD 补弱」备考闭环。
- **技术栈**：React 18、TypeScript、Supabase Edge Functions、DeepSeek LLM、Zustand、Framer Motion、react-markdown
- **主要工作**：
  - 卡片 AI：基于闪卡上下文构建 Explain/Follow-up Prompt，Edge Function 流式输出；JWT 鉴权 + 未登录门禁
  - JD 解析链路：`fetch-jd-url` 服务端抓取 bypass CORS → `parse-jd` 结构化入库秋招岗位库，联动投递看板
  - 备考向微调：Markdown 主简历 + 选定 JD → `optimize-resume` 生成优化副本与变更摘要（辅助自查背诵，非 TipTap 编辑器）
  - 复习引擎：四态掌握度持久化 + 自定义面经导入；收藏/筛选/搜索与岗位 JD 关键词联动选题

---

## 专业技能

- **Web 前端**：熟练掌握 React、TypeScript；熟悉 Vue；具备小程序 / H5 多端经验；熟练使用 Ant Design、Tailwind CSS；熟悉 Redux、Zustand
- **Agent 编排与 LLM 应用**：熟悉 Prompt 工程、Agent Skills 产品化与 Eval 评测闭环；熟悉 LLM 结构化输出与人在回路写回；了解 Claude Code / AI Coding Spec 协作开发
- **工程化与其他**：熟悉 Vite、Webpack、Git；了解 Node.js、Supabase Edge Functions；熟悉 HTML5 / CSS3、JavaScript（ES6+）
