# Proposal: 项目复盘新增项目管理功能

## 问题背景

当前项目复盘模块（Projects）只包含两个静态项目：
- 滴滴企业版（didi）
- GResume 智能简历（gresume）

用户希望能够：
1. 在项目列表页新增自定义项目
2. 点击进入项目后是卡片形式（已有）
3. 可以编辑每个项目的名称

## 当前实现

- 数据来源：`src/data/projects/index.ts` - 静态导出 `projectChapters`
- 页面：`ProjectsIndex.tsx` - 渲染静态项目列表
- 卡片页：`ProjectDetail.tsx` - 已支持新增问题功能

## 目标

1. ProjectsIndex 支持新增项目按钮
2. 新增项目后显示在项目列表中
3. 可以编辑项目名称
4. 项目数据保存在 localStorage 中

## 非目标

- 不修改现有的静态数据结构
- 不删除已有的项目卡片数据