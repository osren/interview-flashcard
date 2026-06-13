## Context

当前AI资讯模块需要新增GitHub Trending展示功能。GitHub Trending页面(github.com/trending)没有官方API，需要解决数据获取问题。

## Goals / Non-Goals

**Goals:**
- 实现GitHub Trending数据展示，支持Tab切换每月/每周
- 定时获取并存储数据（每周）
- 展示项目信息（名称、描述、star、fork）
- 生成项目介绍卡片，包含README核心信息

**Non-Goals:**
- 不实现后端定时任务（前端应用，无法后台运行）
- 不实现代码搜索、语言筛选等过滤功能

## Decisions

### D1: 数据获取方案

**选择：** 使用 GitHub 官方搜索 API 模拟 Trending

**备选方案：**
| 方案 | 优点 | 缺点 |
|-----|-----|-----|
| GitHub 搜索 API | 官方 API，稳定可靠，无依赖 | 非真正 Trending（按创建时间和 stars 排序） |
| 第三方 trending API | 数据源自真实页面 | 服务不稳定，常失效 |
| RSS 订阅源 | 稳定 | 数据不完整 |

**最终选择：** 使用 `https://api.github.com/search/repositories`
- 查询条件：`created:>{date} stars:>100`，按 stars 排序
- 每周：7 天内创建的项目
- 每月：30 天内创建的项目
- 限制返回 10 条

### D2: 数据存储方案

**选择：** 本地JSON + localStorage缓存

**备选：**
- 直接请求不存储（实时但慢）
- localStorage（持久化但有大小限制）
- IndexedDB（更大存储空间）

**结论：** 使用localStorage缓存，首次从data/ai目录的静态文件读取，无数据时提示手动刷新

### D3: README获取方案

**选择：** 使用GitHub Raw API获取README.md

**备选：**
- 使用GitHub API的readme端点
- 直接请求raw.githubusercontent.com

**结论：** 使用 `https://raw.githubusercontent.com/{owner}/{repo}/main/README.md`

### D4: UI风格

**选择：** 仿照github.com/trending的简洁列表风格

**布局：**
- 顶部Tab切换（每周/每月）
- 列表展示：项目名 | 描述 | star数 | fork数
- 点击展开显示README摘要

### D5: README摘要编辑

**选择：** 用户可编辑保存摘要到 localStorage

**功能：**
- 自动从 README 提取工作流和解决的问题
- 用户可手动编辑保存
- 数据持久化到 localStorage

### D6: PDF 附件

**选择：** 支持为每个项目附加 PDF

**功能：**
- PDF 以 Base64 存储在 localStorage
- 点击图标可附加/查看 PDF
- 每个项目独立保存

## Risks / Trade-offs

| 风险 | 缓解方案 |
|-----|---------|
| GitHub API限流 | 添加缓存，分散请求 |
| CORS跨域 | 使用后端代理或第三方API |
| 数据更新延迟 | 显示最后更新时间，支持手动刷新 |
| README获取失败 | 降级显示基本项目信息 |
| localStorage 大小限制 | Base64 PDF 有 5MB 限制 |