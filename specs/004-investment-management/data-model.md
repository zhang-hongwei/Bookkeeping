# Data Model — 投资管理 (Phase 3)

> Phase 3 输出：在 Phase 0/1/2 复式记账 schema（`src/database/schema/finance/`）上增量。
> **模型真相源约定（以实际实现为准）**：主键 `uuid('id').defaultRandom()`；`user_id` 为 `text`（沿用 mealRecords 约定，**不加 FK**）；金额一律 `numeric(18,2)` 禁止浮点（内部走「分」整数）；份额/单价/净值用 `numeric(18,6)` 高精度列；命名复数 snake_case；`jsonb` 存分项/历史；新表与 Phase 0/1/2 同置于 `finance/` 子领域，barrel 经 `index.ts` 接入。

## 实体总览

```
Phase 0/1/2（已存在，本阶段依赖/扩展）:
  finance_accounts ──< finance_entries >── finance_transactions
  finance_categories；系统权益账户 __income/__expense/__revaluation(schema已定义，过账待实现)
  finance_net_worth_snapshots（每日净资产快照，曲线数据源）
  finance_asset_details（资产明细：成本/估值来源/置信度/估值历史）1:1 ← real_asset/investment 账户
  finance_liability_details（负债明细）

Phase 3 新增:
  finance_positions           持仓（品种/数量/成本价/现价缓存/来源/时间）1:1 ← investment 账户
  finance_instruments         品种目录 + 行情缓存（code/type/latestPrice/source/updatedAt/stale）
  finance_investment_trades   投资交易语义层 1:N ← 持仓（action/shares/price/fee/tax/transactionId）
  finance_dca_plans           定投计划（可选：instrument/amount/frequency/dayOfMonth/cashAccount/active）

Phase 3 schema/服务变更（承接 003 未实现部分）:
  ledger.service.buildEntries 支持 revaluation(2腿)/disposal(3腿)
  ensureSystemEquityAccounts() 创建 __revaluation（未实现损益桶）
  _lib/validation.ts 交易/账户类型枚举补齐 revaluation/disposal
```

**核心不变式（沿用 Phase 0/1/2 并扩展）**：
- **复式平衡**：任意 transaction `Σdebit == Σcredit`、每条 `amount>0`（Phase 0 `assertBalanced`）。`买入`为 transfer 2 腿、`卖出`为 disposal 3 腿、`现价同步`为 revaluation 2 腿、`现金分红`为 income 2 腿，均落库前强制校验。
- **余额真相源**：持仓**当前市值** = 关联 `investment` 账户 `finance_accounts.balance`，**只能由 `entries` 维护**（Phase 0 `balance.service`）。`positions` 不冗余存「当前市值」，只存「份额/成本价/现价缓存/来源」；现价缓存仅为展示与触发 `revaluation`，不作为市值真相源。
- **快照一致**：现价变动经 `revaluation` 改 `balance` 后 `refreshSnapshots`，任意日期 `net_worth_snapshots.net_worth` == 由 `accounts.balance` 推导的净值（FR-008，曲线不留旧值）。
- **诚实估值**：现价必须带 `priceSource`/`lastPriceAt`；行情缺失/陈旧不得展示虚假价，降级为手动输入并标注（FR-004，设计 P6）。
- **用户隔离**：所有新表带 `user_id`，repository 按 `userId` 作用域（FR-009）。
- **分析走规则引擎**：资产配置占比、集中度预警为确定性结论，走纯函数 + `rules-engine`（设计 P5）。

---

## 1. finance_positions（持仓 — 1:1 挂 investment 账户）

| 字段 | 类型 | 说明 / 约束 |
|------|------|-------------|
| `id` | uuid PK | `defaultRandom()` |
| `user_id` | text, not null | 数据隔离（与 accounts 同，不加 FK） |
| `account_id` | uuid, not null, unique | FK→finance_accounts(id) `onDelete: cascade`；1:1，账户 `type='investment'` |
| `instrument_code` | varchar(32), not null | 品种代码（如基金代码 `110011`、股票代码 `600519`、黄金 `AU`）；关联 `finance_instruments.code`（软关联，不强 FK） |
| `instrument_type` | varchar(16), not null | 枚举 `stock`/`fund`/`bond`/`gold`/`etf`/`reits`/`crypto`（FR-001） |
| `quantity` | numeric(18,6) | 持有份额/股数（高精度，避免累计误差，R7） |
| `cost_price` | numeric(18,6) | 加权平均成本价（买入时重算；卖出不变） |
| `current_price` | numeric(18,6) | 缓存现价（来自行情/手动，仅展示与触发 revaluation，非市值真相源） |
| `price_source` | varchar(16) | 现价来源：`manual`/`market`/`estimate`（默认 `manual`，与 asset_details 一致） |
| `last_price_at` | timestamptz | 现价时间戳（行情拉取/手动输入时间，用于判断陈旧） |
| `currency` | varchar(8) | 默认 `CNY`（本阶段聚焦 CNY 标的） |
| `estimate_confidence` | varchar(16) | 枚举 `high`/`medium`/`low`（行情陈旧/手动时降级标注，默认 `medium`） |
| `is_closed` | boolean | 是否已清仓（全部卖出后 true，default false） |
| `created_at / updated_at` | timestamp | `defaultNow()` |

