# Claude Code Hooks 与代码评审清单

## 写后检查

`.claude/settings.json` 配置 PostToolUse 写后检查，运行 `docs/engineering/linters/invariant-check.sh`。该脚本是快速提示；提交前仍应根据改动运行 `pnpm lint`、`pnpm build` 等相关命令。

详细说明见 [`post-action.md`](./post-action.md)。

## 代码评审

提交前自查见 [`cr-checklist.md`](./cr-checklist.md)。新需求工作流统一使用 OpenSpec，见 [`docs/guides/OpenSpec工作流程指南.md`](../guides/OpenSpec工作流程指南.md)。
