---
description: 保存当前会话上下文，用于会话切换或上下文压缩前
argument-hint: 可选 - 聚焦的特定任务或模块（留空则保存全部上下文）
---

# /save-context 命令

在会话结束前保存重要的开发上下文和决策：$ARGUMENTS

## 使用场景

### 何时使用
- ✅ 接近上下文限制（token 用量 > 80%）
- ✅ 完成重要的开发阶段
- ✅ 准备切换到其他任务
- ✅ 一天工作结束时
- ✅ 发现重要的技术洞察

### 不需要使用
- ❌ 简单的一次性任务
- ❌ 所有更改已提交且文档完整

## 保存内容

### 1. 更新活跃任务文档

检查 `dev/plans/*/` 目录中的所有活跃任务，更新：

#### `context.md`
```markdown
## 本次会话更新 (YYYY-MM-DD HH:mm)

### 实现状态
- ✅ 已完成：xxx
- 🚧 进行中：xxx
- ⏸️ 暂停：xxx（原因）

### 关键决策
- **决策**：选择了 X 方案
  - **背景**：xxx
  - **原因**：xxx
  - **影响**：xxx
  - **替代方案**：考虑过 Y 和 Z

### 修改的文件
- `src/xxx.ts` - 添加了 xxx 功能
- `src/yyy.tsx` - 重构了 xxx 组件
- `src/zzz.test.ts` - 新增测试用例

### 发现的问题
- 🐛 Bug：描述
- ⚠️ 技术债务：描述
- 💡 改进点：描述

### 下一步行动
1. 首先：xxx
2. 然后：xxx
3. 最后：xxx
```

#### `tasks.md`
```markdown
## 任务状态更新 (YYYY-MM-DD)

### ✅ 本次完成
- [x] 任务 1：xxx
  - 耗时：X 小时
  - 备注：xxx

### 🚧 进行中（当前状态）
- [ ] 任务 2：xxx
  - 进度：60%
  - 当前步骤：正在实现 xxx
  - 遗留：需要完成 xxx

### 📋 新增任务
- [ ] 任务 3：在实现过程中发现需要 xxx
```

### 2. 捕获技术洞察

在 `dev/knowledge/` 目录创建知识条目：

```markdown
# [主题] - YYYY-MM-DD

## 问题
简述遇到的问题或挑战

## 解决方案
详细说明如何解决的

## 关键代码
```typescript
// 示例代码
```

## 为什么这样做
解释技术决策的原因

## 注意事项
- 需要注意的边缘情况
- 可能的陷阱

## 相关资源
- 文档链接
- 参考 PR
```

### 3. 记录未完成的工作

在 `dev/wip/` (Work In Progress) 创建快照：

```markdown
# 工作暂存 - YYYY-MM-DD HH:mm

## 正在编辑的文件
- `src/components/UserForm.tsx:145`
  - 目标：添加表单验证逻辑
  - 已完成：基础结构
  - 待完成：错误处理和边界情况

## 未提交的更改
```bash
git status
```

## 需要运行的命令
```bash
# 重新启动开发服务器
pnpm dev

# 运行测试验证
pnpm test 'UserForm.test.tsx'

# 类型检查
pnpm type-check
```

## 遗留问题
1. [ ] XXX 函数的类型定义需要优化
2. [ ] 需要添加单元测试覆盖
3. [ ] 文档需要更新

## 恢复工作的步骤
1. 打开 `src/components/UserForm.tsx`
2. 跳转到第 145 行
3. 继续实现 handleValidation 函数
4. 参考 `dev/plans/user-form/context.md` 中的设计
```

### 4. 更新项目知识库

如果存在以下文件，更新它们：

- `PROJECT_KNOWLEDGE.md` - 项目架构和关键概念
- `DECISIONS.md` - 重要的技术决策记录
- `TROUBLESHOOTING.md` - 常见问题和解决方案

### 5. 会话摘要

生成本次会话的摘要：

```markdown
# 会话摘要 - YYYY-MM-DD

## 完成的主要工作
1. 实现了 UserForm 组件
2. 添加了 Zod 验证 schema
3. 创建了示例页面

## 重要的技术决策
- 使用自定义 Select 组件而非 MUI 原生组件
- 选择 react-hook-form + zod 作为表单解决方案

## 遗留的问题
- 需要添加更多的表单字段验证
- 性能测试待完成

## 下次会话的起点
从 `dev/wip/session-YYYYMMDD.md` 恢复工作
```

## 自动化脚本

可以使用以下脚本自动化部分流程：

```bash
# .claude/scripts/save-context.sh
#!/bin/bash

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)

# 1. 创建会话快照
mkdir -p dev/sessions
echo "# Session Snapshot - $DATE $TIME" > dev/sessions/session-$DATE.md

# 2. 记录 git 状态
echo -e "\n## Git Status\n" >> dev/sessions/session-$DATE.md
git status >> dev/sessions/session-$DATE.md

# 3. 记录最近的修改
echo -e "\n## Recent Changes\n" >> dev/sessions/session-$DATE.md
git diff --stat >> dev/sessions/session-$DATE.md

# 4. 列出活跃任务
echo -e "\n## Active Tasks\n" >> dev/sessions/session-$DATE.md
find dev/plans -name "tasks.md" -exec head -20 {} \; >> dev/sessions/session-$DATE.md

echo "✅ Context saved to dev/sessions/session-$DATE.md"
```

## 最佳实践

### 保存频率
- **长期任务**：每天结束时保存
- **复杂重构**：每个阶段完成后保存
- **上下文压力**：token 使用 > 150k 时保存

### 文档质量
- ✅ 使用具体的、可操作的语言
- ✅ 包含足够的上下文信息
- ✅ 记录"为什么"而非"是什么"
- ✅ 添加时间戳便于追溯

### 组织结构
```
dev/
├── plans/              # 计划和任务
│   └── [task-name]/
│       ├── plan.md
│       ├── context.md
│       └── tasks.md
├── knowledge/          # 技术知识库
│   ├── patterns/
│   ├── gotchas/
│   └── solutions/
├── wip/               # 进行中的工作
│   └── session-*.md
└── sessions/          # 会话快照
    └── session-*.md
```

## 恢复工作流程

当开始新会话时：

1. **查看最近的会话**
   ```bash
   cat dev/sessions/session-$(date +%Y-%m-%d).md
   ```

2. **检查活跃任务**
   ```bash
   cat dev/plans/*/tasks.md | grep -A 3 "进行中"
   ```

3. **恢复上下文**
   - 阅读相关的 `context.md`
   - 查看 `wip/` 中未完成的工作
   - 检查 git 状态

## 集成其他命令

```bash
# 完整的会话结束流程
/save-context      # 保存上下文
git add .
git commit -m "feat: ..."
/analyze           # 最终检查
```

---

**记住**：好的文档是未来你最好的朋友！
