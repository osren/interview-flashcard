# 工程约束与项目规则

本目录记录 InterviewFlash 长期有效的工程约束。这里的规则独立于需求变更工具；功能变更统一使用根目录 `openspec/` 中的 OpenSpec 工作流。

## 目录结构

```
engineering/
├── index.md
├── invariants/       # 业务与工程不变量
├── architecture/     # 架构约束
├── infrastructure/   # 本地与云端基础设施
└── linters/          # 手动/自动代码检查
```

## 使用方式

开始改动前读取本索引及与改动相关的规则；不需要为无关模块全量加载文档。规则必须与当前实现保持一致，发现过期内容时同步修订。

## 工程约束

- TypeScript 使用严格模式；避免 `any`，优先定义明确类型。
- React 组件 Props 应有明确类型。
- `useEffect` 依赖应完整。
- 前端和 Supabase 边界、数据持久化及同步行为以实际代码和迁移为准。

详细规则见 `invariants/`、`architecture/`、`infrastructure/` 和 `linters/`。
