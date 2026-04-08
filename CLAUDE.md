# CLAUDE.md

<!-- 候选人背景信息 - 每次会话自动加载 -->
<!-- 请在对话开始时阅读 CANDIDATE.md 了解候选人背景 -->

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**InterviewFlash** is an interactive flashcard system for frontend interview preparation. It contains three main modules:
- **Core**: Frontend fundamentals (JavaScript, TypeScript, React, Browser, Engineering)
- **Projects**: Deep-dive into candidate's projects (Didi internship, GResume)
- **Algorithms**: Coding problems, concept explanations, and system design scenarios
- **Interview**: Real interview questions and answers from companies

## 面试文档导入规范

当用户提交新的面试文档（docs 目录下的 .md 文件）时，应按以下规则处理：

### 文件命名格式
```
{公司名} - {部门/方向} - {面试轮次}.md
```

### 内容格式规范
- 题目：`## 1. 问题内容`
- 答案：`## 答案` 开头
- 分隔：题目间用 `---` 分隔

### 导入流程
1. 读取 docs 目录下的面试文档
2. 解析题目和答案内容
3. 转换为 FlashCard 格式
4. 导入到 `src/data/interview/` 目录对应文件中
5. 更新 `src/data/interview/index.ts` 导出

详见 `INTERVIEW_IMPORT_GUIDE.md`

## Commands

```bash
npm run dev      # Start development server
npm run build    # TypeScript check + production build
npm run preview  # Preview production build locally
npm run lint     # ESLint checking
```

## Tech Stack

- **React 18** with TypeScript (strict mode)
- **Vite 5** with `@` path alias (src → `@`)
- **Tailwind CSS 3** for styling
- **Zustand 4** for state management (with localStorage persistence)
- **Framer Motion 11** for animations
- **React Router DOM 6** for routing
- **Lucide React** for icons

## Architecture

### Directory Structure
```
src/
├── components/    # UI components (ui/, Card/, Layout/)
├── data/          # Static flashcard data (core/, projects/, algorithms/)
├── pages/         # Route pages (Core/, Projects/, Algorithms/)
├── store/         # Zustand stores (useCardStore, useProgressStore)
├── types/         # TypeScript interfaces (card.ts, chapter.ts, progress.ts)
└── utils/         # Utilities (cn.ts for className merging)
```

### Data Flow
Static data in `src/data/` → Zustand store → Components consuming via hooks

### Routing
```
/                        → Home
/core                    → CoreIndex (chapter list)
/core/:chapterId         → CoreChapter (flashcard practice)
/projects                → ProjectsIndex
/projects/:projectId     → ProjectDetail
/algorithms              → AlgorithmsIndex
/algorithms/:type        → AlgorithmDetail
```

### State Management
- `useCardStore`: Current card state, flip status, filtering, search, card progress
- `useProgressStore`: Overall learning progress
- Zustand `persist` middleware stores progress in `localStorage` under key `card-storage`

### Key Types
- `FlashCard`: `{ id, module, chapterId, question, answer, tags, status, difficulty?, codeExample?, extendQuestion? }`
- `CardStatus`: `'unvisited' | 'forgotten' | 'fuzzy' | 'mastered'`
- `Chapter`: `{ id, module, title, description, cardCount, cards }`

## Adding New Content

### Adding a new Core chapter
1. Create `src/data/core/[chapter-name].ts` exporting `FlashCard[]` and `Chapter`
2. Import and add to `src/data/core/index.ts`

### Adding project cards
1. Add to `src/data/projects/didi.ts` or `src/data/projects/gresume.ts`

### Adding algorithm problems
1. Add to `src/data/algorithms/index.ts` under appropriate category
