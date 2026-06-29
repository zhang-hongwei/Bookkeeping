#!/bin/bash
set -e

# TSC Hook with Error Caching and Auto-resolver Integration
# Adapted for Next.js monorepo from aaa project

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
            echo "⚡ Running TypeScript check..." >&2

            # Run the check and capture output
            CHECK_OUTPUT=$(run_tsc_check 2>&1)
            CHECK_EXIT_CODE=$?

            # Check for TypeScript errors in output
            if [ $CHECK_EXIT_CODE -ne 0 ] || echo "$CHECK_OUTPUT" | grep -q "error TS"; then
                ERROR_COUNT=$(count_tsc_errors "$CHECK_OUTPUT")

                # Save error information for the auto-error-resolver agent
                echo "$CHECK_OUTPUT" > "$CACHE_DIR/last-errors.txt"
                echo "project" > "$CACHE_DIR/affected-repos.txt"

                # Output to stderr for visibility
                {
                    echo ""
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🚨 TypeScript errors found: $ERROR_COUNT error(s)"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo ""

                    if [ "$ERROR_COUNT" -ge 5 ]; then
                        echo "👉 RECOMMENDED: Use the auto-error-resolver agent to fix errors systematically"
                        echo ""
                        echo "   Task(subagent_type='auto-error-resolver', description='Fix TypeScript errors', prompt='Fix the TypeScript compilation errors found in the cached error log')"
                        echo ""
                        echo "Error Preview (first 10):"
                        echo "$CHECK_OUTPUT" | grep "error TS" | head -10
                        echo ""
                        remaining=$((ERROR_COUNT - 10))
                        if [ $remaining -gt 0 ]; then
                            echo "... and $remaining more errors"
                        fi
                    else
                        echo "💡 Please fix these errors directly:"
                        echo ""
                        echo "$CHECK_OUTPUT" | grep "error TS"
                        echo ""
                    fi

                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "WE DO NOT LEAVE A MESS BEHIND"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                } >&2

                # Exit with code 1 to make stderr visible in Claude Code
                exit 1
            else
                echo "✅ TypeScript check passed" >&2
            fi
        fi
        ;;
esac

# Cleanup old cache directories (older than 7 days)
find "$HOME/.claude/tsc-cache" -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true

exit 0
