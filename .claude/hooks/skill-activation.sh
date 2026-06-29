#!/bin/bash

# ================================================================
# Claude Code Skill Activation Hook
# Purpose: 自动检测用户意图并推荐相关技能
# ================================================================

# 读取用户输入和上下文
USER_PROMPT="${1:-$CLAUDE_USER_PROMPT}"
EDITED_FILES="${2:-$CLAUDE_EDITED_FILES}"
PROJECT_ROOT="${CLAUDE_PROJECT_ROOT:-$(pwd)}"

# 技能规则文件路径
SKILL_RULES="$PROJECT_ROOT/.claude/skills/skill-rules.json"

# 调试模式
if [ "$CLAUDE_DEBUG" = "1" ]; then
    echo "[DEBUG] User prompt: $USER_PROMPT" >&2
    echo "[DEBUG] Edited files: $EDITED_FILES" >&2
fi

# 初始化推荐技能列表
RECOMMENDED_SKILLS=()

# ================================================================
# 前端开发检测
# ================================================================
if echo "$USER_PROMPT" | grep -qiE "(component|react|mui|tailwind|frontend|ui|页面|组件|界面)"; then
    RECOMMENDED_SKILLS+=("frontend-dev")
fi

if echo "$EDITED_FILES" | grep -qE "\.(tsx|jsx)$"; then
    RECOMMENDED_SKILLS+=("frontend-dev")
fi

# ================================================================
# 后端开发检测
# ================================================================
if echo "$USER_PROMPT" | grep -qiE "(api|backend|service|endpoint|server|后端|接口|服务)"; then
    RECOMMENDED_SKILLS+=("backend-dev")
fi

if echo "$EDITED_FILES" | grep -qE "app/api/.*\.(ts|js)$"; then
    RECOMMENDED_SKILLS+=("backend-dev")
fi

# ================================================================
# 数据库开发检测
# ================================================================
if echo "$USER_PROMPT" | grep -qiE "(database|drizzle|postgres|schema|query|migration|数据库|表|查询)"; then
    RECOMMENDED_SKILLS+=("database-dev")
fi

if echo "$EDITED_FILES" | grep -qE "database/.*\.(ts|sql)$"; then
    RECOMMENDED_SKILLS+=("database-dev")
fi

# ================================================================
# 测试相关检测
# ================================================================
if echo "$USER_PROMPT" | grep -qiE "(test|spec|jest|vitest|测试|单元测试)"; then
    RECOMMENDED_SKILLS+=("testing")
fi

if echo "$EDITED_FILES" | grep -qE "\.(test|spec)\.(ts|tsx|js|jsx)$"; then
    RECOMMENDED_SKILLS+=("testing")
fi

# ================================================================
# 重构检测
# ================================================================
if echo "$USER_PROMPT" | grep -qiE "(refactor|optimize|improve|clean|重构|优化|改进|整理)"; then
    RECOMMENDED_SKILLS+=("refactoring")
fi

# ================================================================
# 状态管理检测
# ================================================================
if echo "$USER_PROMPT" | grep -qiE "(zustand|store|state|状态|store)"; then
    RECOMMENDED_SKILLS+=("state-management")
fi

if echo "$EDITED_FILES" | grep -qE "store/.*\.ts$"; then
    RECOMMENDED_SKILLS+=("state-management")
fi

# ================================================================
# 表单处理检测
# ================================================================
if echo "$USER_PROMPT" | grep -qiE "(form|validation|zod|react-hook-form|表单|验证|校验)"; then
    RECOMMENDED_SKILLS+=("form-handling")
fi

# ================================================================
# 性能优化检测
# ================================================================
if echo "$USER_PROMPT" | grep -qiE "(performance|optimize|slow|fast|cache|memo|性能|优化|缓慢|缓存)"; then
    RECOMMENDED_SKILLS+=("performance")
fi

# ================================================================
# 输出推荐
# ================================================================

# 去重
UNIQUE_SKILLS=($(echo "${RECOMMENDED_SKILLS[@]}" | tr ' ' '\n' | sort -u))

if [ ${#UNIQUE_SKILLS[@]} -gt 0 ]; then
    echo ""
    echo "🎯 检测到相关技能，建议激活："
    echo ""

    for skill in "${UNIQUE_SKILLS[@]}"; do
        case "$skill" in
            "frontend-dev")
                echo "  📱 frontend-dev - React/MUI/Tailwind 开发规范"
                ;;
            "backend-dev")
                echo "  🔧 backend-dev - Next.js API 路由和服务层开发"
                ;;
            "database-dev")
                echo "  🗄️ database-dev - Drizzle ORM 和 PostgreSQL 操作"
                ;;
            "testing")
                echo "  🧪 testing - 单元测试和集成测试指南"
                ;;
            "refactoring")
                echo "  ♻️ refactoring - 代码重构最佳实践"
                ;;
            "state-management")
                echo "  🔄 state-management - Zustand 状态管理模式"
                ;;
            "form-handling")
                echo "  📝 form-handling - React Hook Form + Zod 表单处理"
                ;;
            "performance")
                echo "  ⚡ performance - 性能优化策略"
                ;;
        esac
    done

    echo ""
    echo "💡 技能将自动加载到上下文中。你也可以使用 '/skill <name>' 手动激活。"
    echo ""

    # 如果有多个技能，提示优先级
    if [ ${#UNIQUE_SKILLS[@]} -gt 1 ]; then
        echo "📌 提示：检测到多个相关技能，已按相关性排序。"
    fi
fi

# 特殊场景检测
if echo "$USER_PROMPT" | grep -qiE "(help|帮助|怎么|如何|什么是)"; then
    echo "ℹ️ 提示：如需查看所有可用技能，请使用 '/skills list'"
fi