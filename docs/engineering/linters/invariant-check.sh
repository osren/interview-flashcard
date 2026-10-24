#!/bin/bash
# invariant-check.sh - 检查代码是否符合不变量规则

echo "=== Invariant Check ==="
echo

# 检查 TypeScript 禁止 any
echo "检查: 禁止 any 类型..."
if grep -r ": any" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | grep -v "node_modules" | grep -v "// any" > /dev/null 2>&1; then
    echo "⚠️  发现使用了 any 类型:"
    grep -r ": any" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | grep -v "node_modules" | grep -v "// any" | head -5
else
    echo "✓ 未发现 any 类型"
fi

echo

# 检查 TypeScript 编译
echo "检查: TypeScript 编译..."
npx tsc --noEmit 2>&1 | head -20

echo
echo "=== Check Complete ==="