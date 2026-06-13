## Why

当前AI资讯模块缺少对GitHub热门项目的实时追踪。GitHub Trending是了解开源社区最新技术趋势的重要来源，但目前无法在系统中查看每月的Trending以及每周的Trending数据。用户希望能够有一个模块展示GitHub热门项目，并且能够获取项目README，快速了解项目的工作流和解决的问题。

## What Changes

1. 新增GitHub Trending模块，支持Tab切换查看每月/每周Trending
2. 定时（每周）抓取GitHub Trending数据并存储
3. 展示Trending项目列表，仿照github.com/trending UI风格
4. 为每个Trending项目生成介绍卡片，包含README核心信息和链接
5. 记录数据获取时间，支持刷新

## Capabilities

### New Capabilities
- `github-trending`: GitHub Trending热门项目展示模块

### Modified Capabilities
- 无

## Impact

- 新增数据源：`src/data/ai/github-trending.ts`
- 新增页面：`src/pages/AI/GithubTrending.tsx`
- 更新 `AIIndex.tsx`：添加入口
- 更新路由配置
- 外部依赖：GitHub Trending抓取