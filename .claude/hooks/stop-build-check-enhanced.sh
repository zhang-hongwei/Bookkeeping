#!/bin/bash
set -e

# Stop event hook that runs final build checks
# Adapted for Next.js monorepo from aaa project
# This runs when Claude Code session finishes

# Read event information from stdin
event_info=$(cat)

# Extract session ID
session_id=$(echo "$event_info" | jq -r '.session_id // "default"')

# Cache directory (using home directory, consistent with tsc-check.sh)
cache_dir="$HOME/.claude/tsc-cache/${session_id}"

# Check if cache exists
if [[ ! -d "$cache_dir" ]]; then
    exit 0
fi

# Check if any errors were cached
if [[ ! -f "$cache_dir/last-errors.txt" ]]; then
    # No cached errors, clean up and exit
    rm -rf "$cache_dir"
    exit 0
fi

# Read cached error information
error_output=$(cat "$cache_dir/last-errors.txt")
error_count=$(echo "$error_output" | grep -E "\.tsx?.*:.*error TS[0-9]+:" | wc -l | tr -d ' ')

# If we have errors, provide resolution guidance
if [[ $error_count -gt 0 ]]; then
    echo "" >&2
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
    echo "🚨 TypeScript Errors Remain Unfixed" >&2
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
    echo "" >&2
    echo "Found $error_count TypeScript error(s) that were not resolved during this session." >&2
    echo "" >&2

    if [[ $error_count -ge 5 ]]; then
        echo "👉 RECOMMENDED: Use the auto-error-resolver agent to fix these errors systematically" >&2
        echo "" >&2
        echo "   Task(subagent_type='auto-error-resolver', description='Fix TypeScript errors', prompt='Fix the TypeScript compilation errors found in the cached error log')" >&2
        echo "" >&2
        echo "Error Preview (first 10):" >&2
        echo "$error_output" | grep "error TS" | head -10 | sed 's/^/  /' >&2
        echo "" >&2
        remaining=$((error_count - 10))
        if [[ $remaining -gt 0 ]]; then
            echo "  ... and $remaining more errors" >&2
            echo "" >&2
        fi
    else
        echo "💡 Please fix these errors before proceeding:" >&2
        echo "" >&2
        echo "$error_output" | grep "error TS" | sed 's/^/  /' >&2
        echo "" >&2
    fi

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
    echo "💡 Error details have been cached at:" >&2
    echo "   $cache_dir/last-errors.txt" >&2
    echo "" >&2
    echo "   TSC command:" >&2
    if [[ -f "$cache_dir/tsc-commands.txt" ]]; then
        cat "$cache_dir/tsc-commands.txt" | sed 's/^/   /' >&2
    fi
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
    echo "WE DO NOT LEAVE A MESS BEHIND" >&2
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
    echo "" >&2

    # Exit with status 2 to send feedback to Claude
    exit 2
else
    # No errors, clean up cache
    rm -rf "$cache_dir"
    exit 0
fi
