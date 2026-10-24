# 技术架构

## 技术栈

依赖版本以根目录 `package.json` 和 `pnpm-lock.yaml` 为准，避免在此重复维护易过期的版本号。

- **前端**：React、TypeScript、Vite、React Router DOM
- **UI**：Ant Design、Tailwind CSS、Framer Motion、Lucide React
- **状态**：Zustand
- **云服务**：Supabase Auth、Postgres 数据库、Edge Functions 和 Realtime（按功能使用）
- **数据处理**：xlsx、Recharts、React JSON Schema Form

## 主要目录

```
src/
├── components/   # UI 与业务组件
├── data/         # 闪卡、面经及静态内容
├── hooks/        # React hooks 与同步 provider
├── lib/          # Supabase、LLM 等客户端集成
├── pages/        # 路由页面
├── store/        # Zustand stores 与持久化适配器
├── types/        # TypeScript 类型
└── utils/        # 通用工具
supabase/
├── functions/    # Edge Functions
└── migrations/   # 数据库迁移
```

## 路由

路由定义见 `src/App.tsx`，目前主要包括：

| 路径 | 功能 |
|------|------|
| `/` | 首页 |
| `/core`, `/core/:chapterId` | 前端基础闪卡 |
| `/projects`, `/projects/:projectId` | 项目面试资料 |
| `/mpx`, `/mpx/:chapterId` | MPX 学习资料 |
| `/interview`, `/interview/:companyId/:departmentId/:sessionId` | 面经管理 |
| `/campus` | 校招岗位 |
| `/resume` | 简历工具 |
| `/ai`, `/ai/:projectId`, `/ai/github-trending` | AI 资源 |
| `/custom`, `/favorites`, `/llm-handbook`, `/rjsf`, `/preview/card-image` | 辅助功能 |

## 状态与持久化

- Zustand stores 管理闪卡进度、收藏、自定义卡片、面经、岗位、简历和界面状态。
- 持久化介质按 store 选择 `localStorage` 或 IndexedDB；面经 store 优先使用 IndexedDB，并保留 localStorage 兼容和迁移路径。
- 登录用户的学习、面经、简历和岗位数据通过对应的同步 hooks/providers 与 Supabase 同步。
- 云端服务不可用时的降级行为因功能而异，修改同步逻辑时应检查对应 store、provider 和数据库 migration。

## 开发与构建

使用 `pnpm`（版本见 `package.json`）：

```bash
pnpm dev
pnpm lint
pnpm build
pnpm preview
```

Vite 生产构建输出到 `dist/`；部署配置见根目录配置文件。
