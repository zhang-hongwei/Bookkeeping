# API Contracts: 预算与目标 (Phase 5)

**Feature**: 006-budget-goals · **Date**: 2026-06-29 · **Spec**: [spec.md](./spec.md) · **Data Model**: [data-model.md](../data-model.md)

> Phase 1 产出。本文定义 Phase 5 对外暴露的 HTTP 契约。**完全沿用 finance 域既有约定**：响应体为 `{ resourceName }`（具名键，非 `{data}`）；金额一律 **string**（decimal）；日期 ISO 8601 / `YYYY-MM-DD`；`userId` 永远来自会话，**不得**出现在请求体；鉴权用 `_lib/auth.ts` 的 `requireUserId()`。

---

## 0. 通用约定

### 0.1 鉴权
- 所有端点：`const authed = await requireUserId(); if (authed instanceof NextResponse) return authed; const userId = authed;`
- Phase 5 **无家庭鉴权**（个人维度，D7）；所有数据按 `userId` 隔离（I6）。

### 0.2 错误码（沿用 finance 域既有）
| code | HTTP | 说明 |
|------|------|------|
| `UNAUTHORIZED` | 401 | 未登录 |
| `BAD_BODY` | 400 | 非合法 JSON |
| `VALIDATION` | 422 | Zod 校验失败（含 `details`） |
| `INVARIANT` | 422 | 业务不变量违反（如重复建同分类同期预算、targetAmount≤0） |
| `NOT_FOUND` | 404 | 资源不存在或不属于当前用户 |
| `INTERNAL` | 500 | 服务端错误 |

错误体示例：`{ "error": "参数校验失败", "code": "VALIDATION", "details": {...} }`

### 0.3 公共 DTO 形状
```ts
type Money = string;   // decimal，如 "2000.00"

// 预算（设置 + 派生状态合一返回）
interface BudgetDTO {
  id: string;
  categoryId: string | null;       // null = 总支出预算
  name: string | null;
  amount: Money;
  periodType: 'month' | 'week' | 'year';
  alertThreshold: string;          // "0.80"
  rollover: boolean;               // 预留，本期恒 false
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // —— 派生（当前周期，D1/D2/D3）——
  period: { start: string; end: string };  // 当前 [start,end)，YYYY-MM-DD
  spent: Money;                     // 当前周期子树支出汇总
  remaining: Money;
  ratio: string;                    // spent/amount，4dp
  status: 'normal' | 'warning' | 'overrun';
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  verdict: string;                  // 中文结论，如「餐饮预算已超支 ¥100.00」
}

// 预算历史周期快照
interface BudgetPeriodDTO {
  id: string;
  budgetId: string;
  periodStart: string;
  periodEnd: string;
  amountSnapshot: Money;
  spentSnapshot: Money;
  status: 'normal' | 'warning' | 'overrun';
  closedAt: string;
}

// 预算预警（轻量，列表用）
interface BudgetAlertDTO {
  budgetId: string;
  categoryId: string | null;
  period: { start: string; end: string };
  budgetAmount: Money;
  spent: Money;
  remaining: Money;
  ratio: string;
  status: 'normal' | 'warning' | 'overrun';
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  verdict: string;
}

// 目标（设置 + 派生进度/ETA 合一）
interface GoalDTO {
  id: string;
  name: string;
  targetAmount: Money;
  targetDate: string | null;        // null = 开放式
  progressBasis: 'manual' | 'linked' | 'net_worth';
  linkedAccountIds: string[];
  manualAmount: Money;
  notes: string | null;
  status: 'active' | 'archived';
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // —— 派生（D4/D5）——
  currentAmount: Money;
  progressRate: string;             // current/target，4dp
  completed: boolean;               // progressRate≥1（派生）
  eta: {
    etaDate: string | null;         // null = 无截止日 或 unreachable
    etaStatus: 'on_track' | 'at_risk' | 'unreachable' | 'completed';
    monthsToGoal: number | null;    // null = 不可估
    avgMonthlySurplus: Money | null;
    windowMonths: number;           // N（D5）
  };
}
```

---

## 1. 预算管理

