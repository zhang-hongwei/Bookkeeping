#!/bin/bash
# 注意：不使用 `set -e` —— tsc 返回非零（项目有既有错误）时不能让脚本提前退出，
# 必须走到下方的「按修改文件过滤」逻辑再决定是否阻断。

# TSC Hook with Error Caching and Auto-resolver Integration
# Adapted for Next.js monorepo from aaa project
#
# 【放宽版】仅检查「本次修改的文件」是否引入新的 TypeScript 错误，
# 忽略项目中既有的、与本次改动无关的错误（避免历史负债阻断每次 Write）。

CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
HOOK_INPUT=$(cat)
SESSION_ID=$(echo "$HOOK_INPUT" | jq -r '.session_id // "default"')
CACHE_DIR="$HOME/.claude/tsc-cache/$SESSION_ID"

# Create cache directory
mkdir -p "$CACHE_DIR"

# Extract tool name and input
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // ""')
TOOL_INPUT=$(echo "$HOOK_INPUT" | jq -r '.tool_input // {}')

# Function to detect the correct TSC command
get_tsc_command() {
    cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || return 1

    # Check package.json for type-check script first
    if [ -f "package.json" ]; then
        if grep -q '"type-check"' package.json 2>/dev/null; then
            echo "pnpm type-check"
            return 0
        fi
    fi

    # Fallback to tsconfig detection
    if [ -f "tsconfig.app.json" ]; then
        echo "npx tsc --project tsconfig.app.json --noEmit"
    elif [ -f "tsconfig.build.json" ]; then
        echo "npx tsc --project tsconfig.build.json --noEmit"
    elif [ -f "tsconfig.json" ]; then
        if grep -q '"references"' tsconfig.json 2>/dev/null; then
            echo "npx tsc --build --noEmit"
        else
            echo "npx tsc --noEmit"
        fi
    else
        echo "npx tsc --noEmit"
    fi
}

# Function to count TypeScript errors
count_tsc_errors() {
    local output="$1"
    echo "$output" | grep -E "\.tsx?.*:.*error TS[0-9]+:" | wc -l | tr -d ' '
}

# Function to run TSC check
run_tsc_check() {
    local cache_file="$CACHE_DIR/tsc-cmd.cache"

    cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || return 1

    # Get or cache the TSC command
    local tsc_cmd
    if [ -f "$cache_file" ] && [ -z "$FORCE_DETECT" ]; then
        tsc_cmd=$(cat "$cache_file")
    else
        tsc_cmd=$(get_tsc_command)
        echo "$tsc_cmd" > "$cache_file"
    fi

    # Save command for auto-error-resolver
    echo "# TypeScript Check Command" > "$CACHE_DIR/tsc-commands.txt"
    echo "project: $tsc_cmd" >> "$CACHE_DIR/tsc-commands.txt"

    eval "$tsc_cmd" 2>&1
}

# Only process file modification tools
case "$TOOL_NAME" in
    Write|Edit|MultiEdit)
        # Extract file paths
        if [ "$TOOL_NAME" = "MultiEdit" ]; then
            FILE_PATHS=$(echo "$TOOL_INPUT" | jq -r '.edits[].file_path // empty')
        else
            FILE_PATHS=$(echo "$TOOL_INPUT" | jq -r '.file_path // empty')
        fi

        # Check if any TypeScript/JavaScript files were modified
        TS_FILES=$(echo "$FILE_PATHS" | grep -E '\.(ts|tsx|js|jsx)$' || true)

        if [ -n "$TS_FILES" ]; then
            # Output to stderr for visibility
            echo "⚡ Running TypeScript check (scoped to modified files)..." >&2

            # Run the check and capture output
            CHECK_OUTPUT=$(run_tsc_check 2>&1)
            CHECK_EXIT_CODE=$?

            # 全项目既有错误总数（仅用于信息展示）
            TOTAL_ERROR_COUNT=$(count_tsc_errors "$CHECK_OUTPUT")

            # 把本次修改的文件转为相对项目根的路径，用于限定范围
            SCOPE_PATTERNS=""
            for f in $TS_FILES; do
                rel="${f#$CLAUDE_PROJECT_DIR/}"
                # 若不是以项目根为前缀，退化为 basename
                [ "$rel" = "$f" ] && rel="${f##*/}"
                SCOPE_PATTERNS="$SCOPE_PATTERNS$rel\n"
            done

            # 仅保留涉及被修改文件的 tsc 输出行
            SCOPED_OUTPUT=""
            if [ -n "$SCOPE_PATTERNS" ]; then
                SCOPED_OUTPUT=$(printf '%b' "$SCOPE_PATTERNS" | while IFS= read -r pat; do
                    [ -n "$pat" ] && echo "$CHECK_OUTPUT" | grep -F -- "$pat" || true
                done)
            else
                SCOPED_OUTPUT="$CHECK_OUTPUT"
            fi

            # Save scoped (本次修改文件) error information for the auto-error-resolver agent。
            # 只缓存被修改文件的错误——既有错误与本次无关，不应触发 stop 钩子或 resolver。
            echo "$SCOPED_OUTPUT" > "$CACHE_DIR/last-errors.txt"
            echo "project" > "$CACHE_DIR/affected-repos.txt"

            # 只在被修改文件本身有新错误时才阻断
            if echo "$SCOPED_OUTPUT" | grep -q "error TS"; then
                ERROR_COUNT=$(count_tsc_errors "$SCOPED_OUTPUT")

                {
                    echo ""
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🚨 本次修改的文件存在 TypeScript 错误: $ERROR_COUNT error(s)"
                    echo "   （项目另有 $TOTAL_ERROR_COUNT 个既有错误，已忽略）"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo ""
                    echo "💡 请修复这些错误:"
                    echo ""
                    echo "$SCOPED_OUTPUT" | grep "error TS"
                    echo ""
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "WE DO NOT LEAVE A MESS BEHIND"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                } >&2

                # Exit with code 1 to make stderr visible in Claude Code
                exit 1
            else
                echo "✅ TypeScript check passed (修改文件无新错误; 忽略 $TOTAL_ERROR_COUNT 个既有错误)" >&2
            fi
        fi
        ;;
esac

# Cleanup old cache directories (older than 7 days)
find "$HOME/.claude/tsc-cache" -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true

exit 0
