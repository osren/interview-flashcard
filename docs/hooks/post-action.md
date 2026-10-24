# 写后检查

`.claude/settings.json` 为 `Write`、`Edit` 和 `MultiEdit` 工具配置 PostToolUse hook，调用 `docs/engineering/linters/invariant-check.sh`，快速扫描 TypeScript 的 `any` 使用并运行 `npx tsc --noEmit`。

该脚本输出仅作即时提示；它不替代 `pnpm lint`、`pnpm build` 或按变更规格执行的验收。OpenSpec 变更的完成核验和归档使用 OpenSpec 工作流，不再运行旧的 `spec-sync-check.sh`。