### 1.1 `POST /api/finance/budgets` — 创建预算
- Auth: `requireUserId`
- Body:
```json
{
  "categoryId": "uuid-or-null",
  "name": "日常餐饮",
  "amount": "2000.00",
  "periodType": "month",
  "alertThreshold": "0.80"
}
```
  - `categoryId` 可空（总支出预算）；`periodType` 默认 `month`；`alertThreshold` 默认 `0.80`。
- 201 Response: `{ "budget": BudgetDTO }`（含当前周期派生值）
- Errors: `VALIDATION`(422) amount>0、periodType/threshold 取值合法；`INVARIANT`(422) 同用户同分类同周期已存在预算（含重复总支出预算）。

### 1.2 `GET /api/finance/budgets` — 我的预算列表（含当前状态）
- Auth: `requireUserId`
- Query: `?active=true`（默认仅 active；`false` 含停用）、`?period=YYYY-MM-DD`（默认今天，算该日所属周期）
- 200 Response: `{ "budgets": BudgetDTO[] }`
- 语义：每个预算返回**该 period 所属周期**的 spent/remaining/status（D1 现算）。

### 1.3 `GET /api/finance/budgets/[id]` — 预算详情
- Auth: `requireUserId`（校验归属，否则 `NOT_FOUND`）
- Query: `?period=YYYY-MM-DD`（默认今天）
- 200 Response: `{ "budget": BudgetDTO }`
- Errors: `NOT_FOUND`(404)。

### 1.4 `PATCH /api/finance/budgets/[id]` — 更新预算
- Auth: `requireUserId`
- Body: `{ "name"?: string, "amount"?: Money, "periodType"?: ..., "alertThreshold"?: Money, "active"?: boolean }`
  - `categoryId` **不可改**（改分类 = 删旧建新，保持历史可追溯）。
- 200 Response: `{ "budget": BudgetDTO }`
- 语义：改 `amount` 仅影响当前+未来周期；**历史快照不变**（I3）。
- Errors: `VALIDATION`(422) amount>0；`NOT_FOUND`(404)。

### 1.5 `DELETE /api/finance/budgets/[id]` — 删除预算
- Auth: `requireUserId`
- 行为：硬删预算行（`budget_periods` FK cascade）。**或**前端改用 PATCH `active=false` 软停用（保留历史）。默认硬删；如需保留历史，先快照当前周期。
- 200 Response: `{ "ok": true }`
- Errors: `NOT_FOUND`(404)。

---

## 2. 预算历史与预警

### 2.1 `GET /api/finance/budgets/[id]/periods` — 预算历史周期
- Auth: `requireUserId`
- Query: `?from=YYYY-MM-DD&to=YYYY-MM-DD`
- 200 Response: `{ "periods": BudgetPeriodDTO[] }`
- 语义：读 `finance_budget_periods` 快照（不可变，I3）；当前周期不在此列（用 1.3 现算）。
- 注：缺失的历史周期可由后端**按需回填快照**（从 transactions 复算 + 当时的 amountSnapshot），沿用 Phase 1 `backfillHistory` 思路。

### 2.2 `GET /api/finance/budgets/alerts` — 当前周期预警汇总
- Auth: `requireUserId`
- Query: `?period=YYYY-MM-DD`（默认今天）、`?status=warning|overrun`（过滤）
- 200 Response: `{ "alerts": BudgetAlertDTO[] }`
- 语义：所有 active 预算的当前周期 `BudgetAlert`（D3 纯函数现算）。前端据此做「即将超支/已超支」提示（FR-002）。

---

## 3. 目标管理

### 3.1 `POST /api/finance/goals` — 创建目标
- Auth: `requireUserId`
- Body:
```json
{
  "name": "旅游基金",
  "targetAmount": "30000.00",
  "targetDate": "2026-12-31",        // 可空（开放式）
  "progressBasis": "linked",
  "linkedAccountIds": ["acc-uuid-1", "acc-uuid-2"],
  "notes": "年度旅行"
}
```
  - `progressBasis` 默认 `manual`；`linked` 须提供 `linkedAccountIds`（非空，且账号属当前用户）；`net_worth` 忽略 linkedAccountIds。
- 201 Response: `{ "goal": GoalDTO }`（含派生 currentAmount/progressRate/eta）
- Errors: `VALIDATION`(422) targetAmount>0、basis 合法、linked 时账号非空；`INVARIANT`(422) linked 账号不属于当前用户。

