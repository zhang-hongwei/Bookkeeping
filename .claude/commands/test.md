---
description: 智能测试：自动检测需要测试的文件并运行相关测试
argument-hint: 可选 - 特定的文件路径或测试模式
---

# /test 命令

智能检测并运行相关测试：$ARGUMENTS

## 功能概览

### 自动检测模式（无参数）
运行 `/test` 时，自动：
1. 检测本次会话修改的文件
2. 查找相关的测试文件
3. 运行这些测试
4. 分析测试结果
5. 提供修复建议

### 手动指定模式（有参数）
运行 `/test [pattern]` 时：
- 运行匹配的特定测试
- 支持文件路径、通配符、测试名称

## 使用场景

### 场景 1：日常开发 ✅

```bash
# 自动检测并测试修改的代码
/test

# 输出示例：
# 检测到 3 个修改的文件：
# - src/components/UserForm.tsx
# - src/schemas/userFormSchema.ts
# - src/app/user/create/page.tsx
#
# 找到 2 个相关测试文件：
# - src/components/__tests__/UserForm.test.tsx
# - src/schemas/__tests__/userFormSchema.test.ts
#
# 运行测试...
```

### 场景 2：特定组件测试

```bash
# 测试特定文件
/test UserForm

# 测试特定目录
/test components/forms

# 测试特定模式
/test api/users
```

### 场景 3：回归测试

```bash
# 运行所有测试
/test --all

# 运行失败的测试
/test --failed

# 运行覆盖率报告
/test --coverage
```

## 智能检测逻辑

### 1. 文件变更检测

```typescript
// 检测策略
const changedFiles = [
  // Git 未提交的修改
  ...getGitModifiedFiles(),

  // 本次会话编辑的文件
  ...getSessionEditedFiles(),

  // 最近 N 分钟修改的文件
  ...getRecentlyModifiedFiles(30),
];
```

### 2. 测试文件映射

```typescript
// 映射规则
const testMappings = {
  // 组件测试
  'src/components/UserForm.tsx'
    → 'src/components/__tests__/UserForm.test.tsx',

  // 工具函数测试
  'src/utils/validation.ts'
    → 'src/utils/__tests__/validation.test.ts',

  // API 路由测试
  'src/app/api/users/route.ts'
    → 'src/app/api/users/__tests__/route.test.ts',

  // Schema 测试
  'src/schemas/userSchema.ts'
    → 'src/schemas/__tests__/userSchema.test.ts',
};
```

### 3. 依赖分析

检测间接影响：

```typescript
// 如果修改了被广泛使用的工具函数
'src/utils/formatDate.ts' 修改
  → 检测所有导入此函数的文件
  → 运行这些文件的测试
```

## 测试执行策略

### 快速模式（默认）

```bash
pnpm test --run --silent='passed-only' '[pattern]'
```

- ✅ 只显示失败的测试
- ✅ 快速反馈
- ✅ 适合开发过程

### 详细模式

```bash
pnpm test --run '[pattern]'
```

- 显示所有测试结果
- 包含通过的测试
- 详细的错误信息

### 覆盖率模式

```bash
pnpm test --coverage '[pattern]'
```

- 生成覆盖率报告
- 识别未测试的代码
- HTML 报告输出

## 测试结果分析

### 成功情况 ✅

```
✅ 所有测试通过 (12/12)

执行时间：2.3s
覆盖率：85%

建议：
- 可以提交代码了
- 考虑添加边界情况测试
```

### 失败情况 ❌

```
❌ 测试失败 (2/12)

失败的测试：
1. UserForm › should validate required fields
   src/components/__tests__/UserForm.test.tsx:45
   Expected: "Field is required"
   Received: undefined

2. userFormSchema › should reject invalid email
   src/schemas/__tests__/userFormSchema.test.ts:23
   Expected validation to fail

建议修复：
- 检查 UserForm 组件的错误消息显示逻辑
- 验证 email 字段的 Zod schema 配置
- 查看最近的修改是否影响了验证逻辑

相关文件：
- src/components/UserForm.tsx:145 (表单验证)
- src/schemas/userFormSchema.ts:23 (email 验证)
```

