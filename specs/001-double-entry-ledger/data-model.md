# Data Model — 复式记账核心地基 (Phase 0)

> Phase 1 输出：Drizzle/PostgreSQL schema 设计。字段、关系、校验、状态机。金额一律 `numeric(18,2)`，禁止浮点。命名复数 snake_case，`user_id` 隔离，`timestamptz`。
> 新表位于 `src/database/schemas/finance/`，barrel 经 `index.ts` 接入 `src/database/schema/index.ts`。

## 实体总览

```
accounts ──< entries >── transactions ──< bill_import_rows >── bill_imports
categories (accounts/categories 独立；transactions 引用 category)
系统权益账户（type=equity, user_id=NULL）：__income / __expense
```

不变式（核心）：对任意 `transaction_id`，`Σ(entries.debit) == Σ(entries.credit)`，且每条 `amount > 0`。

---

## 1. accounts（资金账户）

| 字段 | 类型 | 说明 / 约束 |
|------|------|-------------|
| `id` | text PK | 前缀 `acc_` |
| `user_id` | text, not null | FK→users, cascade |
| `name` | text, not null | 如 "微信零钱" |
| `type` | enum | `cash` / `savings` / `credit` / `investment` / `real_asset` |
| `currency` | text | 默认 `CNY` |
| `opening_balance` | numeric(18,2) | 初始余额（建账时一次性记入） |
| `balance` | numeric(18,2) | **物化**当前余额，事务内原子维护 |
| `credit_limit` | numeric(18,2) | 仅 credit，可空 |
| `include_in_net_worth` | boolean | 默认 true（实物资产可关，Phase 0 暂不用） |
| `is_archived` | boolean | 默认 false |
| `created_at / updated_at` | timestamptz | |

**校验**：`type` ∈ enum；`opening_balance` 可负（信用账户）。**余额方向**：资产类 `balance = Σ(debit) − Σ(credit)`；负债类(credit) `balance = Σ(credit) − Σ(debit)`（显示为欠款）。

**状态机**：`active` ⇄ `archived`（归档保留历史、不进新交易默认选项）。

---

## 2. categories（分类）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | text PK | 前缀 `cat_` |
| `user_id` | text, not null | FK→users, cascade |
| `name` | text | 如 "餐饮" |
| `kind` | enum | `income` / `expense` / `transfer` |
| `parent_id` | text | 自引用，可空（层级） |
| `keywords` | jsonb `string[]` | 自动归类关键字（导入/自然语言命中即归类） |
| `created_at / updated_at` | timestamptz | |

**校验**：`kind` ∈ enum；`parent_id` 需同 user、同 kind（防跨类挂载）。**默认分类**：seed 一套中文收支分类（餐饮/购物/住房/交通/医疗/教育/娱乐/旅游…；工资/奖金/利息…）。

---

## 3. transactions + entries（复式记账核心）

### transactions（业务事件）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | text PK | 前缀 `txn_` |
| `user_id` | text, not null | FK→users, cascade |
| `type` | enum | `income` / `expense` / `transfer` |
| `category_id` | text | FK→categories，可空（转账常为空） |
| `amount` | numeric(18,2) | 交易金额（>0；冗余自 entries，便于查询） |
| `occurred_at` | timestamptz | 发生时间（可过去/未来） |
| `note` | text | 备注 |
| `source` | enum | `manual` / `import` / `nl` |
| `confidence` | numeric(3,2) | 0.00–1.00（手动=1.0，导入/自然语言按解析置信度） |
| `bill_import_id` | text | FK→bill_imports，可空（来源批次） |
| `created_at / updated_at` | timestamptz | |

### entries（复式分录腿 — 平衡锚点）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | text PK | 前缀 `ent_` |
| `transaction_id` | text, not null | FK→transactions, cascade |
| `account_id` | text, not null | FK→accounts（含系统权益账户） |
| `side` | enum | `debit` / `credit` |
| `amount` | numeric(18,2) | **>0**（校验） |
| `created_at` | timestamptz | |

**校验（不变式）**：
- 每条 `amount > 0`。
- 同 `transaction_id` 下 `Σ(side=debit).amount == Σ(side=credit).amount` —— **应用层事务强制**，可选 PG deferred trigger 纵深防御。
- 每笔交易至少 2 条 entries。
- `account_id` 含系统权益账户：income → 借资产 + 贷 `__income`；expense → 借 `__expense` + 贷资产；transfer → 借目标 + 贷来源。

**派生规则**：账户余额变更在写 entries 的同一事务内 `UPDATE accounts SET balance = balance ± amount`（按方向，见 §1）。`amount > 0` 与平衡校验失败 → 整体回滚。

---

## 4. bill_imports + bill_import_rows（账单导入）

### bill_imports（导入批次）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | text PK | 前缀 `imp_` |
| `user_id` | text, not null | FK→users |
| `source` | enum | `alipay` / `wechat` / `bank` / `generic_csv` |
| `file_name` | text | 原始文件名 |
| `status` | enum | `parsing` / `preview` / `confirmed` / `failed` |
| `total` / `imported` / `skipped` | integer | 解析/已入/跳过计数 |
| `created_at / updated_at` | timestamptz | |

**状态机**：`parsing` → `preview`（待确认）→ `confirmed`（落库完成）；或 `parsing` → `failed`。

### bill_import_rows（候选行 + 去重）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | text PK | |
| `bill_import_id` | text, not null | FK→bill_imports, cascade |
| `user_id` | text, not null | |
| `row_hash` | text, not null | 归一化哈希 `hash(occurred_at+amount+counterparty+memo)` |
| `parsed` | jsonb | 解析出的候选交易（amount/type/category/account/note/occurred_at） |
| `status` | enum | `pending` / `imported` / `duplicate` / `error` |
| `created_at` | timestamptz | |

**去重**：落库前对 `row_hash` 与该用户已存在 `status=imported` 的 rows 比对；命中 → `duplicate`（跳过，计入 SC-006）。

---

## 关系（relations.ts 集中定义）

- `accounts` 1—N `entries`；`transactions` 1—N `entries`；`entries` N—1 `accounts`/`transactions`。
- `transactions` N—1 `categories`；`transactions` N—1 `bill_imports`。
- `categories` 自引用 `parent_id`。
- `bill_imports` 1—N `bill_import_rows`。

## 不变式校验入口（balance.service）

- `assertBalanced(transactionId)`：抛出若 `Σdebit≠Σcredit`。
- `recomputeBalance(accountId)`：由 entries 重算并比对物化 `balance`，不一致则修复+告警（SC-007 自愈）。
- `verifyAll(userId)`：批量校验，供定时/手动巡检。
