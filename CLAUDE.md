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
 https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## OpenHarness 导航

### 目录导航

- `docs/harness/` - 约束规则（不变量、架构、基础设施）
- `docs/knowledge/` - 知识库（技术栈、项目上下文、需求）
- `docs/specs/` - 需求执行工作区
- `docs/hooks/` - Hooks 机制

### 关键约束速览

> 完整约束见 docs/harness/index.md

1. **TypeScript 禁止 any** - 必须使用具体类型
2. **组件 Props** - 必须定义接口类型
3. **useEffect 依赖** - 依赖数组必须完整

### 常用命令

```bash
/oh:propose <feature-name>  # 新需求提案
/oh:apply <feature>        # 执行需求
/oh:verify                # 独立验收
/oh:review                # 综合 review
/oh:archive              # 归档需求
/oh:status               # 项目状态
```

### Agent 工作规则

1. **每次任务开始前读取本文件**，了解项目概况
2. **harness 约束全量加载**：先读 `docs/harness/index.md`，再进入各子目录
3. **knowledge 知识库按需加载**：先读 `docs/knowledge/index.md`
4. **不确定的信息通过交互问答确认**，不捏造
5. **新需求开发必须先生成 proposal + spec + design 并审批 design**，再进入执行阶段

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
