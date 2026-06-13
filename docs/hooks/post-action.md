# 写后自动检查

## invariant-check.sh

在文件写入后自动检查代码是否符合不变量规则。

### 检查内容

1. **TypeScript 类型检查**: 禁止 `any` 类型
2. **编译检查**: TypeScript 编译错误

### 执行方式

通过 `.claude/settings.json` 中的 PostToolUse hooks 自动触发。

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash docs/harness/linters/invariant-check.sh 2>&1 | head -30"
          }
        ]
      }
    ]
  }
}
```

## spec-sync-check.sh

检查代码改动与 specs/verification 一致性。

> 前端项目此检查自动跳过