**约束**：`UNIQUE(account_id)`（1:1）。`instrument_type ∈ {stock,fund,bond,gold,etf,reits,crypto}`（应用层 Zod）。

**派生（真相源 + 派生关系，不入库）**：
- **当前市值** = 关联账户 `finance_accounts.balance`（真相源，由分录维护）。
- **成本** = `quantity × cost_price`。
- **盈亏** = `市值 − 成本`；**盈亏率** = `盈亏 / 成本`（FR-003）。
- 理论市值校验：`quantity × current_price` 应近似 `balance`（偏差即未同步 revaluation，可作巡检项，非硬约束）。

**关系**：`finance_accounts`(investment) 1—1 `finance_positions`；`finance_positions` 1—N `finance_investment_trades`。

---

## 2. finance_instruments（品种目录 + 行情缓存）

| 字段 | 类型 | 说明 / 约束 |
|------|------|-------------|
| `id` | uuid PK | `defaultRandom()` |
| `code` | varchar(32), not null | 品种代码（与 positions.instrument_code 对应） |
| `type` | varchar(16), not null | 枚举同 positions.instrument_type |
| `name` | varchar(128) | 品种名称（如「易方达蓝筹精选」「贵州茅台」） |
| `latest_price` | numeric(18,6) | 最新缓存现价 |
| `price_source` | varchar(16) | 来源 `manual`/`market`/`estimate` |
| `price_updated_at` | timestamptz | 行情更新时间 |
| `is_stale` | boolean | 行情是否陈旧/失效（超 TTL 或拉取失败，default false） |
| `currency` | varchar(8) | 默认 `CNY` |
| `meta` | jsonb | 扩展元数据（如市场、数据源原始字段） |
| `created_at / updated_at` | timestamp | `defaultNow()` |

**约束**：`UNIQUE(user_id, code)`（按用户隔离 + 代码唯一）；同一品种可被多用户持有，故行情缓存按用户或全局——本阶段取**按用户缓存**（`user_id` 隔离一致），未来可优化为全局缓存表。

**关系**：被 `finance_positions`（`instrument_code` 软关联）引用；行情服务 `market-data.service` 读写此表（缓存 + TTL + 降级）。

---

## 3. finance_investment_trades（投资交易语义层 — 1:N 挂持仓）

> 钱的移动在 `finance_transactions` + `finance_entries`（复式真相源）；本表承载投资**语义**（份额/单价/费用/动作），`transaction_id` 关联到复式交易。

| 字段 | 类型 | 说明 / 约束 |
|------|------|-------------|
| `id` | uuid PK | `defaultRandom()` |
| `user_id` | text, not null | 数据隔离 |
| `position_id` | uuid, not null | FK→finance_positions(id) `onDelete: cascade` |
| `action` | varchar(16), not null | 枚举 `buy`/`sell`/`dividend_cash`/`dividend_reinvest`/`split` |
| `shares` | numeric(18,6) | 交易份额/股数 |
| `price` | numeric(18,6) | 成交单价 |
| `fee` | numeric(18,2) | 手续费（买入计入成本；卖出从 proceeds 扣，R7） |
| `tax` | numeric(18,2) | 印花税等（卖出，nullable） |
| `amount` | numeric(18,2) | 复式侧金额（buy=`shares×price+fee`；sell 净到账=`shares×price−fee−tax`；冗余便于查询） |
| `transaction_id` | uuid | FK→finance_transactions(id) `onDelete: set null`（关联复式交易，钱在此） |
| `dca_plan_id` | uuid | FK→finance_dca_plans(id) `onDelete: set null`（可选，定投归属） |
| `occurred_at` | timestamptz | 交易时间（IRR 现金流时点） |
| `note` | text | 备注 |
| `created_at / updated_at` | timestamp | `defaultNow()` |

