# GResume 智能简历创作与求职管理平台 · 项目总结与简历写法

> 与 `AI智能监控降噪-实习产出描述.md` 同级目录风格；本文件专供 **个人项目** 总述 + 简历可粘贴条目  
> 项目：GResume（仓库 `granular-resume`）  
> 角色：独立设计与实现（产品 / 前端架构 / AI 应用 / 协作 / 模板）  
> 条目格式：`简述名称：具体内容`  
> 详版面试素材：同目录 `resume-builder-面试卡片.md`

---

## 一、完整项目总结

### 1. 一句话定位

**GResume** 是面向求职全链路的智能简历平台：从内容编辑、模板换皮、AI/ATS 优化、JD 针对性派生，到实时协作、版本回溯、投递看板与 PDF/Word 导出——用「离线优先 + 云端同步」把写作与求职管理收成一站式产品。

### 2. 动机与问题

求职同时要过 **人审** 和 **ATS 机筛**。常见痛点：

| 痛点 | 产品回应 |
|------|----------|
| 简历模块散、改一版丢一版 | Schema 驱动多模块编辑器 + 实时预览 + 版本历史 |
| 好看但过不了 ATS / 和 JD 不对口 | 五维 ATS 评分 + 可执行修复 + 划词改写 + JD 派生 |
| 投递进度靠 Excel | Tracker 看板 / 列表全流程 |
| 想找人一起改又怕覆盖 | Automerge CRDT 协作（后续富文本叠加 Yjs） |
| 换模板要重排内容 | 模板 Manifest 与内容解耦 + 可视化工作台 |

### 3. 技术选型（摘要）

| 层 | 选型 |
|----|------|
| 前端 | React 19 · TypeScript · Vite · Tailwind 4 · shadcn/ui |
| 状态 / 表单 | Zustand · React Hook Form · Zod |
| 富文本 | TipTap 3 |
| 协作 | Automerge + automerge-repo（主文档）；Yjs（富文本会话深化） |
| 后端 | Supabase（Auth / PostgreSQL / Realtime / Edge Functions） |
| AI | Vercel AI SDK 风格调用链 · DeepSeek（经 `llm-proxy`） |
| 离线 | IndexedDB |
| 导出 | react-to-print（PDF）· docx（Word） |
| 部署 | Vercel |

### 4. 迭代节奏（约 2025-10 → 2026-06+）

```
v0.1  编辑器 MVP（TipTap + 多模块 + 拖拽 + 预览 + ErrorBoundary）
v0.2  Automerge 实时协作（分享链接 / 远程光标 / 离线合并）
v0.3  PDF 导出 + 账号体系
v0.5  ATS 优化引擎 + Dashboard
v0.6  版本历史 + LLM 修复应用
v0.8  求职 Tracker（看板 + 列表）
v0.9  完整外观配置 + 移动端导出体验演进
v1.0  模板中心 / 工作台 / 可视化编辑器（主链路齐备里程碑）
v1.1  划词 AI 改写（5 动作、多候选）
v1.2  JD 派生简历（两阶段、事实保护、后台任务、血缘树）
之后  协作字段级同步 / 富文本 Yjs 等深化
```

节奏：**先能写 → 能协作/导出 → AI 过 ATS → 管投递 → 模板产品化 → JD 工作流闭环**。

### 5. 已实现能力地图

1. **简历编辑**：12 模块 Schema 表单；拖拽顺序与显隐；TipTap 富文本；并排实时预览；外观工具栏  
2. **离线 / 云端**：未登录可用 IndexedDB；登录后同步 `resume_config`  
3. **协作**：分享链接、在线成员、页面远程光标、跟随模式 UI 同步；CRDT 自动合并  
4. **导出**：A4 智能分页 PDF；Word；预览与导出共用运行时  
5. **ATS / AI**：五维评分；字段级 suggestions；Issue-fix 对比应用；划词 5 动作改写  
6. **JD 派生**：解析关键词 → 克隆 → 白名单改写 → 匹配度与血缘；后台任务  
7. **模板**：官方 6 套 + 社区/我的；Manifest 驱动 Runtime；可视化编辑与绑定  
8. **Tracker**：投递状态看板 + 列表检索 + 详情抽屉（阶段 / 面试轮次）  
9. **历史**：云端版本快照时间线；非破坏性恢复  

### 6. 技术难点（简历可抽用）

