# 🎯 技能系统

## 概述

技能是模块化的规则集合，提供特定领域的最佳实践和开发指南。每个技能遵循"500行原则"，确保高效的上下文管理。

## 可用技能

### 核心开发技能

| 技能 | 描述 | 触发场景 |
|------|------|----------|
| `frontend-dev` | React/MUI/Tailwind 前端开发 | 组件开发、UI 实现 |
| `backend-dev` | Next.js API 和服务层开发 | API 路由、服务实现 |
| `database-dev` | Drizzle ORM 和数据库操作 | Schema 设计、查询优化 |
| `testing` | 测试策略和实践 | 单元测试、集成测试 |
| `refactoring` | 代码重构指南 | 代码优化、架构改进 |

### 专项技能

| 技能 | 描述 | 触发场景 |
|------|------|----------|
| `state-management` | Zustand 状态管理 | Store 设计、状态流 |
| `form-handling` | 表单处理和验证 | React Hook Form + Zod |
| `performance` | 性能优化策略 | 渲染优化、缓存策略 |
| `auth-flow` | 认证授权流程 | Clerk/NextAuth 集成 |
| `deployment` | 部署和 DevOps | CI/CD、环境配置 |

## 技能结构

每个技能包含：

```
skill-name/
├── SKILL.md        # 主文件（<500行）
└── resources/      # 详细资源
    ├── patterns.md     # 设计模式
    ├── examples.md     # 代码示例
    ├── troubleshoot.md # 故障排除
    └── reference.md    # API 参考
```

## 使用方式

### 1. 自动激活
技能会根据你的操作自动激活：
- 编辑相关文件
- 使用相关关键词
- 执行特定操作

### 2. 手动调用
```bash
/skill frontend-dev        # 激活单个技能
/skill frontend-dev,testing # 激活多个技能
/skills list              # 列出所有技能
```

### 3. 上下文感知
技能会根据当前工作上下文自动调整建议的优先级。

## 技能优先级

当多个技能同时激活时，优先级顺序：
1. 🔴 错误修复相关（error-handling）
2. 🟠 当前文件类型匹配
3. 🟡 用户明确提及的关键词
4. 🟢 通用最佳实践

## 创建自定义技能

### 1. 创建技能目录
```bash
mkdir .claude/skills/my-skill
```

### 2. 编写 SKILL.md
```markdown
---
name: my-skill
description: 我的自定义技能
triggers:
  keywords: [关键词1, 关键词2]
  files: ["*.config.js"]
---

# 技能内容
...
```

### 3. 更新 skill-rules.json
```json
{
  "my-skill": {
    "triggers": {...}
  }
}
```

## 技能元数据

每个技能的 SKILL.md 头部包含元数据：

```yaml
---
name: skill-name
version: 1.0.0
description: 技能描述
dependencies: [other-skill]
priority: high
triggers:
  keywords: [keyword1, keyword2]
  files: ["pattern/*.tsx"]
  intents: ["create", "update"]
---
```

## 最佳实践

1. **保持专注**：每个技能解决一个特定领域
2. **提供示例**：包含实际代码示例
3. **渐进式披露**：从概览到细节
4. **可操作性**：提供明确的行动指南
5. **版本管理**：记录技能的更新历史