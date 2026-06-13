## Why

GitHub Trending 榜单会定期更新刷新，导致之前编辑过 note 的项目条目从列表中消失，用户之前写的笔记也随之中丢失。通过将编辑过笔记的条目同步至收藏模块，使用户即使在榜单刷新后仍能在收藏夹中找到并继续编辑之前的笔记。

## What Changes

- **新增收藏模块**：在 Trending 列表页面增加"收藏"功能，允许用户将编辑过笔记的 Trending 项目保存到收藏夹
- **收藏夹持久化**：收藏数据保存至 localStorage，跨刷新周期持久化存储
- **收藏夹独立页面**：新增收藏夹页面展示所有已收藏的项目及其笔记
- **收藏状态同步**：自动将用户编辑过 note 的项目标记为已收藏（可选），或提供手动收藏按钮

## Capabilities

### New Capabilities

- `trending-favorites`: GitHub Trending 收藏模块，支持将条目添加/移除收藏，显示已收藏项目的笔记

### Modified Capabilities

（无）

## Impact

- 新增 `src/pages/AI/Favorites.tsx` 收藏夹页面
- 修改 `TrendingList.tsx` 增加收藏按钮逻辑
- 修改路由配置添加 `/favorites` 路径
- 新增 `favorites` 数据存储到 localStorage