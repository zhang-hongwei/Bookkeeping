#!/bin/bash
# Test Runner Hook - 检测并提示运行相关测试

set -e

# 获取修改的文件路径
FILE_PATH="${CLAUDE_TOOL_USE_FILE_PATH:-}"

if [ -z "$FILE_PATH" ]; then
    echo "ℹ️ 无法确定文件路径，跳过测试检测"
    exit 0
fi

echo "🧪 检测到文件修改: $FILE_PATH"

# 检查是否有对应的测试文件
TEST_FILE="${FILE_PATH%.*}.test.${FILE_PATH##*.}"

if [ -f "$TEST_FILE" ]; then
    echo "💡 提示: 发现对应的测试文件: $TEST_FILE"
    echo "   运行测试: pnpm test --run '$TEST_FILE'"
else
    echo "ℹ️ 未找到对应的测试文件"
fi

exit 0
