# InterviewFlash · 项目总结与多版本简历写法

> 项目：InterviewFlash（仓库 `interview-flashcard`）  
> 周期：**2025.12 — 2026.09** · 角色：独立设计与实现  
> Github：https://github.com/osren/interview-flashcard  
> 更新时间：2026-09-02

---

## 一句话定位（Elevator Pitch）

**InterviewFlash** 是面向秋招的面试备战 Web 应用，把闪卡刷题、AI 讲解/追问、秋招投递追踪、JD 解析、简历定向优化、面经复盘收成「背题 → 模拟追问 → 按 JD 补弱 → 投递管理」闭环。

**不含 GResume**：简历优化/JD 派生能力均内嵌于 InterviewFlash 的 Resume + Campus 模块，非独立 TipTap/CRDT 简历编辑器项目。

---

## 技术事实清单（写简历时对照，勿夸大）

| 维度 | 事实 |
|------|------|
| 前端 | React 18 + TypeScript + Vite 5 + Tailwind + Zustand + Framer Motion + React Router 6 |
| 后端 | Supabase Auth / Postgres RLS / 5 个 Edge Function（Deno） |
| LLM | DeepSeek `deepseek-chat`，密钥仅 Edge Function 持有 |
| 模块 | Core / MPX / Projects / Interview / Campus / Resume / AI 资讯 / LLM Handbook / Custom / Favorites |
| AI 入口 | CardAIPanel（解释/追问）、JdParseModal、ResumeOptimizeTab |
| 额度 | 默认 50 次/人/天，RPC 原子扣减，会话本地缓存避免重复扣费 |
| 同步 | learning_sync + campus_job_sync，debounce 1.5s merge |
| 性能 | 路由 lazy、章节动态 import、Campus Tab keep-alive、manualChunks |

---

## 版本 A · AI 应用 / LLM 工程化（投 AI 岗首推）

**InterviewFlash · 秋招面试一体化 AI 备战平台** | Prompt · SSE · Edge Function | 个人项目 | 2025.12 — 2026.09

- **项目描述**：独立开发 LLM 增强的面试备战应用；模型负责讲解/追问/解析/改写，工程负责鉴权、额度、Prompt 编排与流式体验；API Key 不出前端。
- **技术栈**：React 18、TypeScript、Supabase Edge Functions、DeepSeek LLM、Zustand、SSE
- **主要工作**：
  - Prompt 体系：Explain / Follow-up / Continue 分层 Prompt，注入 `candidate-context` + `interviewflash-context`，讲解必须映射本项目真实模块
  - 流式体验：llm-proxy SSE 代理 + 流式阶段纯文本渲染（防 Markdown 重解析闪烁）+ 完成后 Markdown 排版
  - 额度工程：Postgres `ai_usage_daily` + RPC 原子扣减；前端 quotaPending 后再判用尽；会话缓存（首次自动发起、再次打开恢复不重复扣费）
  - 结构化 AI：parse-jd 输出岗位 JSON 入库；optimize-resume 输出优化 Markdown + 变更摘要（禁止捏造经历）
  - 安全边界：JWT 手动校验（`--no-verify-jwt` + `requireUser`）；fetch-jd-url SSRF 防护；解析失败保守处理

**适用**：AI 应用工程师、LLM 产品化、Agent 工程、智能化前端

---

## 版本 B · 全栈前端 / 产品架构（投常规前端首推）

**InterviewFlash · 秋招面试一体化备战平台** | React · Vite · Supabase BaaS | 个人项目 | 2025.12 — 2026.09

