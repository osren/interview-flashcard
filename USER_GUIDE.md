# InterviewFlash 用户使用指南 / User Guide

---

## 中文指南

### 这是什么？

**InterviewFlash** 是一套面向前端 / AI 方向面试备考的闪卡学习工具，同时集成了简历管理、秋招投递追踪、面经库和 AI 辅助功能。你可以把它当作：

- 日常复习：**闪卡 + 进度追踪 + 打卡**
- 项目准备：**项目复盘卡片**
- 求职阶段：**简历 + 秋招投递看板**
- 临场前：**面经 + 口述稿 + JD 优化**

---

### 快速开始

#### 在线使用

直接打开部署地址（如 Vercel），无需安装，浏览器即可使用。

#### 本地运行

```bash
npm install
npm run dev
```

浏览器访问终端提示的本地地址（通常是 `http://localhost:5173`）。

---

### 界面导航

顶部 / 侧边栏主要入口：

| 入口 | 路径 | 用途 |
|------|------|------|
| 首页 | `/` | 总览进度、打卡日历、模块入口 |
| 核心考点 | `/core` | JS / TS / React / 浏览器等基础题 |
| MPX | `/mpx` | 滴滴小程序框架专项 |
| 项目复盘 | `/projects` | InterviewFlash、实习、GResume 等项目深挖 |
| 大模型开发手册 | `/llm-handbook` | RAG / Agent 等资源导航 |
| 简历 | `/resume` | PDF、口述稿、JD 优化、在线简历 |
| 秋招投递 | `/campus` | 投递进度、看板、职位管理 |
| 面经 | `/interview` | 各公司真实面试题 |
| AI 资讯 | `/ai` | AI 相关资讯与 Trending |
| 收藏 | `/favorites` | 重点卡片集中复习 |

右下角还有 **悬浮简历按钮**，可快速进入简历页。

---

### 闪卡怎么刷？

1. 进入任意模块（如 **核心考点**）→ 选择章节
2. **点击卡片**翻转，查看答案
3. 根据掌握程度标记状态（未掌握 / 模糊 / 已掌握等）
4. 使用 **筛选 / 搜索** 聚焦薄弱点
5. 重要题目点 **收藏**，在「收藏」页集中复习

首页的 **打卡日历** 会记录学习天数，帮助保持节奏。

---

### 各模块说明

#### 核心考点 / MPX / 项目复盘

- 按章节组织的闪卡
- 适合系统复习和考前冲刺
- 项目复盘侧重「能讲清楚、能追问」

#### 自定义卡片（`/custom`）

- 添加你自己的问答
- 适合补充个人经历、临时收集的面试题

#### 面经（`/interview`）

- 按公司 / 方向分类的真实面试题
- 配合闪卡模式复习

#### 简历（`/resume`）

四个 Tab：

| Tab | 功能 |
|-----|------|
| 在线简历 | 嵌入 506 Resume，可视化编辑简历 |
| PDF 简历 | 上传 / 预览 / 下载 PDF |
| 面试口述稿 | 编辑 5 分钟自我介绍 |
| JD 优化 | 选岗位 JD，AI 优化 Markdown 简历 |

**登录后**，PDF、口述稿、JD 优化版本会自动 **云端同步**（需 Supabase 已部署 `resume_sync` 表）。

#### 秋招投递（`/campus`）

四个 Tab：

| Tab | 功能 |
|-----|------|
| 求职进度 | 进度竞赛图、阶段提醒、终止原因统计 |
| 投递看板 | 按优先级管理投递状态 |
| 秋招职位 | 查看 / 编辑 / 删除岗位，标记投递进度 |
| 秋招岗位池 | 表格浏览大量内置岗位 |

竞赛图技巧：

- 悬停 **素质测评～Offer** 圆点 → 查看链接 / 时间
- 点击圆点 → 编辑阶段详情
- 右上角提醒 → 查看待办 / 已过期 / 已完成

**登录后**，投递进度、自定义岗位等会 **云端同步**。

#### 大模型开发手册

- 外部资源链接聚合
- 适合扩展 AI 相关知识面

#### AI 资讯

- AI 领域动态与 GitHub Trending
- 部分 AI 功能需登录并使用每日配额

---

### 登录与云端同步

点击右上角 **登录 / 注册**（基于 Supabase）。

登录后可用的能力包括：

- 学习进度、收藏、打卡 → 云端同步
- 秋招投递数据 → 云端同步
- 简历数据 → 在简历页自动同步
- AI 解释、JD 解析等 → 需登录 + 配额

未登录时数据保存在 **浏览器 localStorage**，换设备或清缓存会丢失。

| 数据类型 | 未登录 | 登录后 |
|----------|--------|--------|
| 闪卡进度 / 收藏 / 打卡 | 仅本地 | 云端同步 |
| 秋招投递 | 仅本地 | 云端同步 |
| 简历 PDF / 口述稿 / JD 版 | 仅本地 | 云端同步 |
| AI 功能 | 不可用 | 可用（有配额） |

---

### 推荐使用流程

#### 日常复习（30–60 分钟）

1. 首页看打卡 → 保持 streak
2. 刷 **核心考点** 20–30 张
3. 收藏不会的题
4. 复习 **项目复盘** 1 个章节

#### 投递季

1. 在 **秋招岗位池** 筛选目标公司
2. 加入 **秋招职位**，标记状态
3. 在 **竞赛图** 维护测评 / 面试链接与时间
4. 用 **JD 优化** 针对岗位改简历

#### 面试前 1–2 天

1. 看 **收藏** 里的薄弱题
2. 读 **面经** 对应公司题目
3. 练 **口述稿**
4. 过一遍 **项目复盘** 高频追问

---