## 测试创建辅助

### 检测缺失的测试

```bash
# 检查哪些文件缺少测试
/test --check-coverage

# 输出：
# ⚠️ 以下文件缺少测试：
# - src/components/UserCard.tsx
# - src/utils/formatCurrency.ts
# - src/services/userService.ts
#
# 建议：为这些文件创建测试
```

### 生成测试模板

当检测到新文件缺少测试时：

```typescript
// 自动建议测试文件结构
/**
 * 建议为 src/components/UserCard.tsx 创建测试：
 *
 * 文件：src/components/__tests__/UserCard.test.tsx
 *
 * import { render, screen } from '@testing-library/react';
 * import { UserCard } from '../UserCard';
 *
 * describe('UserCard', () => {
 *   it('should render user information', () => {
 *     // TODO: 实现测试
 *   });
 *
 *   it('should handle click events', () => {
 *     // TODO: 实现测试
 *   });
 * });
 */
```

## 测试类型识别

### 单元测试

```bash
# 测试独立的函数/组件
/test utils/validation
/test components/Button
```

### 集成测试

```bash
# 测试多个模块的交互
/test features/user-management
/test api/workflows
```

### E2E 测试

```bash
# 端到端测试（如果配置）
/test e2e/user-journey
```

## 调试模式

### 详细输出

```bash
# 启用详细日志
/test --verbose

# 显示：
# - 测试查找过程
# - 文件依赖关系
# - 测试执行时间
# - 详细的错误堆栈
```

### 观察模式

```bash
# 文件改变时自动重新运行
/test --watch

# 交互式调试
/test --inspect
```

## 性能优化

### 并行执行

```bash
# 并行运行测试（更快）
/test --parallel

# 限制并发数
/test --max-workers=4
```

### 缓存利用

```bash
# 使用测试缓存
/test --cache

# 清除缓存
/test --clear-cache
```

## 持续集成支持

### CI 模式

```bash
# CI 环境下的测试命令
/test --ci

# 特点：
# - 禁用监听模式
# - 强制重新运行
# - 生成 CI 报告
# - 退出码反映测试结果
```

## 最佳实践

### 测试频率
1. **每次修改后**：运行相关测试
2. **提交前**：运行完整测试套件
3. **推送前**：确保所有测试通过

### 测试策略
- ✅ 优先测试核心业务逻辑
- ✅ 边界情况和错误处理
- ✅ 用户交互流程
- ✅ API 集成点

### 维护测试
- 🔄 定期更新过时的测试
- 🗑️ 删除不必要的测试
- 📝 保持测试简洁明了
- 🎯 一个测试一个目的

## 与其他命令集成

```bash
# 开发流程
/dev              # 启动开发环境
# ... 编写代码 ...
/test             # 运行测试
/analyze          # 代码分析
/save-context     # 保存进度

# 提交前流程
/test --all       # 完整测试
pnpm type-check   # 类型检查
pnpm lint         # 代码规范
git commit        # 提交代码
```

## 故障排除

### 测试找不到

```bash
# 检查测试文件命名
# 正确：*.test.ts, *.test.tsx, *.spec.ts
# 错误：*-test.ts, *Test.ts

# 检查测试目录
# src/**/__tests__/**/*.test.ts
# src/**/*.test.ts
```

### 测试超时

```bash
# 增加超时时间
/test --timeout=10000

# 检查异步处理
# 确保使用 await
# 确保清理定时器
```

### 模拟问题

```bash
# 清除模拟缓存
vi.clearAllMocks()

# 重置模拟
vi.resetAllMocks()
```

## 测试报告

生成详细的测试报告：

```bash
# HTML 报告
pnpm test --coverage --reporter=html

# JSON 报告（供其他工具使用）
pnpm test --json --outputFile=test-results.json

# JUnit 报告（CI 集成）
pnpm test --reporter=junit
```

---

**记住**：测试是代码质量的守护者，不是负担！