| 难点 | 做法 |
|------|------|
| 多人并发不互相覆盖 | Automerge CRDT + Supabase Realtime；本地 IndexedDB |
| 富文本同段并发 | 会话内 Yjs + TipTap Collaboration；HTML 镜像回 Automerge |
| ATS「只打分不落地」 | 结构化 JSON findings + path 级 suggestions，人确认后写回 |
| 预览 ≈ 导出 | 模板 Runtime + 分页壳 + react-to-print |
| 模板与内容纠缠 | Manifest / binding 与简历 JSON 解耦 |
| JD 改写误伤事实 | 两阶段生成 + 字段白名单 + 人审对比 |
| 密钥与安全 | Edge `llm-proxy`；划词展示侧 HTML 净化 |

### 7. 诚实边界（写简历必读）

- 个人/开源项目，**勿写虚假 DAU、付费转化、企业客户数**  
- 协作「不冲突」指 CRDT 收敛；早期富文本粒度问题后续用字段级写入 / Yjs 补强——可写「演进」，勿写「零问题」  
- Tracker 宣传文案与代码状态列略有粒度差，以「已保存→投递→筛选→面试→录用」实现为准  
- 移动端独立打印窗口等为演进项，主能力写「分页壳 + 浏览器打印 PDF」即可  

---

## 二、分述 · 能力要点（速查表）

| 维度 | 内容 |
|------|------|
| 产品定位 | 智能简历创作 + 求职管理一站式（编辑 / 模板 / AI / 协作 / 追踪 / 导出） |
| 编辑内核 | TipTap + Zod Schema 多模块 + Zustand + 实时预览 |
| 协作 | Automerge CRDT · Supabase Realtime · IndexedDB；后续 Yjs 富文本 |
| AI | ATS 五维结构化评估 · Issue-fix · 划词改写 · JD 解析/改写/派生 |
| 模板 | Manifest 运行时 · 6 官方模板 · 工作台与可视化编辑 · binding |
| 求职 | Tracker 看板/列表 · 版本历史快照 · PDF/Word |
| 工程文化 | Superpowers：brainstorm → spec → plan → 验证（`docs/superpowers/`） |
| 技术栈 | React19 · TS · Vite · Zustand · TipTap · Automerge/Yjs · Supabase · DeepSeek |

---

## 三、简历可粘贴写法（多版本）

> 标题行建议：  
> **GResume 智能简历创作与求职管理平台** | 个人项目 · 全栈前端 | 2025.10 – 2026.06  
> 或：  
> **智能简历平台（GResume）** | React / TipTap / CRDT / LLM | 个人项目

---

### 写法 1：紧凑 4 条（一页纸极简）

**GResume 智能简历平台** | React / TipTap / Supabase | 个人项目

- 业务问题：求职需同时过人审与 ATS，内容、模板、优化、投递分散，缺少一站式工具
- 编辑内核：落地 Schema 驱动多模块编辑器 + TipTap 富文本 + 实时预览与 A4 分页导出
- AI 闭环：ATS 五维结构化评分与可执行修复；划词改写；JD 驱动派生简历（事实字段保护）
- 协作与求职：Automerge CRDT 实时共编；模板与内容解耦；投递看板 + 版本历史

---

### 写法 2：标准 4 条（通用推荐）

**GResume · 智能简历创作与求职管理平台** | React19 / TipTap / CRDT / LLM | 个人项目

- 全链路产品：独立设计并实现「编辑 → 模板 → AI 优化 → 协作 → 投递追踪 → 导出」一站式平台，离线优先、登录后云同步
- 编辑与导出：TipTap 富文本 + Zod/RHF 多模块表单；模板 Manifest 与内容解耦；预览与 PDF 共用运行时保证所见即所得
- AI 应用：经 Edge Function 代理 DeepSeek，落地 ATS 结构化诊断（扫描与写入分离）、划词多候选改写、JD 两阶段派生与血缘管理
- 实时协作：基于 Automerge CRDT + Supabase Realtime，支持分享链接、远程光标与离线合并；后续叠加富文本 Yjs 字符级共编

---

### 写法 3：突出 AI / LLM 应用（投 AI 应用 / 智能化前端）

**GResume · AI 驱动简历优化与 JD 派生** | Prompt · 结构化输出 · Agent 工作流 | 个人项目

