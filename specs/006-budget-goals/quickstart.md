# Quickstart: 预算与目标 (Phase 5)

**Feature**: 006-budget-goals · **Date**: 2026-06-29 · **Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md)

> Phase 1 产出。本文给出 Phase 5（预算 + 储蓄目标）的本地环境与端到端验证步骤。Phase 5 **不引入新依赖**、**不改既有表**，仅在 finance 域内增量 3 张表 + 服务 + 路由 + UI。

---

## 1. 前置条件

- Node 20+、`pnpm`（主包管理器）。
- 已完成 Phase 0–4（账目平衡、净资产快照、资产/负债、投资、家庭）。Phase 5 只**读**这些数据。
- Supabase Auth 已配置；本地 `.env.local` 含 `DATABASE_URL`（Neon/Supabase Postgres）与 Supabase 鉴权变量（与 Phase 0–4 一致）。
- 登录态：所有端点需 `requireUserId()`（401 否则）。

> 已知基线：`pnpm type-check` 在遗留模块存在历史红（~340 errors，与本特性无关）；**只计本特性新增文件的类型零错**。

---

## 2. 安装

无新依赖。确认既有依赖就位：
```bash
pnpm install
```

涉及包（均已存在）：`drizzle-orm`、`drizzle-kit`、`zod`、`next`、`@supabase/ssr`、`vitest`、`@mui/material`、`zustand`、`@tanstack/react-query`。

---

## 3. 数据库迁移（3 张新表）

```bash
# 生成迁移（输出 src/database/migrations/，纯增量、无既有表改动）
pnpm db:generate

# 应用到数据库（按团队既有方式：db:push 或 db:migrate）
pnpm db:push          # 或 pnpm db:migrate
```

新增表：`finance_budgets`、`finance_budget_periods`、`finance_goals`（+ 索引 + relations）。详见 [data-model.md](./data-model.md) §2。

---

## 4. 运行

```bash
pnpm dev              # Next.js 开发服务器（含 finance API Routes）
```

默认 `http://localhost:3000`。

---

## 5. 端到端验证（预算超支闭环 — 对应 US1）

> 假设已登录用户 `u1`，已建分类：`餐饮(cat-dining)`（expense）、子类 `外卖(cat-takeout)`。

**① 给「餐饮」设月度预算 ¥2,000**
```bash
curl -X POST http://localhost:3000/api/finance/budgets \
  -H "Content-Type: application/json" \
  -b cookie.txt \
  -d '{
    "categoryId": "cat-dining",
    "name": "日常餐饮",
    "amount": "2000.00",
    "periodType": "month",
    "alertThreshold": "0.80"
  }'
# 期望 201：{ "budget": { ..., "spent": "0.00", "remaining": "2000.00",
#                          "ratio": "0.0000", "status": "normal" } }
```

**② 记一笔餐饮支出 ¥1,500**
```bash
curl -X POST http://localhost:3000/api/finance/transactions \
  -H "Content-Type: application/json" -b cookie.txt \
  -d '{ "categoryId": "cat-dining", "amount": "1500.00", "type": "expense" }'
```

**③ 查预算 → 已用 ¥1,500 / 剩余 ¥500（75%，仍 normal）**
```bash
curl http://localhost:3000/api/finance/budgets/<budgetId>?period=$(date +%F) -b cookie.txt
```

**④ 再记 ¥600（累计 ¥2,100，超支 ¥100）→ 触发 overrun**
```bash
curl -X POST http://localhost:3000/api/finance/transactions \
  -H "Content-Type: application/json" -b cookie.txt \
  -d '{ "categoryId": "cat-takeout", "amount": "600.00", "type": "expense" }'
# 期望响应附带（D9 best-effort）：
#   "budgetAlerts": [ { "categoryId": "cat-dining", "status": "overrun",
#                       "spent": "2100.00", "remaining": "-100.00", "ratio": "1.0500",
#                       "verdict": "餐饮预算已超支 ¥100.00" } ]
```
> 子类 `外卖` 支出计入父类「餐饮」预算（D2 子树汇总），验证 FR-004。

