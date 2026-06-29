# 🚀 Claude Code 增强配置系统

> 基于生产级最佳实践重构的 Claude Code 配置，提供自动激活、模块化技能和专门化 Agents。

## 📋 目录结构

```
.claude/
├── README.md                # 本文档
├── project.md              # 项目概览（保留原有）
├── settings.json           # Hook 配置（用于自动激活）
├── settings.local.json     # 本地权限配置
│
├── skills/                 # 🎯 技能系统（模块化规则）
│   ├── skill-rules.json    # 技能触发规则配置
│   ├── README.md           # 技能使用指南
│   ├── frontend-dev/       # 前端开发技能
│   ├── backend-dev/        # 后端开发技能
│   ├── database-dev/       # 数据库开发技能
│   ├── testing/           # 测试技能
│   └── refactoring/       # 重构技能
│
├── hooks/                  # 🔄 自动化 Hooks
│   ├── README.md           # Hook 设置指南
│   ├── skill-activation.sh # 核心：自动激活技能
│   ├── file-tracker.sh    # 文件变化追踪
│   ├── type-check.sh      # TypeScript 检查
│   └── test-runner.sh     # 测试运行器
│
├── agents/                 # 🤖 专门化 Agents
│   ├── README.md           # Agent 使用指南
│   ├── code-reviewer.md   # 代码审查 Agent
│   ├── refactor-planner.md # 重构规划 Agent
│   ├── test-generator.md  # 测试生成 Agent
│   ├── performance-analyzer.md # 性能分析 Agent
│   └── error-resolver.md  # 错误解决 Agent
│
├── commands/               # ⚡ Slash 命令
│   ├── dev.md             # /dev - 开发环境设置
│   ├── build.md           # /build - 构建检查
│   └── analyze.md         # /analyze - 代码分析
│
├── rules/                  # 📚 传统规则（逐步迁移到 skills）
└── analysis/              # 📊 项目分析文档（保留）
```

## 🎯 核心特性

### 1. 自动激活系统
通过 hooks 自动检测用户意图，智能推荐相关技能，无需手动触发。

### 2. 模块化技能（500行原则）
每个技能包含：
- 主文件 SKILL.md（概览，<500行）
- resources/ 目录（详细资源，按需加载）

### 3. 专门化 Agents
针对特定任务优化的 AI 助手，提供深度领域知识。

### 4. Slash 命令
快速触发常用操作的命令接口。

## 🚀 快速开始

### 启用自动激活
1. 确保 `settings.json` 中配置了 hooks
2. 技能会根据你的操作自动激活

### 使用技能
- 输入相关关键词时自动推荐
- 或手动调用：`/skill frontend-dev`

### 调用 Agent
- 使用 Task 工具：`subagent_type: "code-reviewer"`
- 或通过命令：`/agent code-reviewer`

## 📈 与原版对比

| 特性 | 原版 | 增强版 |
|------|------|--------|
| 规则管理 | 静态文档 | 模块化技能 |
| 激活方式 | 手动 | 自动检测 |
| 复杂任务 | 无支持 | 专门化 Agents |
| 维护成本 | 高 | 低（自动化） |

## 🔧 配置说明

详细配置请参考各子目录的 README 文档。

## 📝 许可

本配置基于生产级最佳实践，自由使用和修改。