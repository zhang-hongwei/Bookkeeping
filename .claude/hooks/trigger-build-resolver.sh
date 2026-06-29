#!/bin/bash

# Skip if environment variable is set
if [ -n "$SKIP_BUILD_CHECK" ]; then
    exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR"

# Check if there are any changes
git_status=$(git status --porcelain 2>/dev/null)

if [ -z "$git_status" ]; then
    # No changes, skip
    exit 0
fi

# Check which types of files were changed
has_tsx_changes=$(echo "$git_status" | grep -E '\.(tsx|jsx)$' || true)
has_ts_changes=$(echo "$git_status" | grep -E '\.(ts)$' || true)
has_config_changes=$(echo "$git_status" | grep -E '(tsconfig|next\.config|tailwind\.config|package\.json)' || true)

# Only remind if there are TypeScript/React changes or config changes
if [ -n "$has_tsx_changes" ] || [ -n "$has_ts_changes" ] || [ -n "$has_config_changes" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔨 BUILD CHECK REMINDER"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "检测到代码变更 / Code changes detected"
    echo ""

    if [ -n "$has_tsx_changes" ] || [ -n "$has_ts_changes" ]; then
        echo "  📝 TypeScript/React files modified"
    fi

    if [ -n "$has_config_changes" ]; then
        echo "  ⚙️  Configuration files modified"
    fi

    echo ""
    echo "💡 建议的检查步骤 / Recommended checks:"
    echo ""
    echo "  1. 类型检查 / Type check:"
    echo "     pnpm type-check"
    echo ""
    echo "  2. 运行测试 / Run tests:"
    echo "     pnpm test --run --silent='passed-only' 'pattern'"
    echo ""
    echo "  3. 构建检查 / Build check (optional):"
    echo "     pnpm build"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "💡 TIP: 使用 SKIP_BUILD_CHECK=1 禁用提醒"
    echo "    Use SKIP_BUILD_CHECK=1 to disable"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
fi

exit 0
