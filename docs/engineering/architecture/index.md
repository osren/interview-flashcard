# 架构约束

## 应用架构

- React + TypeScript 单页应用，由 Vite 构建。
- `src/App.tsx` 是路由定义的事实来源；`docs/knowledge/architecture.md` 提供当前路由和目录摘要。
- 页面组件按需懒加载；Supabase 集成通过 `src/lib/supabase/`、同步 hooks 和 Edge Functions 接入。

## 状态与数据

- Zustand 管理客户端状态。
- 持久化因数据类型使用 `localStorage` 或 IndexedDB；部分用户数据与 Supabase 同步。
- 修改持久化或同步行为时，检查对应 store、provider 和 `supabase/migrations/`。

## TypeScript 与 React

- TypeScript strict 模式开启，避免使用 `any`。
- React 组件 Props 应有明确类型。
- `useEffect` 依赖数组必须完整。
