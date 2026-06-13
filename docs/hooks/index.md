# Hooks 机制

## 概述

本目录包含 Claude Code hooks 配置，用于自动化检查和验证。

## 目录结构

```
hooks/
├── index.md           # 本文件 - Hook 机制总览
├── post-action.md     # 写后的自动检查
└── cr-checklist.md  # CR 检查清单
```

## Hook 类型

### PostToolUse Hooks

在文件写入后自动触发检查：
- invariant-check.sh - 不变量规则检查
- spec-sync-check.sh - 规范一致性检查

### 运行时 Hooks

暂无后端运行时依赖

### 工作流门禁

- `/oh:apply` - 执行时验证
- `/oh:verify` - 独立验收
- `/oh:review` - 综合 review

### 检查清单

- `.claude/settings.json` 中配置的 CR 触发器