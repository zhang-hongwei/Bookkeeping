#!/bin/bash

# ================================================================
# File Change Tracker Hook
# Purpose: 追踪文件修改历史，提供上下文感知
# ================================================================

EDITED_FILE="${1:-$CLAUDE_EDITED_FILE}"
TOOL_NAME="${2:-$CLAUDE_TOOL_NAME}"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 追踪文件路径
TRACKING_FILE="$HOME/.claude/file-history.log"

# 确保追踪目录存在
mkdir -p "$(dirname "$TRACKING_FILE")"

# 记录文件变化
if [ -n "$EDITED_FILE" ]; then
    echo "[$TIMESTAMP] $TOOL_NAME: $EDITED_FILE" >> "$TRACKING_FILE"

    # 检测连续修改同一文件
    LAST_FILES=$(tail -5 "$TRACKING_FILE" | grep -o '[^ ]*$' | uniq -c | sort -rn)

    if echo "$LAST_FILES" | grep -q "5 "; then
        FILE_NAME=$(echo "$LAST_FILES" | grep "5 " | awk '{print $2}')
        echo ""
        echo "⚠️ 注意：文件 '$FILE_NAME' 已连续修改5次"
        echo "💡 建议：考虑运行测试或类型检查以验证更改"
        echo ""
    fi
fi

# 清理旧记录（保留最近1000条）
if [ $(wc -l < "$TRACKING_FILE") -gt 1000 ]; then
    tail -1000 "$TRACKING_FILE" > "$TRACKING_FILE.tmp"
    mv "$TRACKING_FILE.tmp" "$TRACKING_FILE"
fi