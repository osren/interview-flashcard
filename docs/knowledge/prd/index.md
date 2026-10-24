# 需求与变更索引

新功能和重要行为变更统一使用仓库根目录的 OpenSpec 工作区：

- `openspec/changes/` — 进行中的变更
- `openspec/specs/` — 当前能力规格（逐步随变更归档建立）
- `openspec/changes/archive/` — 已完成变更的历史记录

使用 Claude Code 时，从 `/opsx:explore`（需求尚未收敛时）或 `/opsx:propose` 开始，随后用 `/opsx:apply` 实施，并在完成核验后 `/opsx:archive`。

`docs/specs/` 仅保存旧流程的历史记录，不再创建新需求。
