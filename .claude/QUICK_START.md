# 🚀 Claude Code 增强系统快速入门

## 第一次使用？

恭喜！你的项目已配置了增强的 Claude Code 系统。以下是快速开始指南：

## ✨ 核心特性体验

### 1. 自动技能激活（最强大的特性）

当你开始工作时，系统会**自动检测并激活相关技能**：

```bash
# 示例：当你说 "创建一个用户列表组件"
# 系统会自动激活 frontend-dev 技能，提供 React/MUI 最佳实践

# 示例：当你说 "创建用户 API"
# 系统会自动激活 backend-dev 技能，提供 Next.js API 规范
```

**你不需要做任何事情！技能会根据你的操作自动激活。**

### 2. 使用 Slash 命令

快速执行常见任务：

```bash
# 启动开发环境
/dev

# 分析代码质量
/analyze

# 准备生产构建
/build
```

### 3. 调用专门化 Agents

对于复杂任务，使用专门的 Agent：

```bash
# 代码审查
使用 Task 工具，subagent_type: "code-reviewer"
提示：审查 services/user.service.ts 的代码质量

# 生成测试
使用 Task 工具，subagent_type: "test-generator"
提示：为 UserCard 组件生成完整测试

# 重构规划
使用 Task 工具，subagent_type: "refactor-planner"
提示：分析并重构 components/Dashboard.tsx
```

## 📋 典型工作流程

### 场景 1：创建新功能

```
你：创建一个产品列表页面，支持搜索和筛选

Claude Code 会：
1. ✅ 自动激活 frontend-dev 技能
2. ✅ 提供 MUI v7 Grid 布局指导
3. ✅ 使用自定义组件（Modal、Select、Toast）
4. ✅ 遵循项目的文件组织规范
```

### 场景 2：修复错误

```
你：TypeError: Cannot read properties of undefined

Claude Code 会：
1. ✅ 自动激活 error-resolver agent
2. ✅ 诊断错误原因
3. ✅ 提供精确的修复代码
4. ✅ 添加防御性编程建议
```

### 场景 3：优化性能

```
你：页面加载很慢，需要优化

Claude Code 会：
1. ✅ 运行 /analyze 命令分析性能
2. ✅ 激活 performance 技能
3. ✅ 调用 refactor-planner 制定优化计划
4. ✅ 实施具体的优化措施
```

## 🎯 最佳实践

### DO（推荐）

✅ **让系统自动工作** - 技能会自动激活，无需手动干预
✅ **使用自然语言** - 像和同事对话一样描述需求
✅ **相信智能建议** - 系统了解你的项目架构和规范
✅ **使用 slash 命令** - 快速完成常见任务

### DON'T（避免）

❌ **不要手动加载技能** - 系统会自动处理
❌ **不要忽略提示** - 系统的建议基于项目最佳实践
❌ **不要跳过测试** - 系统会提醒你运行相关测试

## 🔥 强大功能展示

### 自动代码审查

每次你完成代码编写，可以：

```bash
# 自动审查最近的更改
使用 code-reviewer agent 审查我刚才的修改
```

### 智能重构

当代码变得复杂时：

```bash
# 获取重构建议
这个组件太大了，帮我重构
```

系统会自动：
1. 分析组件结构
2. 识别可提取的部分
3. 生成重构计划
4. 执行安全重构

### 测试生成

```bash
# 一键生成测试
为这个组件生成测试用例
```

系统会生成：
- 渲染测试
- 交互测试
- 边界条件测试
- 错误处理测试

## 🛠️ 配置说明

### 查看当前配置

- **技能配置**: `.claude/skills/skill-rules.json`
- **Hook 配置**: `.claude/settings.json`
- **自定义技能**: `.claude/skills/*/SKILL.md`

### 自定义触发规则

编辑 `skill-rules.json` 添加你的触发规则：

```json
{
  "my-custom-skill": {
    "promptTriggers": {
      "keywords": ["自定义", "special"],
      "intentPatterns": ["创建.*特殊功能"]
    }
  }
}
```

## 💡 Pro Tips

### 1. 并行工作

```bash
# 同时运行多个任务
同时：生成测试、检查类型、运行 lint
```

### 2. 上下文感知

系统会记住你的工作上下文：

```bash
# 第一次
创建用户管理模块

# 之后系统会记住上下文
添加编辑功能  # 系统知道是给用户管理模块添加
```

### 3. 快速迭代

```bash
# 使用快捷方式
/dev  # 启动开发
# 编写代码...
/analyze  # 检查质量
# 修复问题...
/build  # 准备部署
```

## 🆘 遇到问题？

### 技能没有激活？

1. 检查 `.claude/settings.json` 中的 hooks 配置
2. 确保 hook 脚本有执行权限：`chmod +x .claude/hooks/*.sh`

### Agent 无法使用？

确保使用正确的调用方式：
```
使用 Task 工具
设置 subagent_type 为 agent 名称
```

### 命令不工作？

检查命令文件是否存在：
```bash
ls .claude/commands/
```

## 🎉 开始体验

现在就试试：

1. **说出你的需求**："创建一个登录表单"
2. **观察自动激活**：系统会自动激活相关技能
3. **享受智能辅助**：获得符合项目规范的代码

记住：**你只需要描述想做什么，系统会处理其余的一切！**

---

> 💬 反馈和建议：如果你有任何问题或建议，请在项目中创建 issue 或直接告诉我。

**Happy Coding with Enhanced Claude Code! 🚀**