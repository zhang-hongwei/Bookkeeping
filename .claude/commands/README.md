# Claude Code Slash Commands

快速访问常用开发命令的指南。

## 📋 命令列表

| 命令 | 用途 | 使用频率 | 类型 |
|------|------|----------|------|
| `/dev` | 启动开发环境 | ⭐⭐⭐⭐⭐ | 开发流程 |
| `/test` | 智能测试检测和执行 | ⭐⭐⭐⭐⭐ | 质量保证 |
| `/analyze` | 代码质量和性能分析 | ⭐⭐⭐⭐ | 代码审查 |
| `/build` | 构建和部署准备 | ⭐⭐⭐ | 发布流程 |
| `/plan` | 创建开发计划和任务分解 | ⭐⭐⭐ | 项目管理 |
| `/save-context` | 保存会话上下文 | ⭐⭐⭐ | 知识管理 |

## 🚀 快速开始

### 新手入门

```bash
# 1. 第一次使用项目
/dev

# 2. 开始编写代码
# ... 编码 ...

# 3. 运行测试
/test

# 4. 提交前检查
/analyze
```

### 日常开发流程

```bash
# 早上开始工作
/dev                          # 启动环境

# 开发过程中
/test                         # 修改后测试
/test ComponentName           # 测试特定组件

# 下班前
/save-context                 # 保存进度
/analyze                      # 检查代码质量
```

### 复杂任务流程

```bash
# 开始新功能开发
/plan 实现用户权限管理        # 创建详细计划

# 定期检查
/test --coverage              # 测试覆盖率
/analyze                      # 代码质量

# 准备发布
/build                        # 构建检查
```

## 📖 详细说明

### 开发流程类

#### /dev - 开发环境
```bash
/dev
```

**功能**：
- ✅ 检查系统环境（Node.js、pnpm）
- ✅ 安装依赖
- ✅ 配置环境变量
- ✅ 准备数据库
- ✅ 启动开发服务器

**适合场景**：
- 第一次克隆项目
- 切换分支后环境重置
- 依赖更新后重新安装

[查看完整文档](./dev.md)

---

#### /test - 智能测试
```bash
# 自动检测并测试修改的文件
/test

# 测试特定组件
/test UserForm

# 运行所有测试
/test --all

# 生成覆盖率报告
/test --coverage
```

**功能**：
- 🔍 自动检测修改的文件
- 🎯 查找相关测试
- ⚡ 快速运行测试
- 📊 分析测试结果
- 💡 提供修复建议

**适合场景**：
- 日常开发测试
- 提交前验证
- 调试测试失败

[查看完整文档](./test.md)

---

### 质量保证类

#### /analyze - 代码分析
```bash
/analyze
```

**功能**：
- 📈 代码质量分析
- 🚀 性能检测
- 🏗️ 架构评估
- 🔒 安全扫描
- 💾 数据库分析

**适合场景**：
- 代码审查前
- 性能优化
- 重构评估
- 技术债务评估

[查看完整文档](./analyze.md)

---

#### /build - 构建和部署
```bash
/build
```

**功能**：
- ✅ 构建前检查
- 📦 生产构建
- 🐳 Docker 支持
- 🚀 部署准备
- 📊 监控配置

**适合场景**：
- 发布前准备
- 部署验证
- 构建优化

[查看完整文档](./build.md)

---

### 项目管理类

#### /plan - 开发计划
```bash
/plan 实现用户权限管理
/plan 重构认证系统
```

**功能**：
- 📋 创建详细计划
- 🎯 任务分解
- 📝 上下文记录
- ⏱️ 工作量评估
- 📊 风险评估

**适合场景**：
- 复杂功能开发
- 系统重构
- 架构变更
- 性能优化项目

[查看完整文档](./plan.md)

---

#### /save-context - 保存上下文
```bash
# 保存全部上下文
/save-context

# 保存特定任务的上下文
/save-context 用户权限管理
```

**功能**：
- 💾 保存会话进度
- 📝 记录技术决策
- 🔖 标记未完成工作
- 📚 知识沉淀
- 🔄 会话恢复支持

**适合场景**：
- 接近上下文限制
- 一天工作结束
- 切换任务前
- 重要阶段完成后

[查看完整文档](./save-context.md)

---

## 🎯 使用场景速查

### 场景：开始新的一天

```bash
# 1. 查看昨天的进度
cat dev/sessions/session-$(date -v-1d +%Y-%m-%d).md

# 2. 启动开发环境
/dev

# 3. 查看活跃任务
cat dev/plans/*/tasks.md | grep "进行中"

# 4. 开始编码...
```

### 场景：实现新功能

```bash
# 1. 创建计划
/plan 实现文件上传功能

# 2. 开始开发
/dev

# 3. 编写代码...

# 4. 测试
/test

# 5. 保存进度
/save-context
```

### 场景：修复 Bug

```bash
# 1. 复现问题
/dev

# 2. 定位 bug
/analyze

# 3. 修改代码...

# 4. 验证修复
/test

# 5. 检查影响
/test --all
```

### 场景：代码审查

```bash
# 1. 质量分析
/analyze

# 2. 测试覆盖
/test --coverage

# 3. 类型检查
pnpm type-check

# 4. 构建验证
/build
```

### 场景：准备发布

```bash
# 1. 完整测试
/test --all

# 2. 代码分析
/analyze

# 3. 构建检查
/build

# 4. 生成文档
/save-context  # 更新项目知识库
```

## 💡 最佳实践

### 1. 命令组合使用

```bash
# 开发循环（TDD）
/dev → 编码 → /test → 重构 → /test

# 质量保证循环
/test --coverage → /analyze → 优化 → /test

# 发布准备
/test --all → /analyze → /build → 部署
```

### 2. 定期维护

```bash
# 每天结束
/save-context

# 每周回顾
/analyze
cat dev/plans/*/tasks.md  # 检查进度

# 每次发布前
/test --all
/analyze
/build
```

### 3. 知识积累

```bash
# 解决重要问题后
/save-context  # 记录解决方案

# 完成重要功能后
更新 dev/knowledge/  # 沉淀技术知识

# 发现最佳实践后
更新 PROJECT_KNOWLEDGE.md
```

## 🔧 自定义命令

### 创建新命令

在 `.claude/commands/` 目录创建新的 `.md` 文件：

```markdown
---
description: 命令描述
argument-hint: 参数提示（可选）
---

# /your-command 命令

命令内容...
```

### 命令模板

```markdown
---
description: 简短描述这个命令的作用
argument-hint: 提示用户如何使用参数
model: sonnet  # 可选：指定使用的模型
allowed-tools: Bash(*), Read(*)  # 可选：限制工具使用
---

# /command-name

详细说明命令的功能和使用方法：$ARGUMENTS

## 使用场景
...

## 步骤
...

## 示例
...
```

## 📚 相关资源

- [Claude Code 官方文档](https://docs.claude.com/claude-code)
- [项目规范文档](../.claude/README.md)
- [Skills 系统](../.claude/skills/README.md)
- [Agents 说明](../.claude/agents/README.md)

## 🆘 获取帮助

```bash
# 查看命令列表
/help

# 查看特定命令的详细文档
# 打开对应的 .md 文件
cat .claude/commands/dev.md
```

---

**提示**：善用这些命令可以显著提升开发效率！
