# Data Model: 预算与目标 (Phase 5)

**Feature**: 006-budget-goals · **Date**: 2026-06-29 · **Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

> Phase 1 产出。本文定义 Phase 5 的**领域模型增量**：3 张新表（`finance_budgets` / `finance_budget_periods` / `finance_goals`），**不改任何既有表列**。沿用 finance 域 Drizzle 约定（`uuid` PK `defaultRandom`、`text` userId 无 FK、`decimal(18,2)` 金额、`varchar+$type` 枚举、**不用 pgEnum**、`timestamp defaultNow`）。命名见 `src/database/schema/finance/`。

---

## 1. 实体关系总览

```
finance_categories (既有, parentId 父子树)
  ▲
  │ categoryId (逻辑外键, 不可空时挂某分类)
  │
finance_budgets (预算设置: 复发额度 + 周期)
  │ 1
  │
  │ ∞                          D2 子树汇总 transactions(type='expense', occurredAt∈窗口)
  finance_budget_periods ───────────────────────────────────────────
  (周期历史快照, budgetId+periodStart UNIQUE)        D3 BudgetAlert(现算, 不落库默认)
                                                         │
                                                         ▼
                                                    规则层(确定性) ──► LLM 月报(仅表达)

finance_goals (储蓄目标)
  │ progressBasis: manual | linked | net_worth
  │   ├─ linked   → finance_accounts.balance (via linkedAccountIds jsonb)
  │   ├─ net_worth→ computeNetWorthLive(userId) (既有)
  │   └─ manual   → goals.manualAmount
  │
  └─ D5 ETA ← getMonthlySurplusSeries(userId,N) ← finance_transactions(type∈{income,expense})
```

**核心：单一事实源**——预算「已用」、目标「当前金额」、ETA **均为派生值**（来自 transactions/accounts/净资产），**无物化 live 列**（I1，SC-001 由构造保证）。

---

## 2. 新增表

### 2.1 `finance_budgets` — 预算设置（按分类、按周期复发）

文件：`src/database/schema/finance/budgets.ts`

| 列 | Drizzle 类型 | 说明 |
|----|--------------|------|
| `id` | `uuid('id').primaryKey().defaultRandom().notNull()` | |
| `userId` | `text('user_id').notNull()` | Supabase userId（text，无 FK，与全域一致） |
| `categoryId` | `uuid('category_id')` | **可空**：NULL = 总支出预算；非空 = 该分类**子树**预算（D2）。逻辑指向 `finance_categories.id`（不加 FK 约束，与 transactions.categoryId 同策略） |
| `name` | `text('name')` | 可选标签（如「日常餐饮」）；为空时前端用分类名兜底 |
| `amount` | `decimal('amount', { precision: 18, scale: 2 }).notNull()` | 周期额度（>0）。当前周期按此值算；改值仅影响当前+未来周期（D11 历史不动） |
| `periodType` | `varchar('period_type', { length: 8 }).$type<BudgetPeriodType>().default('month').notNull()` | `month` / `week` / `year`（D1） |
| `alertThreshold` | `decimal('alert_threshold', { precision: 3, scale: 2 }).default('0.80').notNull()` | 预警阈值（D10），0.00–1.00 |
| `rollover` | `boolean('rollover').default(false).notNull()` | 结转开关（D8，**预留，本期不实现逻辑**） |
| `active` | `boolean('active').default(true).notNull()` | 停用开关（软停用，不删行） |
| `createdAt` | `timestamp('created_at').defaultNow().notNull()` | |
| `updatedAt` | `timestamp('updated_at').defaultNow().notNull()` | |

**索引**：
- `finance_budgets_user_active_idx` on (`userId`, `active`) — 列表/汇总热路径。
- `finance_budgets_user_category_period_unique` **unique** on (`userId`, `categoryId`, `periodType`) — 防止同用户对同分类同周期重复建预算。
  - 注：Postgres 唯一索引中 NULL 视为互异，故多条「总支出预算」(categoryId=NULL) 不会被该索引拦；**应用层**在创建前查重（`findByUserCategoryPeriod`），避免重复总支出预算。

