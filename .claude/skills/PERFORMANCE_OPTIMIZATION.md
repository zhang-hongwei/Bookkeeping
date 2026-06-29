# Skills Performance Optimization

Date: 2025-11-04

## 优化目标

减少自动激活技能数量，降低性能开销，提升响应速度。

## 优化前状态

- **总技能数**: 23个（优化后：20个）
- **自动激活**: 20个技能设置为 `autoActivate: true`（优化后：8个）
- **手动激活**: 3个技能（performance, template-skill）

## 删除的技能

以下3个技能已被删除：
1. **echarts-integration** - ECharts 图表集成（不需要）
2. **lemonsqueezy-integration** - Lemon Squeezy 集成（不需要）
3. **webapp-testing** - Playwright 测试（不需要）

## 性能问题

1. ⚠️ **触发器检查开销** - 每次输入都要匹配20个技能的关键词和模式
2. ⚠️ **上下文消耗** - 激活的技能会加载到上下文，消耗token
3. ⚠️ **响应延迟** - 过多技能可能降低响应速度

## 优化策略

将技能按使用频率和重要性分为三类：

### ✅ 核心技能（保持 autoActivate: true） - 8个

高频使用，对日常开发至关重要：

1. **frontend-dev** - React/MUI/Tailwind 前端开发
2. **backend-dev** - API 路由和服务层开发
3. **database-dev** - Drizzle ORM 和 PostgreSQL
4. **testing** - 测试开发
5. **nextjs** - Next.js 开发
6. **skill-developer** - 技能系统开发
7. **refactoring** - 代码重构
8. **state-management** - Zustand 状态管理

### ⚡ 按需激活（改为 autoActivate: false） - 11个

低频使用，需要时通过关键词或手动激活：

#### 集成类技能（5个）
9. **supabase-integration** - Supabase 集成
10. **stripe-integration** - Stripe 支付
11. **file-storage** - 文件存储
12. **email-service** - 邮件服务
14. **paddle-integration** - Paddle 支付
15. **neon-database** - Neon 数据库

#### 特殊技能（5个）
16. **performance** - 性能优化
17. **form-handling** - 表单处理
18. **mcp-builder** - MCP 服务器开发
19. **skill-creator** - 创建新技能

### 📚 模板技能（1个）
20. **template-skill** - 技能模板

## 优化效果

### 性能提升
- ✅ 减少 60% 的自动触发检查（从 20 → 8）
- ✅ 删除3个不需要的技能（从 23 → 20）
- ✅ 降低上下文消耗
- ✅ 提升响应速度
- ✅ 保持核心开发体验不变

### 使用影响
- **无影响**: 核心开发工作流不受影响
- **需要关键词**: 使用集成技能时需明确提及关键词
  - 例如: "使用 Supabase 创建用户认证"
  - 例如: "集成 Stripe 支付"
- **手动激活**: 可使用 Skill tool 手动激活特定技能

## 激活方式

### 自动激活
核心技能会根据以下条件自动激活：
- 关键词匹配（如 "frontend", "api", "database", "test"）
- 文件路径匹配（如 `*.tsx`, `app/api/**/*`, `*.test.ts`）
- 意图模式匹配（如 "创建组件", "实现API"）

### 手动激活
按需技能可通过以下方式激活：
1. **关键词触发**: 在对话中提及关键词（如 "supabase", "stripe"）
2. **Skill tool**: `Skill("supabase-integration")`
3. **直接调用**: 明确说明需要使用该技能

## 配置变更

修改文件: `.claude/skills/skill-rules.json`

变更内容:
- 11个技能的 `autoActivate` 从 `true` 改为 `false`
- 删除3个不需要的技能配置（echarts-integration, lemonsqueezy-integration, webapp-testing）

## 回滚方案

如果需要恢复自动激活，可以将对应技能的 `autoActivate` 改回 `true`：

```json
{
  "skill-name": {
    "autoActivate": true  // 改回 true
  }
}
```

## 建议

1. **核心开发**: 无需改变，继续正常使用
2. **集成开发**: 使用时明确提及服务名称（如 "Supabase", "Stripe"）
3. **特殊场景**: 需要时手动激活对应技能
4. **监控效果**: 观察实际使用体验，必要时调整配置

---

优化执行人: Claude Code