**约束**：`action ∈ {buy,sell,dividend_cash,dividend_reinvest,split}`（应用层 Zod）；`(position_id)` 上建索引（按持仓查交易历史）。

**用途**：定投累计投入 = `Σ buy.amount`；IRR 现金流 = `[{date: buy.occurred_at, amount: -buy.amount}, ..., {date: now, amount: +市值}]`（R6）；卖出已实现盈亏可由每笔 sell 的 `amount` 与账面价值核算。

---

## 4. finance_dca_plans（定投计划 — 可选，配置态）

| 字段 | 类型 | 说明 / 约束 |
|------|------|-------------|
| `id` | uuid PK | `defaultRandom()` |
| `user_id` | text, not null | 数据隔离 |
| `instrument_code` | varchar(32), not null | 定投品种代码 |
| `instrument_type` | varchar(16), not null | 枚举同上 |
| `amount` | numeric(18,2) | 每期定投金额 |
| `frequency` | varchar(16) | 周期：`monthly`/`biweekly`/`weekly`（默认 `monthly`） |
| `day_of_period` | integer | 执行日（如月内 1–28） |
| `cash_account_id` | uuid | 扣款现金账户（FK→finance_accounts，set null） |
| `active` | boolean | 是否启用（default true） |
| `created_at / updated_at` | timestamp | `defaultNow()` |

**说明**：定投计划仅为**配置/标注**（按设计 §9「不自动代扣」），不自动产生交易；用户手动录入的定投买入 `investment_trades.dca_plan_id` 指向计划，便于「该计划累计投入/市值/IRR」聚合。**IRR 数据真相源仍是 `investment_trades` 的实际买入记录，而非计划**（计划只标注归属）。

---

## 5. Phase 0/1/2 schema/服务变更（承接 003 未实现部分）

### 5.1 `__revaluation` 系统权益账户（落地创建）

```diff
  ensureSystemEquityAccounts() // Phase 0 只创建 __income/__expense
+ // Phase 3：幂等创建 __revaluation（承接 003 R4，schema 已定义 EQUITY_ACCOUNT_NAMES.revaluation）
+ // user_id='__system__', type='equity', systemKey='revaluation', includeInNetWorth=false
```

### 5.2 `ledger.service.buildEntries` 支持 revaluation / disposal

```diff
  buildEntries(input, equity) // Phase 0 仅 income/expense/transfer
+ // Phase 3：新增分支（承接 003 R4/R5）
+ //   revaluation: 2 腿（investment 账户 ↔ __revaluation）
+ //   disposal:    3 腿（现金 + investment 清零 + __income/__expense 损益）
```

### 5.3 `_lib/validation.ts` 枚举补齐

```diff
  createTransactionSchema.type: z.enum(['income','expense','transfer'])
+ // Phase 3：补 revaluation/disposal（repayment 属 003 范围，建议同批补齐）
```

> 注：`accounts.ts`/`transactions.ts`/`asset-details.ts` 的 schema **Phase 2 已落库**（investment 类型、revaluation/disposal 类型、principal/interest 列、asset_details 均已存在），本阶段不再改 schema，仅补过账逻辑与服务。

---

## 6. 复式分录规则（Phase 3 投资交易）

> 均在 `investment.service` / `ledger.service` 单事务内构造、`assertBalanced` 后落库、原子更新 `balance`、事务后 `refreshSnapshots`。金额一律「分」整数运算；份额/单价高精度列。

### buy（买入，2 腿 = transfer 语义）— research R2

设 `amount = shares × price + fee`：

| 腿 | 账户 | 方向 | 金额 |
|----|------|------|------|
| 1 | investment 账户 | debit | `amount`（持仓成本/市值增加） |
| 2 | 现金账户 | credit | `amount`（现金减少） |

校验：`Σdebit == Σcredit` ✓。结果：持仓 `balance += amount`、现金 `−amount`、**净资产不变**（资金从现金变为持仓，SC-001）；`positions.quantity += shares`、`cost_price` 重算为加权平均。

### revaluation（现价同步，2 腿）— research R4

设 `newValue = quantity × currentPrice`，`delta = newValue − balance`：

| delta | 腿1 | 腿2 |
|-------|-----|-----|
| `delta > 0`（升值） | debit investment 账户 `delta` | credit `__revaluation` `delta` |
| `delta < 0`（贬值） | debit `__revaluation` `\|delta\|` | credit investment 账户 `\|delta\|` |

校验：`Σdebit == Σcredit` ✓。持仓 `balance` 调整至 `newValue`；净资产反映新市值（FR-008）。