**导出**：`budgets` table；`insertBudgetSchema`/`selectBudgetSchema`；`type BudgetItem`、`type NewBudget`。

**枚举常量**（`as const` 数组 + 类型，不用 pgEnum）：
```ts
export const BUDGET_PERIOD_TYPES = ['month', 'week', 'year'] as const;
export type BudgetPeriodType = (typeof BUDGET_PERIOD_TYPES)[number];
```

---

### 2.2 `finance_budget_periods` — 预算周期历史快照（不可变）

文件：`src/database/schema/finance/budgets.ts`（同文件，内聚；镜像既有 net-worth 快照表哲学）

| 列 | Drizzle 类型 | 说明 |
|----|--------------|------|
| `id` | `uuid('id').primaryKey().defaultRandom().notNull()` | |
| `budgetId` | `uuid('budget_id').references(() => budgets.id, { onDelete: 'cascade' }).notNull()` | |
| `userId` | `text('user_id').notNull()` | 冗余以便按用户直查（隔离热路径） |
| `periodStart` | `date('period_start').notNull()` | `[start, end)` 下界（D1） |
| `periodEnd` | `date('period_end').notNull()` | 上界（不含） |
| `amountSnapshot` | `decimal('amount_snapshot', { precision: 18, scale: 2 }).notNull()` | **该周期生效额度**（锁定，D11） |
| `spentSnapshot` | `decimal('spent_snapshot', { precision: 18, scale: 2 }).default('0').notNull()` | 关闭时一次性算定的子树支出汇总（历史展示缓存，可复算校验） |
| `status` | `varchar('status', { length: 12 }).$type<BudgetStatus>().notNull()` | `normal` / `warning` / `overrun`（关闭时定格，D3） |
| `closedAt` | `timestamp('closed_at').defaultNow().notNull()` | 关闭/快照时间 |
| `createdAt` | `timestamp('created_at').defaultNow().notNull()` | |
| `updatedAt` | `timestamp('updated_at').defaultNow().notNull()` | |

**索引**：
- `finance_budget_periods_budget_period_unique` **unique** on (`budgetId`, `periodStart`) — 每预算每周期一条快照。
- `finance_budget_periods_user_period_idx` on (`userId`, `periodStart`, `periodEnd`) — 历史回溯查询。

**维护语义**（D11）：周期关闭（自然到期 / 用户触发 / AI 月报引用）时 upsert 一条；**写入后不可变**（历史周期额度/状态定格，SC-005）。当前周期不写快照（D1 现算）。

**导出**：`budgetPeriods` table；`type BudgetPeriodItem`、`type NewBudgetPeriod`。

```ts
export const BUDGET_STATUSES = ['normal', 'warning', 'overrun'] as const;
export type BudgetStatus = (typeof BUDGET_STATUSES)[number];
```

---

### 2.3 `finance_goals` — 储蓄目标

文件：`src/database/schema/finance/goals.ts`

| 列 | Drizzle 类型 | 说明 |
|----|--------------|------|
| `id` | `uuid('id').primaryKey().defaultRandom().notNull()` | |
| `userId` | `text('user_id').notNull()` | |
| `name` | `text('name').notNull()` | 目标名（如「旅游基金」「应急金」） |
| `targetAmount` | `decimal('target_amount', { precision: 18, scale: 2 }).notNull()` | 目标金额（>0） |
| `targetDate` | `date('target_date')` | **可空**：NULL = 开放式目标（应急金），只显进度不估 ETA（D5） |
| `progressBasis` | `varchar('progress_basis', { length: 12 }).$type<GoalProgressBasis>().default('manual').notNull()` | `manual` / `linked` / `net_worth`（D4） |
| `linkedAccountIds` | `jsonb('linked_account_ids').$type<string[]>().default([]).notNull()` | basis='linked' 时生效；账号 id 数组 |
| `manualAmount` | `decimal('manual_amount', { precision: 18, scale: 2 }).default('0').notNull()` | basis='manual' 时的当前金额（用户手维护） |
| `notes` | `text('notes')` | 备注 |
| `status` | `varchar('status', { length: 12 }).$type<GoalStatus>().default('active').notNull()` | `active` / `archived`（用户操作；**completed 为派生**：progressRate≥1，D4/US2） |
| `completedAt` | `timestamp('completed_at')` | 首次达到 100% 时记录（事件标记） |
| `createdAt` | `timestamp('created_at').defaultNow().notNull()` | |
| `updatedAt` | `timestamp('updated_at').defaultNow().notNull()` | |

