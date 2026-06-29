# API Contracts — 投资管理 (Phase 3)

> Phase 3 输出：Next.js App Router Route Handlers（`src/app/api/finance/*`），在 Phase 0/1/2 路由之上扩展。全部需**Supabase Auth** 会话认证；`userId` 取自会话 cookie（`requireUserId`），请求体不携带 `userId`。金额为字符串（避免 JS number 精度问题），如 `"1000.00"`；份额/单价为字符串高精度（如 `"1.234567"`）。

## 通用约定（沿用 Phase 0/1/2）

- 认证：Supabase 会话（`@supabase/ssr` cookie）；未认证 → `401 { error, code: "UNAUTHORIZED" }`。
- 隔离：所有资源按 `userId` 过滤；越权访问他人资源 → `404`（不泄露存在性）。
- 金额：请求/响应一律 **字符串**；内部走「分」整数运算。份额/单价/现价用字符串高精度。
- 校验：Zod（`_lib/validation.ts`）；失败 → `422 { error, code: "VALIDATION", details }`。
- 错误：统一 `{ error: string, code: string, details?: object }`。复式不变式违反 → `400 { error, code: "LEDGER_INVARIANT" }`；行情不可用 → `503 { error, code: "MARKET_UNAVAILABLE" }`（并提示手动输入，FR-004）。

---

## 1. 持仓 Positions（登记 / 更新 / 买入 / 卖出 / 分红 / 估值 / 表现）

### `GET /api/finance/positions`
- 查询：`?instrumentType=stock|fund|bond|gold|etf|reits|crypto`（可选）、`?includeClosed=false`（默认不含已清仓）
- 行为：返回持仓账户 + positions + 当前市值(=`balance`) + 派生盈亏/盈亏率 + 现价来源/时间。
- 200：
  ```json
  { "items": [
    { "id": "acc-uuid", "name": "易方达蓝筹精选", "type": "investment", "balance": "1200.00",
      "includeInNetWorth": true, "isArchived": false,
      "position": { "instrumentCode": "005827", "instrumentType": "fund",
        "quantity": "1000.000000", "costPrice": "1.000000", "currentPrice": "1.200000",
        "priceSource": "market", "lastPriceAt": "2026-06-29T15:00:00Z",
        "currency": "CNY", "estimateConfidence": "high", "isClosed": false,
        "cost": "1000.00", "marketValue": "1200.00", "pnl": "200.00", "pnlRate": "0.2000" } }
  ] }
  ```

### `POST /api/finance/positions`
- 体：
  ```json
  { "name": "易方达蓝筹精选", "instrumentCode": "005827", "instrumentType": "fund",
    "currency": "CNY", "includeInNetWorth": true }
  ```
- 行为：建 `investment` 账户（`balance=0`）+ 插 `positions`（数量 0、成本价 0）。初始市值 0，待首次买入后才有持仓。
- 201：`{ position: PositionDTO }`（含派生字段，此时市值/盈亏为 0）。

### `PATCH /api/finance/positions/:id`
- 体：部分字段（`name`/`estimateConfidence`/`includeInNetWorth`，**不改 `balance`/`quantity`/`costPrice`**——余额/数量只能由交易驱动）。
- 200：`{ position: PositionDTO }`。

### `POST /api/finance/positions/:id/buy`（US1-AC1 买入）
- 体：
  ```json
  { "cashAccountId": "acc-cash", "shares": "1000.000000", "price": "1.000000",
    "fee": "0.00", "occurredAt": "2026-06-29", "note": "首次买入", "dcaPlanId": null }
  ```
- 行为：`transfer` 2 腿（debit investment `amount=shares×price+fee`、credit 现金 `amount`）→ 持仓 `balance += amount`、`quantity += shares`、`costPrice` 重算加权平均、现金 `−amount` + 写 `investment_trades(action=buy)` + `refreshSnapshots`。**净资产不变**（SC-001）。
- 200：
  ```json
  { "transaction": { "id": "txn-uuid", "type": "transfer", "amount": "1000.00", "occurredAt": "2026-06-29" },
    "position": { "quantity": "1000.000000", "costPrice": "1.000000", "balance": "1000.00",
                  "marketValue": "1000.00", "pnl": "0.00", "pnlRate": "0.0000" } }
  ```

