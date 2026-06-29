# API Contracts — 资产/负债完整化 (Phase 2)

> Phase 2 输出：Next.js App Router Route Handlers（`src/app/api/finance/*`），在 Phase 0/1 路由之上扩展。全部需**Supabase Auth** 会话认证；`userId` 取自会话 cookie（`requireUserId`），请求体不携带 `userId`。金额为字符串（避免 JS number 精度问题），如 `"3000000.00"`。

## 通用约定（沿用 Phase 0/1）

- 认证：Supabase 会话（`@supabase/ssr` cookie）；未认证 → `401 { error, code: "UNAUTHORIZED" }`。
- 隔离：所有资源按 `userId` 过滤；越权访问他人资源 → `404`（不泄露存在性）。
- 金额：请求/响应一律 **字符串**；内部走「分」整数运算。
- 校验：Zod（`_lib/validation.ts`）；失败 → `422 { error, code: "VALIDATION", details }`。
- 错误：统一 `{ error: string, code: string, details?: object }`。复式不变式违反 → `400 { error, code: "LEDGER_INVARIANT" }`；账户存在关联交易而硬删 → `409 { error, code: "CONFLICT" }`。

---

## 1. 资产 Assets（登记 / 更新 / 估值 / 处置）

### `GET /api/finance/assets`
- 查询：`?type=real_asset|investment`（可选）
- 行为：返回资产账户 + 关联明细 + 当前价值(=`balance`) + 估值置信度。
- 200：
  ```json
  { "items": [
    { "id": "acc-uuid", "name": "朝阳房产", "type": "real_asset", "balance": "3000000.00",
      "includeInNetWorth": true, "isArchived": false,
      "detail": { "costBasis": "2800000.00", "valuationSource": "manual",
                  "estimateConfidence": "medium", "valuationDate": "2026-06-01",
                  "valuationHistory": [{"date":"2026-06-01","value":"3000000.00","confidence":"medium","source":"manual"}],
                  "isDisposed": false } }
  ] }
  ```

### `POST /api/finance/assets`
- 体：
  ```json
  { "name": "朝阳房产", "type": "real_asset", "openingBalance": "3000000.00",
    "costBasis": "2800000.00", "valuationSource": "manual", "estimateConfidence": "medium",
    "valuationDate": "2026-06-01", "currency": "CNY", "includeInNetWorth": true }
  ```
- 行为：建 `real_asset`/`investment` 账户（`balance=openingBalance`）+ 插 `asset_details`。
- 201：`{ asset: AssetDTO }`（含 `detail`）。

### `PATCH /api/finance/assets/:id`
- 体：部分字段（`name`/`includeInNetWorth`/`costBasis`/`estimateConfidence`/`valuationSource`/`valuationDate`，**不改 `balance`**）。
- 200：`{ asset: AssetDTO }`。

### `POST /api/finance/assets/:id/revalue`（FR-008 估值更新）
- 体：`{ "newValue": "3100000.00", "confidence": "high", "source": "market", "occurredAt": "2026-06-29" }`
- 行为：`revaluation` 交易（2 腿，资产 ↔ `__revaluation`）→ 资产 `balance=newValue` + 更新明细 + 追加 `valuationHistory` + `refreshSnapshots`。
- 200：`{ asset: AssetDTO }`。

### `POST /api/finance/assets/:id/dispose`（Edge Case 资产处置）
- 体：`{ "cashAccountId": "acc-cash", "proceeds": "3050000.00", "occurredAt": "2026-06-29", "note": "出售房产" }`
- 行为：`disposal` 交易（3 腿，现金 + 资产清零 + 损益入 `__income`/`__expense`）→ 资产 `balance=0`、`isDisposed=true`、`refreshSnapshots`。
- 200：`{ asset: AssetDTO }`。

---

## 2. 负债 Liabilities（登记 / 更新 / 还款 / 账单）

### `GET /api/finance/liabilities`
- 查询：`?kind=mortgage|car_loan|credit|consumer_loan|borrowing`（可选）
- 行为：返回负债账户 + 明细 + 剩余本金(=`balance`) + 已还(`paidAmount`)。
- 200：
  ```json
  { "items": [
    { "id": "acc-uuid", "name": "房贷", "type": "mortgage", "balance": "1497000.00",
      "includeInNetWorth": true,
      "detail": { "kind": "mortgage", "principal": "2000000.00", "interestRate": "0.04250",
                  "monthlyPayment": "9500.00", "dueDate": "2046-06-01", "paidAmount": "503000.00",
                  "statementDay": null, "repaymentDay": null } }
  ] }
  ```

### `POST /api/finance/liabilities`
- 体（贷款）：
  ```json
  { "name": "房贷", "type": "mortgage", "openingBalance": "2000000.00",
    "principal": "2000000.00", "interestRate": "0.04250", "monthlyPayment": "9500.00",
    "dueDate": "2046-06-01", "includeInNetWorth": true }
  ```
- 体（信用卡，账单周期）：
  ```json
  { "name": "招行信用卡", "type": "credit", "openingBalance": "12000.00",
    "kind": "credit", "statementDay": 5, "repaymentDay": 25, "includeInNetWorth": true }
  ```
- 行为：建负债账户（`balance=openingBalance`=初始欠款/本金）+ 插 `liability_details`（`paidAmount` 默认 0）。`interestRate`/`monthlyPayment`/`dueDate` 对无固定还款的借款可为 null。
- 201：`{ liability: LiabilityDTO }`（含 `detail`）。

