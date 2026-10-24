# 基础设施说明

## 应用形态

InterviewFlash 是以 Vite 构建的 React 单页应用，部署静态前端资源；项目同时集成 Supabase 云服务，提供认证、数据库同步及 AI Edge Functions 等能力。具体功能依赖 Supabase 项目配置和已部署的迁移/函数。

## 数据持久化

- 闪卡进度、学习状态及多种界面状态使用浏览器本地持久化。
- 面经 store 优先使用 IndexedDB，并保留 localStorage 兼容路径。
- 已登录用户的简历、面经、学习进度和岗位相关数据按功能同步至 Supabase。
- 不应笼统假设所有数据只存于 localStorage；以对应 store、sync provider 和 Supabase 迁移为准。

## Supabase

- 前端连接参数通过 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 配置。
- 数据库迁移位于 `supabase/migrations/`。
- Edge Functions 位于 `supabase/functions/`，使用 `pnpm` 中定义的 Supabase 脚本部署。
- 未配置或服务不可用时，部分功能会退回本地模式；逐功能核实降级行为。

## 常用命令

```bash
pnpm dev
pnpm build
pnpm lint
pnpm preview
```

前端生产构建输出到 `dist/`。托管环境配置见仓库根目录的部署配置文件。
