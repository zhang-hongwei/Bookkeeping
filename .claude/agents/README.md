# 🤖 Specialized Agents

## 概述

Agents 是针对特定复杂任务优化的专门化 AI 助手。每个 Agent 拥有深度领域知识和专门的工作流程。

## 可用 Agents（10个）

### 📋 规划与审查 (3)

| Agent | 用途 | 触发场景 |
|-------|------|----------|
| `plan-reviewer` | 开发计划审查和风险评估 | 制定开发计划、技术方案评审 |
| `code-architecture-reviewer` | 代码架构和系统集成审查 | PR 审查、架构评审、代码提交前 |
| `refactor-planner` | 重构计划制定 | 大规模重构、代码优化规划 |

### 🔧 开发与重构 (2)

| Agent | 用途 | 触发场景 |
|-------|------|----------|
| `code-refactor-master` | 执行代码重构 | 实施重构计划、代码现代化 |
| `web-research-specialist` | 网络研究和技术调研 | 技术选型、问题排查、最佳实践研究 |

### 🐛 错误处理 (1)

| Agent | 用途 | 触发场景 |
|-------|------|----------|
| `error-resolver` | 通用错误诊断和修复 | Bug 修复、编译错误、运行时错误 |

### 🔐 认证测试 (2)

| Agent | 用途 | 触发场景 |
|-------|------|----------|
| `auth-route-debugger` | 认证路由问题诊断 | 认证问题、路由权限错误 |
| `auth-route-tester` | 认证路由功能测试 | 验证认证流程、权限测试 |

### 📝 文档与测试 (2)

| Agent | 用途 | 触发场景 |
|-------|------|----------|
| `documentation-architect` | 生成项目文档 | API 文档、技术文档、架构文档 |
| `test-generator` | 自动生成测试代码 | 新功能开发、提升测试覆盖率 |

## 使用方式

### 1. 通过 Task 工具调用

```typescript
// 在 Claude Code 中使用
使用 Task 工具，设置 subagent_type 为 "code-reviewer"
```

### 2. Agent 参数传递

每个 Agent 支持特定参数：

```typescript
// code-architecture-reviewer agent
{
  subagent_type: "code-architecture-reviewer",
  prompt: "审查 user.service.ts 的架构设计和代码质量",
  context: {
    files: ["src/services/user.service.ts"],
    focus: ["架构一致性", "系统集成", "最佳实践"]
  }
}
```

## Agent 工作流程

### 典型流程

1. **接收任务** - Agent 接收具体任务描述
2. **分析上下文** - 理解代码库和需求
3. **执行专门化操作** - 使用领域知识完成任务
4. **生成报告** - 提供详细的结果和建议

### 示例：Code Reviewer 流程

```
1. 扫描指定文件或变更
2. 检查代码质量指标
   - 复杂度
   - 重复代码
   - 命名规范
   - 最佳实践
3. 识别潜在问题
   - 性能瓶颈
   - 安全漏洞
   - 逻辑错误
4. 提供改进建议
5. 生成审查报告
```

## Agent 能力矩阵

| Agent | 读取 | 编辑 | 执行 | 分析 | 生成 |
|-------|------|------|------|------|------|
| code-architecture-reviewer | ✅ | ❌ | ❌ | ✅ | ✅ |
| refactor-planner | ✅ | ✅ | ❌ | ✅ | ✅ |
| code-refactor-master | ✅ | ✅ | ✅ | ✅ | ❌ |
| test-generator | ✅ | ✅ | ✅ | ✅ | ✅ |
| error-resolver | ✅ | ✅ | ✅ | ✅ | ❌ |
| auth-route-debugger | ✅ | ✅ | ✅ | ✅ | ✅ |
| auth-route-tester | ✅ | ✅ | ✅ | ✅ | ✅ |
| documentation-architect | ✅ | ✅ | ❌ | ✅ | ✅ |
| plan-reviewer | ✅ | ❌ | ❌ | ✅ | ✅ |
| web-research-specialist | ✅ | ❌ | ✅ | ✅ | ✅ |

## 最佳实践

### 1. 选择合适的 Agent

- **简单任务**：直接使用技能（Skills）
- **复杂分析**：使用专门化 Agent
- **多步骤任务**：组合多个 Agent

### 2. 提供充分上下文

```typescript
// ✅ 好的请求
"使用 code-reviewer 检查最近修改的认证模块，
重点关注安全性和错误处理"

// ❌ 模糊的请求
"检查代码"
```

### 3. Agent 组合使用

```typescript
// 重构工作流
1. performance-analyzer → 识别瓶颈
2. refactor-planner → 制定重构计划
3. test-generator → 生成测试保护
4. code-reviewer → 最终审查
```

## 创建自定义 Agent

### Agent 模板

```markdown
---
name: my-agent
description: 我的自定义 Agent
capabilities: [read, analyze, generate]
tools: [Grep, Read, Edit]
---

# Agent Name

## 目标
清晰描述 Agent 的目标和用途

## 工作流程
1. 步骤 1
2. 步骤 2
3. 步骤 3

## 输出格式
描述 Agent 的输出格式

## 示例
提供使用示例
```

## Agent vs Skill

| 特性 | Skills | Agents |
|------|--------|--------|
| 用途 | 提供规范指导 | 执行复杂任务 |
| 激活 | 自动/手动 | 显式调用 |
| 复杂度 | 低-中 | 高 |
| 交互 | 被动建议 | 主动执行 |
| 输出 | 指导原则 | 具体成果 |

## 常见问题

### Q: 何时使用 Agent？
A: 当任务需要多步骤分析、深度推理或专门领域知识时。

### Q: Agent 可以修改代码吗？
A: 取决于 Agent 类型。code-refactor-master、test-generator、error-resolver 可以修改代码，code-architecture-reviewer 和 plan-reviewer 通常只分析。

### Q: 如何查看 Agent 进度？
A: Agent 会输出步骤信息，可以通过日志查看详细进度。