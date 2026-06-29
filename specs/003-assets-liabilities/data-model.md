# Data Model — 资产/负债完整化 (Phase 2)

> Phase 2 输出：在 Phase 0/1 复式记账 schema（`src/database/schema/finance/`）上增量。
> **模型真相源约定（以实际实现为准）**：主键 `uuid('id').defaultRandom()`；`user_id` 为 `text`（沿用 mealRecords 约定，**不加 FK**）；金额一律 `numeric(18,2)` 禁止浮点（内部走「分」整数）；命名复数 snake_case；`jsonb` 存分项/历史；新表与 Phase 0/1 同置于 `finance/` 子领域，barrel 经 `index.ts` 接入。

## 实体总览

```
Phase 0/1（已实现，本阶段依赖/扩展）:
  finance_accounts ──< finance_entries >── finance_transactions
  finance_categories；系统权益账户 __income/__expense
  finance_net_worth_snapshots（每日净资产快照，曲线数据源）

Phase 2 新增:
  finance_asset_details      资产明细（成本/估值来源/置信度/估值历史）1:1 ← real_asset/investment 账户
  finance_liability_details  负债明细（本金/利率/月供/到期/已还/账单周期）1:1 ← credit/贷款 账户

Phase 2 schema 变更:
  finance_accounts.type          enum += mortgage / car_loan / consumer_loan / borrowing
                                 （+ 导出 LIABILITY_ACCOUNT_TYPES）
  finance_accounts(EQUITY)       __revaluation 系统权益账户（未实现损益桶）
  finance_transactions.type      enum += repayment / revaluation / disposal
  finance_transactions           += principal_amount / interest_amount（nullable，repayment 专用）
```

**核心不变式（沿用 Phase 0/1 并扩展）**：
- **复式平衡**：任意 transaction `Σdebit == Σcredit`、每条 `amount>0`（Phase 0 `assertBalanced`）。`repayment`/`disposal` 为 3 腿，`revaluation` 为 2 腿，均落库前强制校验。
- **余额真相源**：资产当前价值 / 负债剩余本金（欠款）= 账户 `balance`，**只能由 `entries` 维护**（Phase 0 `balance.service`）。明细表不冗余存「当前价值/剩余本金」，避免双写漂移。
- **快照一致**：任意日期 `net_worth_snapshots.net_worth` == 该日期由 `accounts.balance` 推导的净值（Phase 1，本阶段负债识别扩展为 `LIABILITY_ACCOUNT_TYPES` 后不变式仍成立）。
- **诚实估值**：`real_asset`/`investment` 必有 `estimateConfidence`；低流动性估值不污染高流动性视图（research R2）。
- **用户隔离**：所有明细表带 `user_id`，repository 按 `userId` 作用域（FR-009）。

---

## 1. finance_asset_details（资产明细 — 1:1 挂 real_asset/investment 账户）

| 字段 | 类型 | 说明 / 约束 |
|------|------|-------------|
| `id` | uuid PK | `defaultRandom()` |
| `user_id` | text, not null | 数据隔离（与 accounts 同，不加 FK） |
| `account_id` | uuid, not null, unique | FK→finance_accounts(id) `onDelete: cascade`；1:1 |
| `cost_basis` | numeric(18,2) | 成本/取得成本（建账估值或购入价） |
| `valuation_source` | varchar(32) | 估值来源：`manual`/`market`/`estimate`（默认 `manual`） |
| `estimate_confidence` | varchar(16) | 枚举 `high`/`medium`/`low`（默认 `medium`） |
| `valuation_date` | date | 最近估值日 |
| `valuation_history` | jsonb | 估值轨迹 `[{ date, value, confidence, source }]`（追加，不覆盖） |
| `is_disposed` | boolean | 是否已处置（default false；处置后 true 并归档账户） |
| `created_at / updated_at` | timestamp | `defaultNow()` |

**约束**：`UNIQUE(account_id)`（1:1）。`estimate_confidence ∈ {high,medium,low}`（应用层 Zod 校验）。

**派生**：资产**当前价值** = 关联账户 `finance_accounts.balance`（真相源，不在此表冗余）。

**关系**：`finance_accounts` 1—1 `finance_asset_details`（仅 `real_asset`/`investment` 类账户挂明细）。

---