- **项目描述**：独立设计并开发秋招一站式 Web 应用，覆盖刷题、投递、简历、复盘；未登录 localStorage 可用，登录后 Supabase 云同步。
- **技术栈**：React 18、TypeScript、Vite 5、Tailwind CSS、Zustand、Supabase、Framer Motion、Recharts
- **主要工作**：
  - 产品架构：8+ 业务模块；闪卡四态掌握度 + 章节进度 + 收藏/筛选/搜索；Home 学习总览 + 打卡日历 + 番茄钟
  - 状态分层：card / campus / resume / interview / streak 多 Store + persist；登录后 learning_sync、campus_job_sync debounce 双写 merge
  - 秋招闭环：ProgressRaceChart 竞赛图 + 行内状态下拉；S/A/B 分级看板；JdParseModal 一键 AI 添岗；远程 catalog + 本地 fallback
  - 卡片 AI：侧滑面板 Explain / 追问；多轮对话上下文持久化（按 cardId + mode 分 session）
  - 工程交付：TypeScript strict；面经/闪卡/岗位 JSON 可扩展；自定义卡片与导入导出

**适用**：Web 前端、全栈前端、校招常规岗

---

## 版本 C · 秋招业务 / C 端产品（投业务前端、增长）

**InterviewFlash · 秋招投递与学习一体化平台** | 产品闭环 · 数据可视化 | 个人项目 | 2025.12 — 2026.09

- **项目描述**：从「只会刷题、投递混乱」痛点出发，把**学习进度、投递状态、岗位库、AI 补弱**收成一条用户路径，服务秋招全程。
- **技术栈**：React 18、TypeScript、Zustand、Recharts、Supabase、Tailwind CSS
- **主要工作**：
  - 投递可视化：ProgressRaceChart 竞赛图展示各岗位「已投→筛简历→笔试→面试→Offer/终止」阶段；RaceChartStatusSelect 行内改状态
  - 岗位库运营：内置秋招 catalog + 远程同步；匹配置信度 tier；JobPool iframe 嵌入飞书/腾讯文档岗位池
  - AI 降本增效：粘贴/抓取 JD → 结构化入库自定义岗位；按 JD 优化简历副本，支撑投递前自查
  - 学习留存：掌握度四态、打卡 Streak、收藏夹、按 JD 关键词选题复习
  - 体验优化：Campus 默认打开「求职进度」Tab；Tab keep-alive 切换不白屏；首屏 skeleton + 预加载

**适用**：C 端业务前端、增长、产品型前端

---

## 版本 D · 性能工程 / 工程化（投工程化、性能优化向）

**InterviewFlash · 高性能面试备战 SPA** | 拆包 · 懒加载 · 同步策略 | 个人项目 | 2025.12 — 2026.09

- **项目描述**：千级闪卡 + 百级秋招岗位 JSON 场景下，通过**分层加载与状态同步策略**控制首屏与切章成本。
- **技术栈**：Vite 5、React 18、TypeScript、Zustand persist、Supabase
- **主要工作**：
  - 加载策略：路由级 `React.lazy`；Core/Projects **按章动态 import** + 内存 cache + inflight 去重；章节元数据与 card 数组分离
  - 拆包治理：manualChunks 拆分 framer-motion、md-editor、xlsx、supabase、recharts；LazyMDEditor 独立 chunk
  - Campus 专项：`/campus` eager load + ProgressTab 首屏；其余 Tab lazy + `visitedTabs` 挂载后隐藏（keep-alive）
  - 同步性能：pull-merge-push debounce 1.5s；merge 策略（状态取较高优先级）；未配置 Supabase 时纯本地 fallback
  - AI 流式：SSE 逐 chunk 更新；rAF/纯文本阶段避免 Markdown 全量重解析导致闪烁

**适用**：工程化、性能优化、架构向面试

---

## 版本 E · 精简一页（网申字数受限）

**InterviewFlash · AI 面试备战平台** | React / Supabase / LLM | 个人项目 | 2025.12 — 2026.09

- 独立开发秋招备战 Web 应用：闪卡刷题 + AI 讲解/追问 + 秋招投递竞赛图 + JD 解析 + 简历优化，登录云同步
- CardAIPanel SSE 流式 AI 教练；5 个 Supabase Edge Function + 日额度 RPC；Prompt 注入项目上下文
- ProgressRaceChart 投递可视化 + JdParseModal AI 添岗；Vite 懒加载 + 按章拆包 + Campus Tab keep-alive

