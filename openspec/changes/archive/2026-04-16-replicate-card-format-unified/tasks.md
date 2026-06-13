# Tasks: 统一卡片格式实现任务

## Task List

### Phase 1: 组件层 (复用 InterviewDetail 的实现)

- [x] **T0** 分析现有代码结构
  - Core/Projects/Algorithms 已具备题号选择、导入导出、导航功能
  - 缺少：新增问题弹窗

### Phase 2: Core 模块

- [x] **T1** 修改 `src/pages/Core/CoreChapter.tsx`
  - 添加新增问题按钮（复用 InterviewDetail 的弹窗逻辑）
  - 连接 useCardStore.addCustomCard

### Phase 3: Projects 模块

- [x] **T2** 修改 `src/pages/Projects/ProjectDetail.tsx`
  - 添加新增问题按钮和弹窗

### Phase 4: Algorithms 模块

- [x] **T3** 修改 `src/pages/Algorithms/AlgorithmDetail.tsx`
  - 添加新增问题按钮和弹窗

### Phase 5: 测试验证

- [x] **T4** 验证构建成功

## 实现总结

已完成以下功能：

| 功能 | Core | Projects | Algorithms |
|------|------|----------|------------|
| 题号选择 | ✅ 已有 | ✅ 已有 | ✅ 已有 |
| 导入导出 | ✅ 已有 | ✅ 已有 | ✅ 已有 |
| 新增问题 | ✅ 新增 | ✅ 新增 | ✅ 新增 |
| 上下题切换 | ✅ 已有 | ✅ 已有 | ✅ 已有 |
| 答案编辑 | ✅ 已有 | ✅ 已有 | ✅ 已有 |

## Implementation Notes

- 使用 `useCardStore.addCustomCard` 添加卡片
- 复用 InterviewDetail 的新增问题弹窗 UI
- 传入正确的 module 和 chapterId 参数
- 保持各模块主题色一致（Core: orange, Projects: blue, Algorithms: green）
- 构建验证通过