### `POST /api/finance/positions/:id/sell`（US1-AC2 卖出）
- 体：
  ```json
  { "cashAccountId": "acc-cash", "shares": "500.000000", "price": "2.400000",
    "fee": "5.00", "tax": "2.40", "occurredAt": "2026-06-29", "note": "部分止盈" }
  ```
- 行为：`disposal` 3 腿（debit 现金 `proceeds=shares×price−fee−tax`、credit investment `bookValue=balance×(shares/quantity)`、损益腿 `__income`/`__expense`）→ 持仓 `quantity −=`、`costPrice` 不变、`balance` 按比例减 + 写 `investment_trades(action=sell)` + `refreshSnapshots`。已实现盈亏如实计入、净资产如实反映。
- 200：
  ```json
  { "transaction": { "id": "txn-uuid", "type": "disposal", "amount": "1192.60", "occurredAt": "2026-06-29" },
    "realizedPnl": "692.60", "position": { "quantity": "500.000000", "costPrice": "1.000000",
                  "balance": "600.00", "isClosed": false } }
  ```

### `POST /api/finance/positions/:id/dividend`（分红/派息/送股）
- 体（现金分红）：
  ```json
  { "kind": "cash", "cashAccountId": "acc-cash", "amount": "50.00", "occurredAt": "2026-06-29" }
  ```
- 体（送股/再投）：
  ```json
  { "kind": "reinvest", "shares": "50.000000", "price": "1.200000", "occurredAt": "2026-06-29" }
  ```
- 行为：`cash` → `income` 2 腿（现金 +、`__income` +，持仓不变）；`reinvest` → `quantity += shares` + `costPrice` 摊薄 + `revaluation` 市值重估（R5）。均写 `investment_trades`。
- 200：`{ transaction, position }`。

### `POST /api/finance/positions/:id/revalue`（FR-008 现价/估值同步）
- 体：
  ```json
  { "currentPrice": "1.200000", "source": "market", "fetchedAt": "2026-06-29T15:00:00Z" }
  ```
- 行为：`newValue = quantity × currentPrice` → `revaluation` 2 腿（investment ↔ `__revaluation`，`delta=newValue−balance`）→ 持仓 `balance=newValue` + 更新 `positions.currentPrice/priceSource/lastPriceAt` + `refreshSnapshots`。
- 200：`{ transaction: { type: "revaluation" }, position: { balance, marketValue, pnl, pnlRate } }`。

### `GET /api/finance/positions/:id/performance`（US2/US3 市值/收益/IRR）
- 查询：`?asOf=2026-06-29`（默认今日）
- 行为：派生市值/成本/盈亏/盈亏率；若有多次买入（定投），按 `investment_trades` 现金流 + 期末市值算 **XIRR**。
- 200：
  ```json
  { "marketValue": "1200.00", "cost": "1000.00", "pnl": "200.00", "pnlRate": "0.2000",
    "totalInvested": "1000.00",
    "irr": { "annualizedRate": "0.4200", "converged": true, "asOf": "2026-06-29" } }
  ```
- 注：IRR 无解/不收敛 → `"irr": { "annualizedRate": null, "converged": false, "reason": "IRR 无法收敛" }`（Edge Case，不返回错误数值）。

---

## 2. 品种与行情 Instruments（目录 / 手动录价 / 拉取现价）

### `GET /api/finance/instruments`
- 查询：`?type=fund`（可选）
- 200：`{ items: InstrumentDTO[] }`（含 `latestPrice`/`priceSource`/`priceUpdatedAt`/`isStale`）。

### `POST /api/finance/instruments`（FR-004 手动录价降级）
- 体：`{ "code": "005827", "type": "fund", "name": "易方达蓝筹精选", "latestPrice": "1.180000", "source": "manual" }`
- 行为：upsert `finance_instruments`（`price_source='manual'`、`price_updated_at=now`、`is_stale=false`）；用于行情不可用时的手动现价。
- 201/200：`{ instrument: InstrumentDTO }`。