**索引**：
- `finance_goals_user_status_idx` on (`userId`, `status`) — 列表热路径。

**派生（不落库）**：
- `currentAmount`：按 progressBasis（D4）。
- `progressRate` = `currentAmount / targetAmount`（targetAmount>0）。
- `eta` / `etaStatus`：`computeGoalProgress`（D5）。

**导出**：`goals` table；`insertGoalSchema`/`selectGoalSchema`；`type GoalItem`、`type NewGoal`。

```ts
export const GOAL_PROGRESS_BASES = ['manual', 'linked', 'net_worth'] as const;
export type GoalProgressBasis = (typeof GOAL_PROGRESS_BASES)[number];
export const GOAL_STATUSES = ['active', 'archived'] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];
```

---

## 3. 既有表：不改列

Phase 5 **不新增/不修改** `finance_transactions` / `finance_accounts` / `finance_categories` 的任何列。预算/目标完全通过**只读消费**既有数据实现：
- 已用：读 `transactions(categoryId, type='expense', occurredAt, amount)` + `categories(parentId)` 子树。
- 目标 linked：读 `accounts(id, balance)`。
- 目标 net_worth：调 `computeNetWorthLive(userId)`。

> 这保证 Phase 5 对 Phase 0–4 **零侵入**，可独立上线/回退。

---

## 4. 关系（`finance/relations.ts` 增补）

```ts
export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  // category 为逻辑关联（无 FK），用 one + fields/references 表达用于 query API
  category: one(categories, { fields: [budgets.categoryId], references: [categories.id] }),
  periods: many(budgetPeriods),
}));

export const budgetPeriodsRelations = relations(budgetPeriods, ({ one }) => ({
  budget: one(budgets, { fields: [budgetPeriods.budgetId], references: [budgets.id] }),
}));

export const goalsRelations = relations(goals, () => ({
  // linkedAccountIds 是 jsonb id 数组，不做关系展开（手动按 id 查 accounts）
}));
```

`finance/index.ts` barrel 增 `export * from './budgets'` 与 `export * from './goals'`。

---

## 5. 状态转换

### 5.1 预算
```
active ──deactivate──► inactive(active=false) ──reactivate──► active
(amount 可随时改；仅影响当前+未来周期)
```

### 5.2 预算周期（D11 快照）
```
当前周期(现算) ──周期关闭/手动快照/AI引用──► finance_budget_periods(不可变)
```

### 5.3 目标
```
active ──archive──► archived ──unarchive──► active
(progressRate≥100% → 派生 completed + 记 completedAt；不强制改 status)
```

---

## 6. 派生计算（纯函数，落 services/finance）

| 计算 | 函数（建议） | 输入 | 输出 | 复用 |
|------|-------------|------|------|------|
| 周期边界 | `computePeriodRange(periodType, refDate)` | periodType, 今天 | `{start,end}` (D1) | — |
| 分类子树 | `buildCategorySubtreeMap(categories[])` | 用户分类树 | `Map<catId, Set<descId>>` (D2) | `categories` |
| 预算已用 | `computeBudgetSpent(budget, period, txns)` | 子树+周期内 expense | cents (D2) | `money.ts` |
| 预算预警 | `computeBudgetAlert(budget, period, spent)` | — | `BudgetAlert` (D3) | — |
| 目标当前金额 | `computeGoalCurrent(goal, netWorth, accounts)` | basis (D4) | cents | `net-worth.service` |
| 月结余序列 | `getMonthlySurplusSeries(userId, N)` | — | `{month,income,expense,surplus}[]` (D5/D6) | `sumAmountByType` 口径 |
| 目标进度+ETA | `computeGoalProgress(goal, current, surplusSeries)` | — | `{progressRate,eta,etaStatus}` (D5) | — |