## 2. finance_liability_details（负债明细 — 1:1 挂 credit/贷款 账户）

| 字段 | 类型 | 说明 / 约束 |
|------|------|-------------|
| `id` | uuid PK | `defaultRandom()` |
| `user_id` | text, not null | 数据隔离 |
| `account_id` | uuid, not null, unique | FK→finance_accounts(id) `onDelete: cascade`；1:1 |
| `kind` | varchar(32) | 负债种类：`credit`/`mortgage`/`car_loan`/`consumer_loan`/`borrowing` |
| `principal` | numeric(18,2) | 原始本金（建账时定，不变；credit 可为 0/空） |
| `interest_rate` | numeric(8,5) | 年利率（小数，如 0.0450 = 4.5%）；0/无利率借款可为 null |
| `monthly_payment` | numeric(18,2) | 月供；无固定月供（如亲友借款）可为 null |
| `due_date` | date | 到期日；无固定到期可为 null |
| `paid_amount` | numeric(18,2) | 已还本金累计（`recordRepayment` 单调递增；default 0） |
| `statement_day` | integer | 账单日（月内 1–31），仅 credit；其它可为 null |
| `repayment_day` | integer | 还款日（月内 1–31），仅 credit；其它可为 null |
| `created_at / updated_at` | timestamp | `defaultNow()` |

**约束**：`UNIQUE(account_id)`（1:1）。`kind` ∈ 集合；`statement_day`/`repayment_day ∈ [1,31]`（应用层 Zod）。

**派生（真相源 + 派生关系）**：
- **剩余本金 / 当前欠款** = 关联账户 `finance_accounts.balance`（真相源）。
- **累计已还本金** = `paid_amount`；**原始本金** = `principal`。巡检：`principal − paid_amount` 应近似 `balance`（偏差即异常，可作校验项，非硬约束）。
- 信用卡**本期账单/已还/待还** = 由 `finance_entries` 按账单周期聚合（research R6，不入库）。

**关系**：`finance_accounts` 1—1 `finance_liability_details`（仅负债类账户挂明细）。

---

## 3. Phase 0/1 schema 变更

### 3.1 finance_accounts.type += 贷款类型 + LIABILITY_ACCOUNT_TYPES

```diff
  ACCOUNT_TYPES = ['cash','savings','credit','investment','real_asset','equity']
+ // Phase 2：新增 4 种负债（贷方正常余额，balance 正值 = 欠款）
+ ACCOUNT_TYPES += ['mortgage','car_loan','consumer_loan','borrowing']
+ LIABILITY_ACCOUNT_TYPES = ['credit','mortgage','car_loan','consumer_loan','borrowing']
```

- `ASSET_ACCOUNT_TYPES` 不变（仍借方正常）；`normalBalanceIsDebit()` 天然兼容（非资产非 equity → 贷方正常）。
- **`net-worth.service` 必改**：负债识别 `a.type === 'credit'` → `LIABILITY_ACCOUNT_TYPES.includes(a.type)`（`computeNetWorthFromAccounts` / `computeNetWorthAtDatePure`）。

### 3.2 系统权益账户 += __revaluation（未实现损益桶）

```diff
  EQUITY_ACCOUNT_NAMES = { income: '__income', expense: '__expense' }
+ EQUITY_ACCOUNT_NAMES += { revaluation: '__revaluation' }
```

- 由 `ensureSystemEquityAccounts()` 幂等创建（`user_id='__system__'`、`type='equity'`、`systemKey='revaluation'`、`includeInNetWorth=false`，不计净资产）。
- 用途：`revaluation` 交易的对腿（资产估值变动的未实现损益），与已实现 P&L（`__income`/`__expense`）分离。

### 3.3 finance_transactions.type += 交易类型 + 拆分列

```diff
  TRANSACTION_TYPES = ['income','expense','transfer']
+ TRANSACTION_TYPES += ['repayment','revaluation','disposal']
+ finance_transactions += principal_amount  numeric(18,2)  nullable  // repayment 本金拆分
+ finance_transactions += interest_amount   numeric(18,2)  nullable  // repayment 利息拆分
```

