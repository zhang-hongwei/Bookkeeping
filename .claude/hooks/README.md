# 🔄 Hooks 系统配置指南

## 概述

Hooks 是 Claude Code 的自动化扩展点，可以在特定时机自动执行脚本，实现智能化辅助。

## 核心 Hooks

### 1. skill-activation.sh（最重要）
**作用**：根据用户输入和文件上下文自动激活相关技能
**触发时机**：UserPromptSubmit
**优先级**：高

### 2. file-tracker.sh
**作用**：追踪文件变化，维护修改历史
**触发时机**：PostToolUse (Edit/Write)
**优先级**：中

### 3. type-check.sh
**作用**：TypeScript 类型检查
**触发时机**：Stop
**优先级**：低

### 4. test-runner.sh
**作用**：自动运行相关测试
**触发时机**：PostToolUse (Edit test files)
**优先级**：低

## 安装步骤

### 1. 配置 settings.json

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": ".claude/hooks/skill-activation.sh"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": ".claude/hooks/file-tracker.sh"
      }
    ],
    "Stop": [
      {
        "command": ".claude/hooks/type-check.sh"
      }
    ]
  }
}
```

### 2. 赋予执行权限

```bash
chmod +x .claude/hooks/*.sh
```

### 3. 安装依赖（如果需要）

```bash
# 如果使用 TypeScript 版本的 hooks
cd .claude/hooks
pnpm install
```

## Hook 开发指南

### 基本结构

```bash
#!/bin/bash
# Hook: skill-activation.sh
# Purpose: 自动激活相关技能

# 读取环境变量
PROMPT="${CLAUDE_USER_PROMPT}"
FILES="${CLAUDE_EDITED_FILES}"

# 执行逻辑
if [[ "$PROMPT" =~ "component" ]]; then
  echo "建议激活技能：frontend-dev"
fi
```

### 可用环境变量

- `CLAUDE_USER_PROMPT` - 用户输入
- `CLAUDE_EDITED_FILES` - 编辑的文件列表
- `CLAUDE_TOOL_NAME` - 调用的工具名称
- `CLAUDE_PROJECT_ROOT` - 项目根目录

## 调试

启用调试日志：
```bash
export CLAUDE_DEBUG=1
```

查看 hook 输出：
```bash
tail -f ~/.claude/logs/hooks.log
```

## 常见问题

### Q: Hook 没有触发？
A: 检查 settings.json 配置和文件执行权限

### Q: 如何禁用特定 hook？
A: 在 settings.json 中注释掉对应配置

### Q: 性能影响？
A: Hooks 异步执行，不会阻塞主流程