#!/bin/bash
# Type Check Hook - 会话结束时运行 TypeScript 类型检查

set -e

echo "🔍 运行 TypeScript 类型检查..."

# 执行类型检查
pnpm type-check

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo "✅ 类型检查通过"
else
    echo "❌ 类型检查失败 (退出码: $exit_code)"
fi

exit $exit_code