### sell（卖出，3 腿 = disposal 语义）— research R5

设 `proceeds = shares × price − fee − tax`、`bookValue = balance × (shares/quantity)`、`gap = proceeds − bookValue`：

| 腿 | 账户 | 方向 | 金额 |
|----|------|------|------|
| 1 | 现金账户 | debit | `proceeds`（净到账） |
| 2 | investment 账户 | credit | `bookValue`（持仓按比例出账） |
| 3 | `gap>0`: `__income` credit `gap`；`gap<0`: `__expense` debit `\|gap\|` | — | `\|gap\|`（损益平衡腿） |

校验：`Σdebit(proceeds + 损失) == Σcredit(bookValue + 收益)` ✓。持仓 `quantity -= shares`、`cost_price` 不变、`balance` 按比例减少；`gap` 如实计入已实现损益、净资产如实反映盈亏（US1-AC2）。全部卖出 `quantity=0`、`is_closed=true`。

### dividend_cash（现金分红，2 腿 = income 语义）— research R5

| 腿 | 账户 | 方向 | 金额 |
|----|------|------|------|
| 1 | 现金账户 | debit | `amount` |
| 2 | `__income` | credit | `amount` |

校验：`Σdebit == Σcredit` ✓。现金流入、计入收入；**持仓数量/成本不变**。

### dividend_reinvest / split（送股/再投）— research R5

`quantity += shares`、`cost_price` 摊薄（总成本不变）+ 一笔 `revaluation` 把 `balance` 调整至 `新quantity × currentPrice`。

---

## 关系（relations.ts 集中扩展）

- `finance_accounts`(investment) 1—1 `finance_positions`（`account_id`，仅 investment）。
- `finance_positions` 1—N `finance_investment_trades`（`position_id`）。
- `finance_positions` N—1 `finance_instruments`（`instrument_code` 软关联，不强 FK）。
- `finance_dca_plans` 1—N `finance_investment_trades`（`dca_plan_id`，可选）。
- `finance_investment_trades` N—1 `finance_transactions`（`transaction_id`）。
- `users` 为纯 text `userId`，不在此建模（与 Phase 0/1/2 一致）。

## 服务层入口（新增/变更于 services/finance）

- `ledger.service`（变更）：`buildEntries` 支持 `revaluation`/`disposal`；`ensureSystemEquityAccounts()` 创建 `__revaluation`（承接 003 R4/R5）。
- `investment.service`（新增）：
  - `registerPosition(userId, input)`：建 `investment` 账户（`balance=0`）+ 插 `positions`（品种/类型）。
  - `buy(userId, positionId, { cashAccountId, shares, price, fee, occurredAt })`：transfer 2 腿 + 持仓 `quantity`/加权 `cost_price` + 写 `investment_trades(action=buy)` + `refreshSnapshots`（R2）。
  - `sell(userId, positionId, { cashAccountId, shares, price, fee, tax, occurredAt })`：disposal 3 腿 + 持仓 `quantity−` + 已实现盈亏 + 写 `investment_trades(action=sell)` + `refreshSnapshots`（R5）。
  - `dividend(userId, positionId, { kind: cash|reinvest, amount|shares, ... })`：现金分红 income 2 腿 / 送股 reinvest + revalue（R5）。
  - `revalue(userId, positionId, { currentPrice, source, fetchedAt })`：算 `newValue=quantity×currentPrice` → revaluation 2 腿 + 更新 `positions.currentPrice/priceSource/lastPriceAt` + `refreshSnapshots`（R4，FR-008）。
  - `getPerformance(userId, positionId)`：派生 市值/成本/盈亏/盈亏率 + 定投 IRR（读 `investment_trades` + `irr.ts`）（US2/US3）。
- `market-data.service`（新增）：`getQuote(code, type)` → provider 路由 + 缓存（`finance_instruments`）+ TTL/`is_stale` + 降级返回 null（R3，FR-004）。
- `irr.ts`（新增，纯函数）：`computeXirr(cashflows)`（R6，SC-002）。
- `pnl.ts`（新增，纯函数）：盈亏/盈亏率/加权平均成本/资产配置占比（R9）。
- `rules-engine.service`（变更）：+ 集中度预警规则（单一品种占比超阈值 → `rule_finding`）（R9，FR-007）。
- `net-worth.service`（**不变**）：`investment` 已在 `ASSET_ACCOUNT_TYPES`、`breakdown[investment]`；现价 `revaluation` 后 `refreshSnapshots` 自动反映市值，无需改 net-worth 逻辑。
