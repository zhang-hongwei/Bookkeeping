# API Contracts — 复式记账核心地基 (Phase 0)

> Phase 1 输出：Next.js App Router 的 Route Handlers（`src/app/api/finance/*`）。全部需 Clerk 认证；`userId` 取自会话，请求体不携带 `userId`。金额为字符串（避免 JS number 精度问题），如 `"120.50"`。

## 通用约定

- 认证：Clerk session；未认证 → `401`。
- 隔离：所有资源按 `userId` 过滤；越权访问他人资源 → `404`（不泄露存在性）。
- 金额：请求/响应一律 **字符串** 形式 `"120.50"`。
- 错误：统一 `{ error: string, code: string, details?: object }`。

---

## 1. 账户 Accounts

### `GET /api/finance/accounts`
- 查询：`?type=&include_archived=`
- 200：`Account[]`（含 `balance`）

### `POST /api/finance/accounts`
- 体：`{ name, type, openingBalance, currency?, creditLimit? }`
- 校验：`type` ∈ enum；`openingBalance` 为合法金额字符串。
- 201：`Account`；建账即写入初始余额分录。

### `PATCH /api/finance/accounts/:id`
- 体：`{ name?, isArchived?, includeInNetWorth? }`（不改 `balance`，余额只能由交易驱动）
- 200：`Account`

### `DELETE /api/finance/accounts/:id`
- 仅在无关联交易时允许硬删；否则返回 `409` 并建议归档。

---

## 2. 分类 Categories

### `GET /api/finance/categories`
- 查询：`?kind=income|expense|transfer`
- 200：`Category[]`（树形/扁平）

### `POST /api/finance/categories`
- 体：`{ name, kind, parentId?, keywords? }`
- 201：`Category`

### `PATCH /api/finance/categories/:id`
- 体：`{ name?, keywords?, parentId? }`

---

## 3. 交易 Transactions（复式核心）

### `GET /api/finance/transactions`
- 查询：`?accountId=&categoryId=&type=&from=&to=&source=&page=&pageSize=`
- 200：`{ items: TransactionWithEntries[], total, page }`

### `POST /api/finance/transactions`
- 体（高层语义，由服务层展开为平衡 entries）：
  ```json
  {
    "type": "expense",
    "amount": "35.00",
    "fromAccountId": "acc_xxx",
    "toAccountId": null,
    "categoryId": "cat_food",
    "occurredAt": "2026-06-29T12:30:00+08:00",
    "note": "午饭",
    "source": "manual"
  }
  ```
  - `expense`/`income`：只需 `fromAccountId`（或 toAccountId）；服务层自动生成对腿到 `__expense`/`__income`。
  - `transfer`：需 `fromAccountId` + `toAccountId`。
- 校验：`amount > 0`；账户存在且属本人；落库后 `Σdebit==Σcredit`，否则 `422`。
- 201：`Transaction`（含 entries 与受影响账户的新 balance）。

### `PATCH /api/finance/transactions/:id`
- 体：同 POST 部分字段；服务层在**一个事务**内反转旧 entries、写入新 entries、重算受影响账户余额（SC-007）。

### `DELETE /api/finance/transactions/:id`
- 事务内删除 entries 并回滚余额；保持其余账目平衡。

---

## 4. 账单导入 Import

### `POST /api/finance/import`（multipart 或 JSON）
- 体：`{ source: "alipay"|"wechat"|"bank"|"generic_csv", file | rawText }`
- 行为：解析为候选 rows，去重标记，进入 `preview`。
- 201：`{ billImportId, total, preview: BillImportRow[] }`（含每行 `status`：`pending`/`duplicate`）

### `GET /api/finance/import/:id`
- 200：批次详情 + rows（预览/调整用）

### `POST /api/finance/import/:id/confirm`
- 体：`{ rowIds?: string[] }`（缺省=全部 pending；可排除个别行）
- 行为：将选中 rows 落库为 transactions+entries，更新账户余额，标记 rows `imported`。
- 200：`{ imported, skipped, failed }`

---

## 5. 自然语言记账 Natural Language

### `POST /api/finance/nl-record`
- 体：`{ text: "午饭 35" }`
- 行为：AI SDK structured output 解析为候选交易（含 `confidence`）。
- 200：`{ candidate: { type, amount, categoryId?, accountId?, occurredAt?, note? }, confidence }`
- 说明：**不直接落库**；前端展示候选 → 用户确认 → 走 `POST /transactions`。解析失败 → `200` 带 `{ candidate: null, reason }`，前端进入手动补全。

---

## 数据形状（TS，概要）

```ts
type Account = { id, name, type, currency, openingBalance, balance, creditLimit, isArchived };
type Category = { id, name, kind, parentId, keywords };
type Transaction = { id, type, amount, categoryId, occurredAt, note, source, confidence, entries: Entry[] };
type Entry = { id, accountId, side: "debit"|"credit", amount };
type BillImportRow = { id, status: "pending"|"imported"|"duplicate"|"error", parsed: ParsedTx };
```