**适用**：一页纸简历、网申「项目描述」文本框（约 500 字内）

---

## 版本 F · 面试深挖 / STAR 话术（自用，不写进简历正文）

### S — 背景
秋招复习分散在 Notion、PDF、表格里，背题和投递状态不同步，AI 工具与题库割裂。

### T — 任务
做一套**自己天天会用**的备战工具：打开就能刷题、模拟追问、管投递、按 JD 补弱。

### A — 行动
- 前端 SPA + Zustand 本地优先，Supabase 做 Auth/同步/LLM 网关
- AI 不堆功能：讲解、追问、JD 解析、简历优化四个入口共用额度与鉴权
- 会话缓存：避免「只看历史又扣一次额度」
- 性能：题库很大，必须按章加载，Campus 是高频入口单独优化

### R — 结果
- 形成可演示的完整闭环（可现场打开卡片 AI、投递图、JD 解析）
- LLM 工程化：额度、流式、Prompt、Edge Function 均有代码可讲
- 项目本身即面试项目复盘素材（Projects/interviewflash 章节）

### 高频追问准备
| 问题 | 回答要点 |
|------|----------|
| 为什么用 Supabase 不用自建后端？ | BaaS 快速 Auth+DB+Edge；个人项目控制运维成本；RLS + Service Role 分工 |
| 额度怎么防超刷？ | RPC `try_consume_ai_quota` 行锁；前后端双重校验；会话恢复不触发 auto-run |
| 流式为什么先纯文本？ | 每 chunk 全量 Markdown 解析会闪烁；完成后再渲染 |
| 同步冲突怎么办？ | merge 策略：掌握度取更高优先级；debounce 减少 push 频率 |
| 和 GResume 区别？ | InterviewFlash 是备战平台；简历优化是其中一个 Tab，无 TipTap/CRDT 协作编辑器 |

---

## 版本 G · 英文短版（外企 / 英文简历）

**InterviewFlash · AI-Powered Interview Prep Platform** | Personal Project | Dec 2025 — Sep 2026  
GitHub: https://github.com/osren/interview-flashcard

- Built a full-stack interview prep web app integrating flashcards, AI explain/follow-up, campus job tracking, JD parsing, and resume tailoring for campus recruiting.
- Implemented SSE streaming LLM proxy on Supabase Edge Functions with JWT auth, daily quota RPC, and session cache to avoid duplicate billing on history replay.
- Delivered job pipeline visualization (ProgressRaceChart), AI JD ingestion, and performance optimizations (route/chapter lazy loading, manualChunks, tab keep-alive).

---

## 投递对照表

| 岗位 JD 关键词 | 推荐版本 | 强化条目 |
|----------------|----------|----------|
| AI / LLM / Agent | **A** | Prompt、额度、SSE、结构化输出 |
| 前端 / React | **B** | 架构、Store、模块闭环 |
| 业务 / C 端 / 增长 | **C** | 竞赛图、投递闭环、用户路径 |
| 工程化 / 性能 | **D** | 懒加载、拆包、同步策略 |
| 字数受限 | **E** | 三条压缩 |
| 外企 | **G** | 英文短版 |

---

## 与 v2 简历文件的关系

| 文件 | InterviewFlash 写法 |
|------|---------------------|
| `秋招简历v2-AI强化版.md` | 已采用 **A + B 混合**（6 条主要工作） |
| `秋招简历v2-通用版.md` | 建议替换 GResume 为 **版本 B** |
| `版本02-AI智能化前端版.md` | 建议替换 GResume 为 **版本 A** |
| `版本05-精简一页版.md` | 使用 **版本 E** |

---

## 诚实边界

- 个人项目，**不写 DAU / 付费 / 用户增长等虚假数据**
- Algorithms 模块**当前未实现**，简历勿写
- 简历优化是**辅助自查**，非 ATS 评分 SaaS
- 性能数字若无 A/B 埋点，面试说「主观体验 + Lighthouse/Network 观察」
