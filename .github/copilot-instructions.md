# Copilot Instructions for InterviewFlash

## Big picture (read first)
- 这是一个纯前端静态数据驱动的 React + TypeScript + Vite 项目；没有后端 API、没有服务层。
- 路由在 [src/App.tsx](../src/App.tsx) 统一定义：`/core`、`/projects`、`/algorithms` 三大模块 + 详情页。
- 数据源在 `src/data/**`，页面通过 `chapterId`/`type` 过滤卡片并渲染，不做远程请求。

## Data and flow conventions
- 卡片类型与状态定义在 [src/types/card.ts](../src/types/card.ts)；状态只用 `unvisited | forgotten | fuzzy | mastered`。
- 各模块入口使用聚合导出：
  - [src/data/core/index.ts](../src/data/core/index.ts)
  - [src/data/projects/index.ts](../src/data/projects/index.ts)
  - [src/data/algorithms/index.ts](../src/data/algorithms/index.ts)
- 新增卡片/章节时，必须同时更新对应 `index.ts` 聚合数组（否则页面无法发现新数据）。

## Store usage (important project-specific behavior)
- 全局状态使用 Zustand：
  - [src/store/useCardStore.ts](../src/store/useCardStore.ts)
  - [src/store/useProgressStore.ts](../src/store/useProgressStore.ts)
- `ProjectDetail` / `AlgorithmDetail` 走 `useCardStore` 的 `cards + currentIndex + next/prev`。
- `CoreChapter` 刻意使用本地 `useState` 管章节卡片（见 [src/pages/Core/CoreChapter.tsx](../src/pages/Core/CoreChapter.tsx)），避免章节切换时全局 store 异步更新带来的空白页问题。
- `useCardStore` 的 `persist.partialize` 只持久化 `id/status` 映射形态；改动该 store 时注意持久化兼容性。

## UI/component patterns
- UI 原子组件在 [src/components/ui](../src/components/ui)；优先复用 `Button`/`Badge`/`Progress`，不要重复造样式。
- class 合并统一走 [src/utils/cn.ts](../src/utils/cn.ts)（`clsx`），避免手写字符串拼接。
- 卡片交互主组件是 [src/components/Card/FlashCard.tsx](../src/components/Card/FlashCard.tsx)：
  - 本地 `isFlipped` 控制翻转
  - 切卡时通过 `useEffect([card.id])` 重置翻转
  - `onStatusChange` 由页面层处理并决定是否自动下一题

## Routing and ID contracts
- `projects` 模块依赖固定 `projectId`（当前有 `didi`、`gresume`，见 [src/pages/Projects/ProjectDetail.tsx](../src/pages/Projects/ProjectDetail.tsx)）。
- `algorithms` 模块依赖固定 `type`（`coding`/`concept`/`scenario`，见 [src/pages/Algorithms/AlgorithmDetail.tsx](../src/pages/Algorithms/AlgorithmDetail.tsx)）。
- 修改这些 ID 时，必须同步更新：数据 `chapterId`、列表页入口、详情页标签映射。

## Build/lint workflow
- 开发：`npm run dev`
- 构建：`npm run build`（先 `tsc` 再 `vite build`，严格 TS 配置会拦截无用变量/参数）
- 预览：`npm run preview`
- Lint：`npm run lint`
- 当前未配置单元测试；不要假设有 Jest/Vitest 流程。

## TS/path/style baseline
- 路径别名 `@/* -> src/*` 配置在 [tsconfig.json](../tsconfig.json) 与 [vite.config.ts](../vite.config.ts)。
- 样式是 Tailwind-first，主题色 `primary` 在 [tailwind.config.js](../tailwind.config.js)。
- 这个仓库中 `SPEC.md` / `TECH_DOC.md` 含历史设计草案，代码改动以 `src/**` 实际实现为准。