# API Contracts — 净资产闭环 + 首份 AI 报告 (Phase 1)

> Phase 1 输出：Next.js App Router Route Handlers（`src/app/api/finance/*`），在 Phase 0 路由之上扩展。全部需 Clerk 认证；`userId` 取自会话，请求体不携带 `userId`。金额为字符串（避免 JS number 精度问题），如 `"1250000.00"`。

## 通用约定（沿用 Phase 0）

- 认证：Clerk session；未认证 → `401`。
- 隔离：所有资源按 `userId` 过滤；越权访问他人资源 → `404`。
- 金额：请求/响应一律 **字符串**。
- 错误：统一 `{ error: string, code: string, details?: object }`。

---

## 1. 净资产仪表盘 Net Worth

### `GET /api/finance/net-worth`
- 查询：`?date=today`（默认今日）
- 行为：由账户余额推导当日总资产/总负债/净资产，并给出相对昨日的「今日变化」。
- 200：
  ```json
  {
    "date": "2026-06-29",
    "totalAssets": "1250000.00",
    "totalLiabilities": "390000.00",
    "netWorth": "860000.00",
    "todayChange": "2150.00",
    "breakdown": { "cash": "100000.00", "savings": "150000.00", "credit": "390000.00" }
  }
  ```

### `GET /api/finance/net-worth/snapshots`
- 查询：`?from=&to=`（日期区间）
- 200：`{ items: NetWorthSnapshot[] }`，每项 `{ date, totalAssets, totalLiabilities, netWorth, breakdown }`。曲线只读此结果。
- 行为：区间内缺口按需回填（lazy backfill）。

### `GET /api/finance/net-worth/breakdown?view=liquid|all`
- `liquid`：仅高流动性（现金/储蓄/投资），过滤实物估值（为 Phase 2 预留口径；Phase 1 等价 all）。
- 200：按账户类型分项汇总。

---

## 2. 截图 OCR 记账 OCR Record

### `POST /api/finance/ocr-record`（multipart：`image`）
- 行为：多模态 AI 识别图片 → structured output 得候选交易 + `confidence`；**不直接落库**。
- 200（可识别）：
  ```json
  {
    "candidate": { "type": "expense", "amount": "35.00", "occurredAt": "2026-06-29T12:30:00+08:00", "counterparty": "美团", "categoryId": "cat_food", "accountId": "acc_xxx", "note": "午饭" },
    "confidence": 0.92
  }
  ```
- 200（多笔/低置信）：`{ candidates: Candidate[], confidence, requireManualConfirm: true }`——前端逐笔确认或手动补全。
- 200（无法识别）：`{ candidate: null, reason: "image_unclear" }`——前端进入手动补全。
- 确认后落库：走 Phase 0 `POST /api/finance/transactions`（`source: "ocr"`）。

---

## 3. 规则结论与健康分 Rules & Health

### `GET /api/finance/findings?periodStart=&periodEnd=`
- 行为：`rules-engine` 确定性计算该周期 `RuleFinding[]`（即时、可复现）。
- 200：`{ findings: [{ metric, value, verdict, riskLevel }] }`

### `GET /api/finance/health-score?periodStart=&periodEnd=`
- 行为：由 findings 加权得 0–100 总分 + 各维度（缺失维度降权并标注）。
- 200：`{ total: "82.00", dimensions: { savingsRate: ..., debtRatio: ..., emergency: ..., investmentRate: { value: null, reason: "await_phase3" }, cashflow: ... } }`

---

## 4. AI 月报 Reports

### `POST /api/finance/reports/monthly`
- 体：`{ periodStart, periodEnd }`
- 行为：事实层 findings → LLM 表达 → 文档/Block 正文；写 `ai_reports`（含 `sourceDataHash`）。LLM 失败 → `status: "degraded"` + 模板正文。
- 201：`{ reportId, status, score, stale: false, contentRef }`

### `GET /api/finance/reports/:id`
- 行为：返回报告元数据 + 正文引用；比对 `sourceDataHash`，数据已变化 → `stale: true`。
- 200：`{ id, type, periodStart, periodEnd, score, dimensions, status, stale, contentRef, generatedAt }`

### `POST /api/finance/reports/:id/regenerate`
- 行为：以当前最新数据重新生成（覆盖或新建版本），刷新 `sourceDataHash`。
- 200：`{ reportId, status, stale: false }`

### `GET /api/finance/reports?periodStart=&periodEnd=`
- 200：`{ items: ReportMeta[] }`（列表/历史）

---

## 数据形状（TS，概要）

```ts
type NetWorthSnapshot = { date: string; totalAssets: string; totalLiabilities: string; netWorth: string; breakdown: Record<string, string> };
type RuleFinding = { metric: string; value: string | null; verdict: string; riskLevel: "none"|"low"|"medium"|"high" };
type HealthScore = { total: string; dimensions: Record<string, { value: string | null; reason?: string }> };
type ReportMeta = { id: string; type: "monthly"; periodStart: string; periodEnd: string; score: string; status: "draft"|"published"|"stale"|"degraded"; stale: boolean; contentRef: string | null; generatedAt: string };
```