### `PATCH /api/finance/liabilities/:id`
- 体：部分字段（`name`/`interestRate`/`monthlyPayment`/`dueDate`/`statementDay`/`repaymentDay`/`includeInNetWorth`，**不改 `balance`/`paidAmount`**——余额/已还只能由交易驱动）。
- 200：`{ liability: LiabilityDTO }`。

### `POST /api/finance/liabilities/:id/repay`（FR-004 还款，本金/利息拆分）
- 体：
  ```json
  { "cashAccountId": "acc-cash", "principal": "3000.00", "interest": "2000.00",
    "occurredAt": "2026-06-29", "note": "6 月房贷" }
  ```
- 行为：`repayment` 交易（3 腿：debit 负债 principal、debit `__expense` interest、credit 现金 principal+interest）→ 负债 `balance − principal`、现金 `−(principal+interest)`、`liability_details.paidAmount += principal` + `refreshSnapshots`。
- 200：
  ```json
  { "transaction": { "id": "txn-uuid", "type": "repayment", "amount": "5000.00",
      "principalAmount": "3000.00", "interestAmount": "2000.00", "occurredAt": "2026-06-29", ... },
    "remainingPrincipal": "1497000.00", "paidAmount": "503000.00" }
  ```

### `GET /api/finance/liabilities/:id/billing`（FR-006 信用卡账单周期）
- 行为：仅 `credit`；由 `entries` 聚合当前账单周期 `[上 statementDay, 当前 statementDay)`。
- 200：
  ```json
  { "periodStart": "2026-05-05", "periodEnd": "2026-06-05",
    "statementAmount": "12000.00", "paidAmount": "0.00", "remaining": "12000.00",
    "statementDay": 5, "repaymentDay": 25, "dueSoon": true, "daysUntilDue": 2 }
  ```
- 注：非 `credit` 账户 → `400 { error, code: "NOT_CREDIT" }`。

---

## 3. 净资产（扩展流动性视图，FR-003）

### `GET /api/finance/net-worth?view=high|all`
- `view=all`（默认）：含全部资产（反映「全部家底」，US1）。
- `view=high`：仅高流动性（`cash`/`savings`/`investment`），过滤 `real_asset` 等低流动性估值（D2）。
- 200：`{ date, totalAssets, totalLiabilities, netWorth, todayChange, breakdown, view }`。
  - `view=high` 时 `netWorth = (breakdown.cash+savings+investment) − totalLiabilities`，`totalAssets` 仅含高流动性。

### `GET /api/finance/net-worth/snapshots?from=&to=&view=high|all`
- 行为：曲线按 `view` 派生每日高流动性/全部净资产（由 `breakdown` 即时算，快照表不加列）。
- 200：`{ items: NetWorthSnapshot[] }`，每项 `{ date, totalAssets, totalLiabilities, netWorth, breakdown, view }`。

---

## 数据形状（TS，概要）

```ts
type EstimateConfidence = "high" | "medium" | "low";
type LiabilityKind = "credit" | "mortgage" | "car_loan" | "consumer_loan" | "borrowing";

type AssetDetailDTO = {
  costBasis: string; valuationSource: string; estimateConfidence: EstimateConfidence;
  valuationDate: string | null; valuationHistory: { date: string; value: string; confidence: EstimateConfidence; source: string }[];
  isDisposed: boolean;
};
type AssetDTO = { id: string; name: string; type: "real_asset" | "investment"; balance: string;
  includeInNetWorth: boolean; isArchived: boolean; detail: AssetDetailDTO };

type LiabilityDetailDTO = { kind: LiabilityKind; principal: string; interestRate: string | null;
  monthlyPayment: string | null; dueDate: string | null; paidAmount: string;
  statementDay: number | null; repaymentDay: number | null };
type LiabilityDTO = { id: string; name: string; type: "credit" | "mortgage" | "car_loan" | "consumer_loan" | "borrowing";
  balance: string; includeInNetWorth: boolean; detail: LiabilityDetailDTO };

type RepaymentResult = { transaction: { id: string; type: "repayment"; amount: string;
  principalAmount: string; interestAmount: string; occurredAt: string };
  remainingPrincipal: string; paidAmount: string };

type CreditBillingDTO = { periodStart: string; periodEnd: string; statementAmount: string;
  paidAmount: string; remaining: string; statementDay: number; repaymentDay: number;
  dueSoon: boolean; daysUntilDue: number };

type NetWorthView = "high" | "all";
type NetWorthSnapshot = { date: string; totalAssets: string; totalLiabilities: string;
  netWorth: string; breakdown: Record<string, string>; view: NetWorthView };
```

---

## 复式分录契约（不变式，与 data-model.md §4 一致）

- **repayment**：`debit 负债 principal + debit __expense interest == credit 现金 (principal+interest)`。
- **revaluation**：`debit/credit 资产 |delta| == credit/debit __revaluation |delta|`。
- **disposal**：`debit 现金 proceeds + (debit __expense |loss|) == credit 资产 balance + (credit __income gain)`。
- 所有交易落库前 `assertBalanced` 强制 `Σdebit==Σcredit`、每腿 `amount>0`，违反 → 整事务回滚 + `400 LEDGER_INVARIANT`。