- 工程理念：模型负责判定与生成，工程负责编排、校验、人在回路写回；密钥经 `llm-proxy` 不出前端
- ATS 闭环：一次结构化扫描产出五维分 + findings + path 级 suggestions，Issue-fix 对比确认后写入，避免「只打分不落地」
- 双入口改写：Optimize 整份修复 vs 编辑器划词（STAR/量化/强动词/润色/JD 靠拢）多候选应用，能力复用同一网关
- JD 工作流：解析关键词 → 克隆底稿 → 白名单字段改写 → 匹配度与血缘树；后台任务可续跑；配套 Superpowers spec/plan 研发纪律

---

### 写法 4：突出架构 / 协作 / 复杂前端（投前端架构 / 协同编辑）

**GResume · 离线优先简历编辑器与实时协作** | Automerge / Yjs / 状态驱动预览 | 个人项目

- 数据架构：简历内容、模板 Manifest、外观配置三分离；Zustand + RHF 字段级同步；预览订阅同一数据源实时重渲染
- 协作底座：Automerge 文档 CRDT + 自研 Supabase NetworkAdapter；presence/光标/UI 跟随与文档通道解耦
- 正确性演进：字段级 diff 写入避免跨字段误覆盖；富文本会话内 Yjs 字符级合并，HTML 镜像供预览/PDF 零改消费方
- 工程化：文件路由页面模块化；Vite 分包（tiptap/automerge/supabase）；全局 ErrorBoundary；大量 dated spec/plan 驱动迭代

---

### 写法 5：量化 / 关键词向（ATS 简历筛词友好）

**智能简历平台 GResume** | 个人项目 · 2025.10–2026.06

- 产品广度：12 模块编辑 · 6 官方模板 · ATS 五维优化 · JD 派生 · CRDT 协作 · 投递看板 · 版本历史 · PDF/Word
- 架构能力：离线 IndexedDB + 云端 Supabase；模板 Runtime；分页导出；LLM Edge 代理
- 工程能力：React19 · TypeScript · TipTap · Automerge/Yjs · Zustand · Zod · DeepSeek
- 关键词：富文本编辑器 · CRDT · 实时协作 · Prompt 工程 · ATS · 求职 SaaS

---

### 写法 6：申请表 / 项目简述栏

**项目名称**：GResume 智能简历创作与求职管理平台  
**类型**：个人独立项目（设计 + 实现）  
**周期**：2025.10 – 2026.06（持续迭代）

- 产出目标：把简历写作、模板、AI 优化、协作与投递管理收成一站式 Web 应用  
- 本人工作：独立完成产品设计、前端架构、协作与 AI 链路、模板系统与求职 Tracker  
- 关键设计：离线优先；ATS 扫描与写回分离；JD 派生事实字段保护；内容与模板解耦  
- 技术栈：React · TypeScript · TipTap · Automerge/Yjs · Supabase · DeepSeek · Vercel  

---

### 写法 7：极短「经历下挂一条」（塞进实习/校园经历末）

同期个人项目 GResume：独立打造智能简历平台（TipTap 编辑 + Automerge 协作 + ATS/划词/JD 派生 AI + 模板工作台 + 投递看板），离线优先并经 Supabase 云同步与 PDF 导出。

---

### 选用建议

| 简历情况 | 推荐写法 |
|----------|----------|
| 项目经历常规前端岗 | **写法 2** |
| 投 AI / LLM / 智能化 | **写法 3** |
| 投协同编辑 / 复杂状态 / 架构 | **写法 4** |
| 一页纸极简 | 写法 1 或 5 |
| 网申简述栏 | 写法 6 |
| 实习经历下附带 | 写法 7 |

**与实习条目关系**：本条是 **个人项目**，可与「滴滴商旅前端实习」「AI 监控降噪」并列；投 AI 岗时可把写法 3 紧挨降噪条目形成「产品 AI + 告警 AI」组合。

---

## 四、标题与技术栈一行备选

```
GResume 智能简历创作与求职管理平台 | React · TipTap · Automerge · Supabase · LLM | 个人项目 | 2025.10–2026.06
```

```
智能简历平台（GResume） | 全栈前端 / AI 应用 | 个人项目
```

```
GResume | Offline-first Resume OS · CRDT Collab · ATS/JD AI | Personal Project
```

---

_整理日期：2026-07-30_  
_面试详版：`resume-builder-面试卡片.md`_  
_产品说明：仓库 `README.md` + 应用内更新日志_