**⑤ 预警汇总端点**
```bash
curl "http://localhost:3000/api/finance/budgets/alerts?status=overrun" -b cookie.txt
# 期望 { "alerts": [ ... overrun 项 ... ] }
```

---

## 6. 端到端验证（目标进度 + ETA — 对应 US2）

**① 设定旅游基金 ¥30,000，关联已有储蓄账户**
```bash
curl -X POST http://localhost:3000/api/finance/goals \
  -H "Content-Type: application/json" -b cookie.txt \
  -d '{
    "name": "旅游基金",
    "targetAmount": "30000.00",
    "targetDate": "2026-12-31",
    "progressBasis": "linked",
    "linkedAccountIds": ["acc-savings"]
  }'
# 期望 201：{ "goal": { ..., "currentAmount": "<Σ 账号余额>", "progressRate": "...", "eta": {...} } }
```

**② 查进度与 ETA 明细（可解释）**
```bash
curl "http://localhost:3000/api/finance/goals/<goalId>/progress?windowMonths=3" -b cookie.txt
# 期望返回 surplusSeries（近 3 月 income/expense/surplus）+ eta
#   avgMonthlySurplus>0 → etaStatus='on_track'，monthsToGoal=ceil(remaining/avgSurplus)
#   avgMonthlySurplus<=0 → etaStatus='unreachable'，etaDate=null（I5，无虚假乐观）
```

**③ 无截止日开放式目标（应急金）**
```bash
curl -X POST http://localhost:3000/api/finance/goals -H "Content-Type: application/json" -b cookie.txt \
  -d '{ "name": "应急金", "targetAmount": "60000.00", "progressBasis": "net_worth" }'
# 期望 eta.etaDate=null（只显进度，不估 ETA，D5 edge）
```

---

## 7. 测试

仅跑本特性相关文件（勿跑全量）：
```bash
pnpm test --run --silent='passed-only' 'tests/finance/budget'
pnpm test --run --silent='passed-only' 'tests/finance/goal'
```

类型检查（仅关注新增文件无新增错误）：
```bash
pnpm type-check
```

测试重点锚点（对应不变量 I1–I8 与 SC-001..SC-005）：
- **I1/SC-001**：记支出后预算 `spent` 立即正确，与账目汇总一致（单一事实源）。
- **I2**：金额全程 cents，无浮点误差。
- **I4/SC-004**：`BudgetAlert`/ETA 数值可复现、可逐项追溯；改 LLM 输入不影响数值。
- **I5/SC-003**：近 N 月结余≤0 时 ETA 返回 `unreachable`、无日期。
- **I7**：transfer/repayment 支出不计入预算已用。
- **I8/FR-004**：子树汇总，单预算内一笔交易不重复计入。
- **I3/SC-005**：改预算额度后，历史周期快照 `amountSnapshot` 不变。
- **C2**：跨用户访问他人预算/目标 → 404。

---

## 8. 常见问题

- **预算已用与账目不一致**：不应发生（I1，现算）。若出现，检查 `occurredAt` 时区与周期边界（D1 `[start,end)`），及 `type` 是否为 `expense`（transfer 不计）。
- **ETA 显示「无法达成」**：近期月结余≤0（支出≥收入），属**正确**行为（SC-003），非 bug；调高收入/降支后自动刷新。
- **目标进度对不上**：确认 `progressBasis`——`linked` 按 `linkedAccountIds` 余额、`net_worth` 按总净资产、`manual` 按 `manualAmount`（D4）。
- **历史预算额度「变了」**：历史读 `finance_budget_periods.amountSnapshot`（锁定）；只有当前周期随 `budgets.amount` 变（I3/SC-005）。
