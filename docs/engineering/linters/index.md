# 代码检查工具

本目录保留工程约束的快速检查脚本。

## invariant-check.sh

可手动运行：

```bash
bash docs/engineering/linters/invariant-check.sh
```

Claude Code 也会在文件写入后运行该脚本。它是尽早发现问题的提示，不是完整验收；提交前仍应运行与改动相关的 lint、build 和 OpenSpec 验证。