### `GET /api/finance/instruments/:code/quote`（D3 拉取/刷新行情）
- 行为：`market-data.service.getQuote(code, type)` → provider 拉取 + 缓存 + TTL/`is_stale`。
- 200：`{ code, type, latestPrice, priceSource: "market", priceUpdatedAt, isStale: false }`。
- 503：`{ error: "行情暂不可用", code: "MARKET_UNAVAILABLE", details: { suggestion: "manual" } }`（拉取失败 → 提示手动输入，FR-004）。
- 注：该路由 `export const runtime = 'nodejs'`（需外网 fetch + 文本解析，不走 Edge）。

---

## 3. 资产配置 Allocation（FR-007 配置占比 + 集中度预警）

### `GET /api/finance/allocation`
- 查询：`?view=by_type`（默认按 instrumentType；可扩展按资产大类）
- 行为：纯函数按 `instrumentType` 汇总各持仓市值占比；读 `rule_findings`（集中度预警，由 `rules-engine` 产出）。
- 200：
  ```json
  { "items": [ { "instrumentType": "fund", "marketValue": "1200.00", "ratio": "0.6000" },
               { "instrumentType": "gold", "marketValue": "800.00", "ratio": "0.4000" } ],
    "total": "2000.00",
    "alerts": [ { "code": "CONCENTRATION", "severity": "warn",
                  "message": "单一品种「易方达蓝筹精选」占比 60%，已达集中度阈值", "threshold": "0.6000" } ] }
  ```
- 注：预警仅提示，不代为交易（设计 §9 合规免责）。

---

## 数据形状（TS，概要）

```ts
type InstrumentType = "stock" | "fund" | "bond" | "gold" | "etf" | "reits" | "crypto";
type PriceSource = "manual" | "market" | "estimate";
type EstimateConfidence = "high" | "medium" | "low";
type TradeAction = "buy" | "sell" | "dividend_cash" | "dividend_reinvest" | "split";

type PositionDTO = {
  id: string; name: string; type: "investment"; balance: string;
  includeInNetWorth: boolean; isArchived: boolean;
  position: {
    instrumentCode: string; instrumentType: InstrumentType;
    quantity: string; costPrice: string; currentPrice: string;
    priceSource: PriceSource; lastPriceAt: string | null; currency: string;
    estimateConfidence: EstimateConfidence; isClosed: boolean;
    // 派生
    cost: string; marketValue: string; pnl: string; pnlRate: string;
  };
};

type BuyResult = { transaction: { id: string; type: "transfer"; amount: string; occurredAt: string };
  position: { quantity: string; costPrice: string; balance: string; marketValue: string; pnl: string; pnlRate: string } };

type SellResult = { transaction: { id: string; type: "disposal"; amount: string; occurredAt: string };
  realizedPnl: string; position: { quantity: string; costPrice: string; balance: string; isClosed: boolean } };

type PerformanceDTO = { marketValue: string; cost: string; pnl: string; pnlRate: string; totalInvested: string;
  irr: { annualizedRate: string | null; converged: boolean; asOf: string; reason?: string } };

type InstrumentDTO = { code: string; type: InstrumentType; name: string | null;
  latestPrice: string; priceSource: PriceSource; priceUpdatedAt: string; isStale: boolean; currency: string };

type AllocationItem = { instrumentType: InstrumentType; marketValue: string; ratio: string };
type AllocationDTO = { items: AllocationItem[]; total: string;
  alerts: { code: string; severity: "info" | "warn"; message: string; threshold?: string }[] };
```

---

## 复式分录契约（不变式，与 data-model.md §6 一致）

- **buy**（transfer 语义）：`debit investment amount == credit 现金 amount`（`amount = shares×price + fee`）；**净资产不变**（SC-001）。
- **revaluation**：`debit/credit investment |delta| == credit/debit __revaluation |delta|`（`delta = quantity×currentPrice − balance`）。
- **sell**（disposal 语义）：`debit 现金 proceeds + (debit __expense |loss|) == credit investment bookValue + (credit __income gain)`（`proceeds = shares×price − fee − tax`，`bookValue = balance×(shares/quantity)`）。
- **dividend_cash**（income 语义）：`debit 现金 amount == credit __income amount`（持仓不变）。
- 所有交易落库前 `assertBalanced` 强制 `Σdebit==Σcredit`、每腿 `amount>0`，违反 → 整事务回滚 + `400 LEDGER_INVARIANT`。
