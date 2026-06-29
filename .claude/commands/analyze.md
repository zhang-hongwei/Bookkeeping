---
description: 分析代码库质量、性能和架构
---

# /analyze 命令

## 代码质量分析

### 1. 运行完整分析套件

分析整个代码库的质量指标：

```bash
# TypeScript 类型覆盖
pnpm type-check

# ESLint 规则检查
pnpm lint

# 代码复杂度分析
pnpm analyze:complexity

# 依赖分析
pnpm analyze:deps
```

### 2. 识别问题区域

**高复杂度文件**（需要重构）：
- 圈复杂度 > 10
- 文件行数 > 300
- 函数 > 50 行

**查找代码异味**：
```bash
# 查找 TODO/FIXME
grep -r "TODO\|FIXME\|HACK\|XXX" src/

# 查找 any 类型使用
grep -r "any" src/ --include="*.ts" --include="*.tsx"

# 查找 console.log
grep -r "console\." src/ --include="*.ts" --include="*.tsx"
```

### 3. 测试覆盖率

```bash
# 生成覆盖率报告
pnpm test --coverage

# 查看 HTML 报告
open coverage/index.html
```

目标指标：
- 语句覆盖率: > 80%
- 分支覆盖率: > 75%
- 函数覆盖率: > 80%
- 行覆盖率: > 80%

## 性能分析

### 1. Bundle 分析

```bash
# 构建并分析 bundle
ANALYZE=true pnpm build

# 查看 bundle 大小
pnpm analyze:bundle
```

关注点：
- 总包大小 < 500KB
- 首屏 JS < 200KB
- 最大单个 chunk < 250KB

### 2. Lighthouse 分析

在浏览器中运行 Lighthouse：
1. 打开 Chrome DevTools
2. 切换到 Lighthouse 标签
3. 运行分析

目标分数：
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90

### 3. 渲染性能

使用 React DevTools Profiler：
1. 安装 React DevTools
2. 打开 Profiler 标签
3. 记录用户交互
4. 分析渲染时间

## 架构分析

### 1. 依赖关系

```bash
# 生成依赖图
pnpm analyze:deps-graph

# 检查循环依赖
pnpm analyze:circular

# 查看未使用的依赖
pnpm analyze:unused
```

### 2. 模块边界检查

验证分层架构：
- `app/` 不应导入 `services/`（服务端）
- `services/` 不应导入 `components/`
- `database/` 不应导入业务逻辑

### 3. 文件组织评估

```bash
# 统计文件分布
find src -type f -name "*.tsx" | wc -l  # React 组件数
find src -type f -name "*.ts" | wc -l   # TypeScript 文件数

# 查看最大的文件
find src -type f -exec wc -l {} + | sort -rn | head -20

# 分析目录结构
tree src -L 3 -d
```

## 安全分析

### 1. 依赖漏洞扫描

```bash
# 检查已知漏洞
pnpm audit

# 自动修复
pnpm audit fix

# 检查过时的包
pnpm outdated
```

### 2. 代码安全扫描

检查常见安全问题：
```bash
# SQL 注入风险
grep -r "db.query\|executeRaw" src/

# XSS 风险
grep -r "dangerouslySetInnerHTML" src/

# 硬编码密钥
grep -r "password\|secret\|key\|token" src/ --include="*.ts"
```

## 数据库分析

### 1. Schema 分析

```bash
# 生成 schema 可视化
pnpm db:visualize

# 检查索引使用
pnpm db:analyze-indexes
```

### 2. 查询性能

在代码中添加查询分析：
```typescript
// 开启查询日志
const result = await db.select().from(users).explain();
console.log(result);
```

## 生成分析报告

### 综合报告模板

```markdown
# 代码库分析报告

## 概览
- 总文件数: XXX
- 代码行数: XXX
- 测试覆盖率: XX%
- TypeScript 覆盖: XX%

## 质量指标
### ✅ 良好
- [列出良好的方面]

### ⚠️ 需要关注
- [列出警告项]

### ❌ 需要改进
- [列出严重问题]

## 性能指标
- Bundle 大小: XXX KB
- 首屏加载: XX ms
- Lighthouse 分数: XX

## 架构健康度
- 模块耦合度: 低/中/高
- 技术债务: 低/中/高
- 可维护性: 优/良/差

## 建议行动
1. 优先级高: [行动项]
2. 优先级中: [行动项]
3. 优先级低: [行动项]
```

## 持续监控

设置定期分析任务：

```json
// package.json
{
  "scripts": {
    "analyze:all": "npm-run-all analyze:*",
    "analyze:quality": "pnpm lint && pnpm type-check",
    "analyze:test": "pnpm test --coverage",
    "analyze:bundle": "ANALYZE=true next build"
  }
}
```

在 CI/CD 中集成：
```yaml
- name: Code Analysis
  run: pnpm analyze:all
```