### 常见问题

**Q：进度存在哪里？**  
A：默认浏览器本地；登录后自动同步到 Supabase 云端。

**Q：换电脑怎么恢复？**  
A：用同一账号登录，进入对应页面等待同步完成即可。

**Q：PDF 简历太大怎么办？**  
A：单文件限制 10MB；过多大文件可能影响同步速度。

**Q：内置秋招岗位能删吗？**  
A：可以隐藏，隐藏状态会同步到其他设备。

**Q：在线简历和 InterviewFlash 简历是一回事吗？**  
A：不是。在线简历是独立的 506 Resume 应用；PDF / 口述稿 / JD 优化才是 InterviewFlash 内置管理的数据。

---

### 本地开发命令

```bash
npm run dev      # 开发服务器
npm run build    # 生产构建
npm run preview  # 预览构建结果
npm run lint     # 代码检查
```

---

## English Guide

### What Is It?

**InterviewFlash** is an interactive flashcard system for frontend and AI interview prep. It combines:

- Daily study: **flashcards + progress tracking + streaks**
- Project prep: **deep-dive project cards**
- Job hunting: **resume tools + campus application tracking**
- Last-minute review: **interview Q&A + intro script + JD optimization**

---

### Quick Start

#### Use Online

Open the deployed URL (e.g. on Vercel) in any modern browser—no install required.

#### Run Locally

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (usually `http://localhost:5173`).

---

### Navigation

| Section | Path | Purpose |
|---------|------|---------|
| Home | `/` | Overview, streak calendar, module shortcuts |
| Core | `/core` | JS / TS / React / browser fundamentals |
| MPX | `/mpx` | Didi mini-program framework (MPX) |
| Projects | `/projects` | Project deep-dives (internship, side projects) |
| LLM Handbook | `/llm-handbook` | RAG / Agent resource links |
| Resume | `/resume` | PDF, intro script, JD optimization |
| Campus | `/campus` | Application tracking & job catalog |
| Interview | `/interview` | Real interview questions by company |
| AI News | `/ai` | AI news & GitHub trending |
| Favorites | `/favorites` | Bookmarked cards for review |

A **floating resume button** in the corner gives quick access to the Resume page.

---

### How to Use Flashcards

1. Open a module (e.g. **Core**) → pick a chapter
2. **Click a card** to flip and see the answer
3. Mark your mastery level (forgotten / fuzzy / mastered)
4. Use **filter / search** to focus on weak areas
5. **Favorite** important cards for later review

The **streak calendar** on the Home page tracks daily study habits.

---

### Module Overview

#### Core / MPX / Projects

- Chapter-based flashcards
- Best for systematic review and pre-interview cramming
- Projects module focuses on "can you explain it under follow-up questions?"

#### Custom Cards (`/custom`)

- Add your own Q&A
- Great for personal experience and ad-hoc questions

#### Interview (`/interview`)

- Real questions grouped by company / topic
- Use alongside flashcard mode

#### Resume (`/resume`)

| Tab | Feature |
|-----|---------|
| Online Resume | Embedded 506 Resume editor |
| PDF Resumes | Upload, preview, download PDFs |
| Intro Script | Edit your ~5-minute self-introduction |
| JD Optimize | AI-optimize Markdown resume against a job description |

When **logged in**, PDFs, intro script, and JD versions **sync to the cloud** (requires Supabase `resume_sync` table).

#### Campus Applications (`/campus`)

| Tab | Feature |
|-----|---------|
| Progress | Race chart, stage reminders, rejection stats |
| Dashboard | Priority-based application board |
| Jobs | Manage positions and application status |
| Job Pool | Browse built-in job catalog |

Race chart tips:

- **Hover** dots (Aptitude Test → Offer) to see links / times
- **Click** dots to edit stage details
- Top-right badge shows expired / todo / completed reminders

When **logged in**, application progress syncs across devices.

#### LLM Handbook & AI News

- Curated external resources and AI industry updates
- Some AI features require login and daily quota

---

### Login & Cloud Sync

Sign in via the top-right **Login / Register** button (Supabase auth).

After login:

- Learning progress, favorites, streaks → cloud sync
- Campus application data → cloud sync
- Resume data → syncs on the Resume page
- AI explain / JD parse → login + quota required

Without login, data stays in **browser localStorage** only.

| Data | Logged out | Logged in |
|------|------------|-----------|
| Card progress / favorites / streaks | Local only | Cloud sync |
| Campus applications | Local only | Cloud sync |
| Resume PDF / intro / JD versions | Local only | Cloud sync |
| AI features | Unavailable | Available (quota) |

---

### Suggested Workflows

#### Daily Review (30–60 min)

1. Check streak on Home
2. Review 20–30 **Core** cards
3. Favorite weak ones
4. One **Projects** chapter

#### Application Season

1. Filter targets in **Job Pool**
2. Add to **Jobs** and update status
3. Maintain links/times on the **race chart**
4. Run **JD Optimize** per role

#### 1–2 Days Before Interview

1. Review **Favorites**
2. Read **Interview** questions for that company
3. Practice **intro script**
4. Skim **Projects** follow-up questions

---

### FAQ

**Where is my progress stored?**  
Locally by default; synced to Supabase when logged in.

**How do I restore on a new device?**  
Log in with the same account and wait for sync on each relevant page.

**PDF size limits?**  
10 MB per file; many large PDFs may slow cloud sync.

**Can I remove built-in campus jobs?**  
Yes—they are hidden (not deleted) and sync across devices.

**Is "Online Resume" the same as InterviewFlash resume?**  
No. Online Resume is the separate 506 Resume app. PDF / intro / JD data is managed inside InterviewFlash.

---

### Dev Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Lint check
```
