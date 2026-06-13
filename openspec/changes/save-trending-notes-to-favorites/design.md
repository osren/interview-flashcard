## Context

当前 GitHub Trending 模块直接从 API 获取热门项目列表展示，用户在展开的 README 摘要区域可以编辑笔记（note），但笔记仅保存在 localStorage 的 `github-trending-summaries` key 下。当 Trending 榜单刷新时，原有的项目条目从列表中消失，用户即便 localStorage 中仍保留笔记，也无法通过界面访问。

## Goals / Non-Goals

**Goals:**
- 将用户编辑过笔记的 Trending 项目持久化保存到收藏夹
- 提供收藏夹独立页面查看所有已收藏项目及其笔记
- 支持从收藏夹移除已收藏项目

**Non-Goals:**
- 不做 GitHub API 级别的数据同步（仅展示本地收藏）
- 不支持从其他来源添加收藏（仅限 Trending 条目）
- 不实现项目对比或排序功能

## Decisions

1. **数据存储结构**: 收藏数据以 project.id 为 key，存储项目基本信息（name, owner, url, description, language, stars, forks）加上 note
2. **自动收藏策略**: 用户编辑 note 时自动将项目加入收藏夹，同时提供手动收藏按钮
3. **路由设计**: 在 `/ai` 下新增 `/ai/favorites` 路由展示收藏夹

## Risks / Trade-offs

- [风险] Trending 项目数据可能随时间变化（如 star 数量变化）
  - [缓解] 收藏时保存快照数据，显示时使用收藏时的快照，允许用户手动刷新
- [风险] localStorage 容量限制
  - [缓解] 仅存储基本信息+笔记，单条数据量小，可承载数千条收藏