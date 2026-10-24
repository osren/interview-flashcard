# 项目上下文

## 基本信息

- **项目模式**：brownfield，已有完整前端产品和 Supabase 云端能力。
- **业务领域**：面试准备、简历辅助和校招求职管理。
- **架构**：React 单页应用 + Supabase 托管后端服务。
- **主要技术**：TypeScript、React、Vite、Tailwind CSS、Zustand、React Router DOM、Supabase。
- 依赖版本以根目录 `package.json` 和 `pnpm-lock.yaml` 为准。

## 业务模块

- 闪卡学习：前端基础、项目经历、算法和 MPX。
- 面经管理：公司、部门、面试场次、题目与答案。
- 简历工具：简历资料、JD 优化和 AI 辅助功能。
- 校招岗位：岗位浏览、投递跟踪和用户岗位管理。
- AI 资源：AI 内容及 GitHub Trending。

## 数据与服务

- 浏览器本地状态按功能使用 `localStorage` 或 IndexedDB。
- Supabase 提供认证、数据同步和 Edge Functions；实际使用的表和函数见 `supabase/migrations/`、`supabase/functions/` 与对应前端 provider。
- 部分功能支持未登录或未配置云服务时本地使用，具体降级行为以实现为准。

## 变更工作流

使用根目录 `openspec/` 统一管理功能变更。`docs/specs/` 仅保留旧流程历史记录，不再作为活跃需求区。