### 3.2 `GET /api/finance/goals` — 我的目标列表
- Auth: `requireUserId`
- Query: `?status=active|archived`（默认 active）
- 200 Response: `{ "goals": GoalDTO[] }`（含 ETA）

### 3.3 `GET /api/finance/goals/[id]` — 目标详情
- Auth: `requireUserId`
- 200 Response: `{ "goal": GoalDTO }`
- Errors: `NOT_FOUND`(404)。

### 3.4 `PATCH /api/finance/goals/[id]` — 更新目标
- Auth: `requireUserId`
- Body: `{ "name"?, "targetAmount"?, "targetDate"?, "progressBasis"?, "linkedAccountIds"?, "manualAmount"?, "notes"?, "status"? }`
- 200 Response: `{ "goal": GoalDTO }`
- 语义：改 `manualAmount`（manual 基准时用户更新进度）、改 basis/linked 重算 currentAmount（FR-007）。首次达到 100% 记 `completedAt`。
- Errors: `VALIDATION`(422)；`INVARIANT`(422) linked 账号不属于当前用户。

### 3.5 `DELETE /api/finance/goals/[id]` — 删除目标
- Auth: `requireUserId`
- 200 Response: `{ "ok": true }`
- Errors: `NOT_FOUND`(404)。

### 3.6 `GET /api/finance/goals/[id]/progress` — 目标进度与 ETA 明细
- Auth: `requireUserId`
- Query: `?windowMonths=3`（ETA 结余窗口 N，默认 3，D5）
- 200 Response:
```json
{
  "goal": { /* GoalDTO */ },
  "progress": {
    "currentAmount": "10000.00",
    "targetAmount": "30000.00",
    "remaining": "20000.00",
    "progressRate": "0.3333",
    "completed": false,
    "surplusSeries": [
      { "month": "2026-04", "income": "15000.00", "expense": "10000.00", "surplus": "5000.00" }
    ],
    "eta": {
      "etaDate": "2026-10-31",
      "etaStatus": "on_track",
      "monthsToGoal": 4,
      "avgMonthlySurplus": "5000.00",
      "windowMonths": 3
    }
  }
}
```
- 语义：`computeGoalProgress`（D5）+ `getMonthlySurplusSeries`（D6）。avgMonthlySurplus≤0 → `etaStatus='unreachable'`、`etaDate=null`、`monthsToGoal=null`（I5）。无 targetDate → `etaDate=null` 但仍返回进度。
- 注：返回 `surplusSeries` 让「预计达成时间」**可解释、可追溯**（SC-003/US3）。

---

## 4. 既有端点扩展（写后回带 alerts，D9）

### 4.1 `POST /api/finance/transactions` / `PATCH /api/finance/transactions/[id]`
- 请求体**不变**（不增字段）。
- **响应**可选新增字段（best-effort，非阻塞）：
```json
{ "transaction": { /* 既有 */ }, "budgetAlerts": [ /* BudgetAlertDTO[]，仅受影响分类 */ ] }
```
- 语义：交易写后，`ledger.service` best-effort 计算该交易 `categoryId`（及其祖先链）命中的预算当前 `BudgetAlert`，附在响应里（D9）。计算失败/无预算时省略该字段（不报错、不回滚交易）。

---

## 5. 契约不变量（前端/测试共同遵守）

- **C1**：请求体永不含 `userId`（来自会话）。
- **C2**：所有 `BudgetDTO` 的 `spent/remaining/ratio/status` 与 `GoalDTO` 的 `currentAmount/progressRate/eta` **均由规则层纯函数**对账目数据计算（I4），可逐项追溯；LLM 仅消费不编造（SC-004）。
- **C3**：`etaStatus='unreachable'` 时 `etaDate=null`、`monthsToGoal=null`；**绝不**返回虚假乐观日期（I5/SC-003）。
- **C4**：目标 `completed` 为**派生**（progressRate≥1），不依赖 `status` 字段。
- **C5**：金额 string、日期 ISO（与 Phase 0–4 一致）。
- **C6**：预算 `PATCH` 不可改 `categoryId`；改 `amount` 不回溯历史快照（I3）。
- **C7**：跨用户访问他人预算/目标 → `NOT_FOUND`（不泄漏存在性，I6）。
