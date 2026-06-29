<!-- AI_CONTEXT: system-prompt; for Claude-only; do not edit by hand -->

# CLAUDE.md

This document serves as a shared guideline for all team members when using Claude Code in this repository. 

## Project Overview

Read `.claude/project.md` for tech stack, directory structure, and architecture principles.

## 🚀 Claude Code Enhancement System

This project uses an enhanced Claude Code configuration with automatic skill activation, specialized agents, and slash commands.

### Key Features:
- **Auto-activation**: Skills automatically activate based on context
- **Modular Skills**: 5+ specialized skill modules for different development areas
- **Specialized Agents**: 4+ agents for complex tasks (code review, refactoring, testing, etc.)
- **Slash Commands**: Quick commands for common operations (`/dev`, `/analyze`, `/build`)

See `.claude/README.md` for the complete enhancement system documentation.

## Development

### Git Workflow

- use rebase for git pull
- git commit message should prefix with gitmoji
- git branch name format example: tj/feat/feature-name
- use .github/PULL_REQUEST_TEMPLATE.md to generate pull request description

### Package Management

- Use `pnpm` as the primary package manager for dependency management

### TypeScript Code Style Guide

see .claude/rules/typescript.md

### UI Design System

Theme configuration in `src/components/theme/` - Colors, typography, spacing defined in code

**Primary Reference**: `.claude/skills/frontend-dev/SKILL.md` (auto-activated for .tsx files)

⚠️ **Legacy rules at `.claude/rules/ui-frontend/` are DEPRECATED** - See DEPRECATED.md in that directory

### Modify Code Rules

- **Code Language**:
  - For files with existing Chinese comments: Continue using Chinese to maintain consistency
  - For new files or files without Chinese comments: MUST use American English.
    - eg: new react tsx file and new test file
- Conservative for existing code, modern approaches for new features

### Testing

**Primary Reference**: `.claude/skills/testing/SKILL.md` (auto-activated for .test.ts files)

**Test Command**:
```bash
pnpm test --run --silent='passed-only' '[file-path-pattern]'
```

**Important Guidelines**:

- Always wrap file path patterns in single quotes to avoid shell expansion
- **Never** run `pnpm test` without specific file patterns (will run all tests, takes ~10 minutes)
- Run tests for the specific files you modified, not the entire test suite
- If the same test fails twice after fixes, stop and ask for help instead of continuing
- Review the testing guide for mock patterns, test structure, and debugging strategies

### Typecheck

Use TypeScript compiler to check for type errors:

```bash
pnpm type-check
```

Run this before committing to ensure type safety across the codebase.

### Code Quality

**Before Committing**:
1. Run type check: `pnpm type-check`
2. Run tests for modified files: `pnpm test --run --silent='passed-only' '[file-pattern]'`
3. Ensure all tests pass and no type errors exist
4. Follow git commit message format with gitmoji prefix

**Code Review**:
- See `.claude/rules/code-review.md` for review guidelines and standards
- All PRs should include clear description using the PR template

## Enhanced Development System

### 🎯 Skills (Auto-Activated)

The following skills will automatically activate based on your context:

- **frontend-dev**: React/MUI/Tailwind development (auto-activates for .tsx files)
- **backend-dev**: API routes and services (auto-activates for /api/ files)
- **database-dev**: Drizzle ORM and PostgreSQL (auto-activates for database/ files)
- **testing**: Test development (auto-activates for .test.ts files)
- **refactoring**: Code refactoring patterns (triggered by keywords like "refactor", "optimize")

### 🤖 Specialized Agents (10个)

Use these agents for complex tasks via the Task tool:

- **code-architecture-reviewer**: Architecture and code quality review
- **refactor-planner**: Plan refactoring strategies
- **code-refactor-master**: Execute refactoring operations
- **test-generator**: Automatically generate test cases
- **error-resolver**: Diagnose and fix errors
- **auth-route-debugger**: Debug authentication issues
- **auth-route-tester**: Test authentication routes
- **documentation-architect**: Generate project documentation
- **plan-reviewer**: Review development plans
- **web-research-specialist**: Research technical solutions

See `.claude/agents/README.md` for detailed agent descriptions.

### ⚡ Slash Commands

Quick commands for common operations:

- **/dev**: Start development environment
- **/analyze**: Analyze codebase quality and performance
- **/build**: Build and deploy preparation

## 📚 Development Guidelines

### 使用指引

**推荐顺序**（查找开发规范时）:
1. **首选**: `.claude/skills/` - 智能自动激活的技能系统 ✅
2. **次选**: `.claude/rules/` - 传统规则文件（正在迁移中）⚠️
3. **冲突时**: 以 skills 为准

**迁移状态**: 查看 `.claude/MIGRATION.md` 了解详细的迁移映射和进度

### Legacy Rules Index

**IMPORTANT**: Traditional rule files are being migrated to the skill system. For migration status, see `.claude/MIGRATION.md`.

Some legacy rules remain useful for specific configurations:

### 📋 Key Development Rules

#### Getting Started

- `system-role.md` - System role and problem-solving methodology
- `best-practices.md` - Next.js hybrid development patterns and best practices

#### Frontend Development

⚠️ **All frontend rules have migrated to the skill system**

**Primary Reference**: `.claude/skills/frontend-dev/SKILL.md` (auto-activates for .tsx files)

Key topics covered:
- React component conventions and patterns
- MUI v6/v7 usage guidelines
- Tailwind CSS integration (sx > styled() > Tailwind)
- Form development (react-hook-form + Zod)
- Layout system (Grid, Stack, Box, Container)
- Icon system (react-icons)
- Internationalization (react-i18next)
- Component organization and structure

**Detailed Resources**: See `.claude/skills/frontend-dev/resources/` for:
- `component-patterns.md` - StatCard, ChartCard, etc.
- `form-patterns.md` - Form handling patterns
- `state-management-integration.md` - Zustand integration
- `mui-integration.md` - MUI documentation tool

**Deprecated**: `.claude/rules/ui-frontend/` (See DEPRECATED.md for migration mapping)

#### Next.js Development

- `nextjs-server-client-components-guide.md` - Server and client components guide

#### Backend Development

- `backend-architecture.md` - Three-layer architecture, data flow, best practices
- `define-database-model.md` - Database model creation guide
- `drizzle-schema-style-guide.md` - Drizzle ORM PostgreSQL schema style guide

#### State Management

- `zustand-action-patterns.md` - Recommended patterns for organizing Zustand actions
- `zustand-slice-organization.md` - Best practices for structuring Zustand slices

#### Testing & Quality

- `testing-guide/testing-guide.md` - Comprehensive testing guide
- `testing-guide/db-model-test.md` - Database Model testing guide
- `code-review.md` - Code review guidelines and standards

#### Tools & Configuration

- `debug-usage.md` - Debug package usage and namespace conventions
- `proxy-server.md` - Development proxy server configuration and usage
- `mui.md` - MUI documentation query tool

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/007-ai-wealth-advisor/plan.md
<!-- SPECKIT END -->