**金额规则**：DB `decimal(18,2)` ↔ API `string` ↔ 计算 `toCents/fromCents/addCents`（整数分），禁浮点（I2）。

---

## 7. 不变量（I1–I8，测试锚点）

- **I1（单一事实源）**：预算「已用」、目标「当前金额」、ETA **均由 transactions/accounts/净资产派生**；无物化 live 列可漂移（SC-001，不一致发生率=0）。
- **I2（金额精度）**：所有金额 `decimal(18,2)`；运算经 `money.ts` 整数分，禁浮点（沿用全域）。
- **I3（历史周期不可变）**：`finance_budget_periods` 写入后不可变；改预算额度**不**回溯改写历史快照（SC-005，edge「预算调整：历史不变」）。
- **I4（确定性结论）**：`BudgetAlert` 与目标 ETA 由**纯函数**对账目数据计算，可复现、可逐项追溯（SC-003/SC-004）。
- **I5（不产出虚假乐观）**：avgMonthlySurplus ≤ 0 时 ETA 返回 `unreachable`，**绝不**给出虚假达成日期（SC-003）。
- **I6（用户隔离）**：所有表按 `userId` 隔离；repo 经 `requireUserId()` 硬过滤（FR-009）。
- **I7（支出-only 计入预算）**：预算已用仅汇总 `type='expense'`；transfer/repayment/revaluation/disposal 排除（与 income/expense 口径一致）。
- **I8（单预算零双计）**：一笔交易对一个预算的已用**至多贡献一次**（`categoryId∈子树` 判定一次）（FR-004）。

---

## 8. 迁移

- 工具：`pnpm db:generate`（drizzle-kit），输出 `src/database/migrations/`，dialect postgresql、strict。
- 变更：**仅 3 张新表 + 索引 + relations**，**无既有表改动** → 纯增量、可逆、无历史数据依赖、可独立回退。
- 应用顺序：`finance_budgets` → `finance_budget_periods`(FK 依赖 budgets) → `finance_goals`。
- 校验：`pnpm type-check` 通过；`pnpm test --run --silent='passed-only' 'tests/finance/budget'` 与 `'tests/finance/goal'` 全绿。

---

## 9. 影响面速查（实现阶段参照）

| 层 | 新增 | 改动 |
|----|------|------|
| schema | `budgets.ts`(budgets+budgetPeriods), `goals.ts` | `relations.ts`, `finance/index.ts`(barrel) |
| repository | `budget.repository.ts`(CRUD+periods), `goal.repository.ts` | — |
| service | `budget.service.ts`(已用+alert+周期), `goal.service.ts`(进度+ETA+surplusSeries) | `ledger.service.ts`(写后 best-effort 回带 budgetAlerts，D9，**非阻塞**) |
| api `_lib` | — | `validation.ts`(budget/goal schemas), `serialize.ts`(budget/goal/alert DTOs) |
| api routes | `budgets/`, `budgets/[id]/`, `budgets/[id]/periods/`(历史), `budgets/alerts/`(当前预警), `goals/`, `goals/[id]/`, `goals/[id]/progress/`(ETA) | `transactions/route.ts`(响应可选附 budgetAlerts) |
| features/UI | `features/budget-goals/`(预算设置/进度环/超支提示、目标卡片/ETA) | 个人仪表盘增预算/目标概览 |
| tests | `tests/finance/budget.service.test.ts`, `goal.service.test.ts` | — |