- `repayment`：`amount = principal + interest`；`principal_amount`/`interest_amount` 拆分记录（仅 repayment 填，其它 null）。
- `revaluation`：`amount = |delta|`（估值变动绝对值），2 腿（资产 + `__revaluation`）。
- `disposal`：`amount = proceeds`（出售款），3 腿（现金 + 资产清零 + 损益）。
- `transactions.source` 不变（Phase 1 已含 ocr）；Phase 2 新交易 `source` 默认 `manual`。

---

## 4. 复式分录规则（Phase 2 三种新交易）

> 均在 `ledger.service` 单事务内构造、`assertBalanced` 后落库、原子更新 `balance`、事务后 `refreshSnapshots`。金额一律「分」整数运算。

### repayment（还款，3 腿）— research R3

| 腿 | 账户 | 方向 | 金额 |
|----|------|------|------|
| 1 | 负债账户 | debit | `principal`（减少欠款） |
| 2 | `__expense` | debit | `interest`（利息计入支出） |
| 3 | 现金账户 | credit | `principal + interest`（现金减少合计） |

校验：`Σdebit(principal+interest) == Σcredit(principal+interest)` ✓。结果：负债 `−principal`、现金 `−(principal+interest)`、净资产 `−interest`、资产端不变。

### revaluation（估值更新，2 腿）— research R4

设 `delta = newValue − balance`：

| delta | 腿1 | 腿2 |
|-------|-----|-----|
| `delta > 0`（升值） | debit 资产 `delta` | credit `__revaluation` `delta` |
| `delta < 0`（贬值） | debit `__revaluation` `\|delta\|` | credit 资产 `\|delta\|` |

校验：`Σdebit == Σcredit` ✓。资产 `balance` 调整至 `newValue`。

### disposal（处置，3 腿）— research R5

设 `proceeds` = 出售款，`balance` = 账面价值，`gap = proceeds − balance`：

| 腿 | 账户 | 方向 | 金额 |
|----|------|------|------|
| 1 | 现金账户 | debit | `proceeds` |
| 2 | 资产账户 | credit | `balance`（清零） |
| 3 | `gap>0`: `__income` credit `gap`；`gap<0`: `__expense` debit `\|gap\|` | — | `\|gap\|`（损益平衡腿） |

校验：`Σdebit(proceeds + 损失) == Σcredit(balance + 收益)` ✓。资产出账、现金入账、实现损益入 P&L。

---

## 关系（relations.ts 集中扩展）

- `finance_accounts` 1—1 `finance_asset_details`（`account_id`，仅 real_asset/investment）。
- `finance_accounts` 1—1 `finance_liability_details`（`account_id`，仅负债类）。
- `finance_asset_details` / `finance_liability_details` 按 `(user_id, account_id)` 唯一定位；`users` 为纯 text `userId`，不在此建模（与 Phase 0/1 一致）。

## 服务层入口（新增/变更于 services/finance）

- `ledger.service`（变更）：
  - `recordRepayment(input)`：还款 3 腿 + 更新 `liability_details.paid_amount` + `refreshSnapshots`（R3）。
  - `ensureSystemEquityAccounts()` 扩展返回 `revaluation`（R4）。
- `asset.service`（新增）：
  - `register/update(userId, input)`：建/改 `real_asset`/`investment` 账户 + upsert `asset_details`（成本/置信度/来源）。
  - `revalueAsset(userId, assetAccountId, newValue, ...)`：revaluation 交易 + 更新明细 + 追加 `valuation_history` + `refreshSnapshots`（R4）。
  - `disposeAsset(userId, assetAccountId, cashAccountId, proceeds, ...)`：disposal 交易 + 标记 `is_disposed`/归档 + `refreshSnapshots`（R5）。
  - `list(userId)`：资产列表带明细 + 当前价值(=balance) + 置信度。
- `liability.service`（新增）：
  - `register/update(userId, input)`：建/改负债账户（credit/贷款）+ upsert `liability_details`。
  - `getCreditCardPeriod(userId, accountId)`：由 `entries` 聚合本期账单/已还/待还 + 还款提示（R6）。
  - `list(userId)`：负债列表带明细 + 剩余本金(=balance) + 已还。
- `net-worth.service`（变更）：
  - 负债识别改 `LIABILITY_ACCOUNT_TYPES`（R7）。
  - 流动性视图派生：`liquidNetWorth = (breakdown.cash+savings+investment) − totalLiabilities`，由路由 `?view=high|all` 触发（R2）。
