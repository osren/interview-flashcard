# Linters - 代码检查工具

## 入口

本目录包含代码检查和验证脚本：

- `index.md` - 本文件
- `invariant-check.sh` - 运行时检查脚本
- `spec-sync-check.sh` - 规范一致性检查脚本

## 使用说明

### invariant-check.sh

检查代码是否符合 harness 不变量规则：

```bash
bash docs/harness/linters/invariant-check.sh
```

### spec-sync-check.sh

检查代码改动与 specs/verification 一致性：

```bash
bash docs/harness/linters/spec-sync-check.sh
```

### 在 Claude Code 中使用

通过 `.claude/settings.json` 配置 PostToolUse hooks 自动触发检查。