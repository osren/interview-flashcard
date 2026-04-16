# Design: 统一卡片格式实现方案

## 核心思路

复用现有的 `ImportExportModal` 组件和 `useInterviewStore`，将动态问题管理能力扩展到 Core/Projects/Algorithms 模块。

## 实现方案

### 1. 统一 Store 设计

创建 `useDynamicCardStore` 处理所有模块的动态数据：

```typescript
interface DynamicCardData {
  module: 'core' | 'projects' | 'algorithms';
  chapterId: string;
  cards: FlashCard[];  // 与静态数据合并后的结果
}
```

- 加载时：先加载静态数据，再加载 localStorage 中的用户修改
- 保存时：用户的增删改保存在 localStorage
- 导出时：合并静态 + 动态数据导出

### 2. 复用现有组件

| 组件 | 复用方式 |
|------|----------|
| `ImportExportModal` | 直接复用，传入不同数据源 |
| `QuestionSelector` | 包装为通用题号选择器 |
| `CardEditor` | 复用 MDEditor 编辑逻辑 |

### 3. 页面改造

各模块页面增加：
- Import/Export 按钮（调用 ImportExportModal）
- 添加问题按钮（打开编辑弹窗）
- 编辑答案功能（复用 FlashCard 的编辑模式）
- 题号选择弹窗（复用 InterviewDetail 的题号选择器）

### 4. 数据结构

```typescript
// localStorage 存储结构
interface UserCardData {
  core: { [chapterId: string]: FlashCard[] };
  projects: { [projectId: string]: FlashCard[] };
  algorithms: { [type: string]: FlashCard[] };
}
```

## 文件变更

需要修改的文件：
- 新增 `src/store/useDynamicCardStore.ts`
- 修改 `src/pages/Core/CoreChapter.tsx` - 添加 Import/Export
- 修改 `src/pages/Projects/ProjectDetail.tsx` - 添加题号选择等
- 修改 `src/pages/Algorithms/AlgorithmDetail.tsx` - 添加题号选择等
- 新增 `src/components/QuestionSelector.tsx`（如果需要抽离）
- 修改 `src/components/ImportExportModal.tsx` - 支持多模块