# Tasks: 项目管理功能实现任务

## Task List

### Phase 1: Store 层

- [x] **T1** 创建 `src/store/useProjectStore.ts`
  - 定义 Project 接口
  - 实现自定义项目管理（增删改）
  - 持久化到 localStorage

### Phase 2: 页面改造

- [x] **T2** 修改 `src/pages/Projects/ProjectsIndex.tsx`
  - 导入 useProjectStore
  - 合并渲染静态项目 + 自定义项目
  - 添加新增项目按钮（右下角悬浮按钮）
  - 项目名称支持点击编辑
  - 添加删除项目功能

### Phase 3: 卡片页适配

- [x] **T3** 修改 `src/pages/Projects/ProjectDetail.tsx`
  - 支持自定义项目标题显示

### Phase 4: 测试验证

- [x] **T4** 测试新增项目功能
- [x] **T5** 测试编辑项目名称
- [x] **T6** 构建验证通过

## 实现总结

已完成以下功能：

| 功能 | 状态 |
|------|------|
| 新增项目按钮 | ✅ 右下角悬浮按钮 |
| 新增项目弹窗 | ✅ 支持名称、描述、图标、标签 |
| 编辑项目名称 | ✅ 悬停显示编辑图标 |
| 删除项目 | ✅ 悬停显示删除图标 |
| 自定义项目卡片页 | ✅ 显示自定义标题和图标 |
| 数据持久化 | ✅ localStorage |