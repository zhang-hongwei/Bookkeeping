#!/bin/bash
# Post Tool Use Tracker - 追踪文件修改历史

set -e

# 获取工具使用信息
TOOL_NAME="${CLAUDE_TOOL_NAME:-unknown}"
FILE_PATH="${CLAUDE_TOOL_USE_FILE_PATH:-unknown}"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# 日志文件
LOG_DIR=".claude/.logs"
LOG_FILE="$LOG_DIR/file-modifications.log"

# 创建日志目录
mkdir -p "$LOG_DIR"

# 记录修改
echo "[$TIMESTAMP] $TOOL_NAME: $FILE_PATH" >> "$LOG_FILE"

# 只保留最近 100 条记录
if [ -f "$LOG_FILE" ]; then
    tail -n 100 "$LOG_FILE" > "$LOG_FILE.tmp"
    mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

exit 0
