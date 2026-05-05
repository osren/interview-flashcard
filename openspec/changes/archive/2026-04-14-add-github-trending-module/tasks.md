## 1. Data Layer

- [x] 1.1 创建 `src/data/ai/github-trending.ts` 数据文件，包含 types 和示例数据
- [x] 1.2 定义 `TrendingProject` 类型：id, owner, repo, name, description, stars, forks, language, url, readme?
- [x] 1.3 在 `src/data/ai/index.ts` 导入并添加到 aiProjects 数组

## 2. API / Data Fetching

- [x] 2.1 修改 `fetchTrending` 使用 gh-trending-api 真实 API（`https://gh-trending-repos.onrender.com/repos?since=weekly&since=monthly`）
- [x] 2.2 修改缓存逻辑，缓存有效期改为 7 天（一周）
- [x] 2.3 限制返回数据为 10 条
- [x] 2.4 添加localStorage缓存逻辑
- [x] 2.5 实现 `fetchReadme(owner, repo)` 函数获取README内容

## 3. UI Components

- [x] 3.1 创建 `src/components/AI/TrendingCard.tsx` 单个项目卡片组件
- [x] 3.2 创建 `src/components/AI/TrendingList.tsx` 列表组件，支持Tab切换
- [x] 3.3 创建 `src/components/AI/TrendingSummary.tsx` README摘要展示组件（已集成到TrendingCard）

## 4. Pages

- [x] 4.1 创建 `src/pages/AI/GithubTrending.tsx` 主页面组件
- [x] 4.2 集成TrendingList组件和数据获取逻辑
- [x] 4.3 实现Tab切换、刷新、加载状态

## 5. Routing & Integration

- [x] 5.1 在路由配置中添加 `/ai/github-trending` 路由
- [x] 5.2 在 `src/pages/AI/AIIndex.tsx` 中添加入口卡片

## 6. Polish

- [x] 6.1 添加最后更新时间显示
- [x] 6.2 添加空状态和错误处理
- [x] 6.3 优化UI样式，仿照github.com/trending风格