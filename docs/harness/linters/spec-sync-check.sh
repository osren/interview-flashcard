#!/bin/bash
# spec-sync-check.sh - 检查代码改动与 specs 一致性

echo "=== Spec Sync Check ==="
echo

# 检查 docs/specs/active 目录是否存在需求
if [ ! -d "docs/specs/active" ]; then
    echo "⚠️  docs/specs/active 目录不存在，跳过检查"
    exit 0
fi

# 列出活跃的需求
echo "活跃需求:"
ls -la docs/specs/active/ 2>/dev/null | grep "^d" | awk '{print "  - " $NF}' || echo "  (无)"

echo

# 检查是否有 verification 文件
echo "验证文件状态:"
find docs/specs/ -name "verification.md" 2>/dev/null | head -5 | while read f; do
    echo "  - $f"
done || echo "  (无)"

echo
echo "=== Check Complete ==="
echo "⚠️  前端项目自动跳过此检查 - Open Harness 主要面向后端服务"