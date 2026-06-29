# API Contracts: AI 财富顾问深化 (Phase 6)

> Phase 1 产出。所有端点挂在既有 `/api/finance` 下，复用 `_lib/auth.ts`（`requireUserId`，Supabase 会话，401 鉴权）、`_lib/validation.ts`（Zod 4）、`_lib/serialize.ts`（service→DTO）。设计依据见 [research.md](./research.md)、[data-model.md](./data-model.md)。本契约为前端 `features/finance/api.ts` 与测试的共同遵守面。

## 0. 通用约定

### 0.1 鉴权与权限

- 全部端点经 `requireUserId()`；未登录 → **401**。
- 所有读写 **100% 按 `userId` 隔离**（I5）。跨用户资源访问（路径 id 不属于当前 userId）→ **404**（不泄露存在性）。
- 顾问会话/审批/预警/预测仅限资源 owner 操作；无家庭共享语义（与 Phase 4 的 403 路径不同，本 Phase 资源为纯个人）。

### 0.2 错误码

| 状态码 | 语义 | 触发场景 |
|--------|------|----------|
| 401 | 未认证 | 无有效会话 |
| 404 | 不存在 / 越权 | 资源不属于当前用户 |
| 422 | 业务校验失败 | 规则校验未通过、审批状态非法转换、历史不足需降级（带 `code`） |
| 409 | 冲突 | 审批已 `applied` 重复 apply（幂等返回当前态而非报错，见 §6） |
| 503 | LLM 服务不可用 | 顾问/报告表达层失败——**自动降级**为模板文本（SC-005），不向客户端抛 5xx |

### 0.3 公共 DTO 形状

```ts
// 可追溯引用：所有数值结论的标准锚点（SC-002 / I1）
interface SourceRef {
  metric: FindingMetric;        // savings_rate | debt_ratio | emergency_months | trend_* | ...
  period: string;               // YYYY-MM
  value: string | null;         // decimal 字符串
  verdict: string;
  riskLevel: RiskLevel;         // none|low|medium|high
}

// 合规免责（FR-009）：所有预测/建议/预警响应必带
const NON_INVESTMENT_ADVICE_DISCLAIMER =
  '本内容非投资建议，所有结论来自规则引擎与账目数据，投资决策请自行判断。';

interface DisclaimerEnvelope<T> {
  data: T;
  disclaimer: typeof NON_INVESTMENT_ADVICE_DISCLAIMER;
  sourceRefs: SourceRef[];      // 本响应数值结论的来源锚点
}
```

## 1. 现金流预测（FR-001）

### 1.1 `GET /api/finance/forecasts?months=3&target=YYYY-MM` — 现金流预测

- **响应** `200` `DisclaimerEnvelope<ForecastDTO>`：
```ts
interface ForecastPoint {
  month: string;                // YYYY-MM
  surplus: string;              // 预测结余，decimal
  cashBalance: string;          // 预测期末现金资产
  lower: string; upper: string; // 不确定性区间（决策 2/3）
}
interface ForecastDTO {
  targetMonth: string;
  insufficientHistory: boolean; // 历史不足降级（决策 3）
  points: ForecastPoint[];      // insufficientHistory=true 时为空
  emergencyShortfallMonth: string | null; // 首个应急金不足月（User Story 1）
  modelVersion: string;
  generatedAt: string;
}
```
- **降级**：历史 `< MIN_HISTORY_MONTHS` → `insufficientHistory=true`、`points=[]`、`sourceRefs` 仅含说明，200 返回（非 422）。

### 1.2 `POST /api/finance/forecasts` — 重新生成（手动刷新）

- **Body**：`{ targetMonth?: string, months?: number }`
- **行为**：重算并以 `(userId,targetMonth)` 覆盖缓存（幂等）。
- **响应**：同 §1.1。

## 2. 智能预警（FR-002 / FR-008）

### 2.1 `GET /api/finance/alerts?status=active` — 预警列表

- **响应** `200` `DisclaimerEnvelope<{ alerts: AlertDTO[] }>`：
```ts
interface AlertDTO {
  id: string;
  kind: 'emergency_shortfall' | 'savings_rate_decline' | 'debt_ratio_high' | 'trend_deterioration' | 'concentration';
  severity: 'low' | 'medium' | 'high';
  period: string;
  status: 'active' | 'acknowledged' | 'silenced';
  message: string;              // 规则结论模板，非 LLM 文本
  ruleFindingRefs: SourceRef[]; // 可追溯（I1）
  createdAt: string;
}
```
- **过滤**：受 `alert_preferences` 影响——`muted` 且未过期的 kind 不进 `active` 列表（FR-008），但仍可经 `status=all` 回看。

### 2.2 `PATCH /api/finance/alerts/[id]` — 已读/静默单条

- **Body**：`{ status: 'acknowledged' | 'silenced' }`
- **响应** `200` `AlertDTO`。

### 2.3 `GET` / `PATCH /api/finance/alert-preferences` — 偏好/静默

- **GET** `200` `{ preferences: AlertPreferenceDTO[] }`。
- **PATCH Body**：`{ kind, muted?, mutedUntil?, channel? }`；以 `(userId,kind)` upsert。
```ts
interface AlertPreferenceDTO { kind: string; muted: boolean; mutedUntil: string | null; channel: string | null; }
```

## 3. 顾问对话（FR-003 / FR-004 / FR-007）

### 3.1 `POST /api/finance/advisor/sessions` — 新建会话

- **Body**：`{ title?: string }`
- **响应** `201` `{ sessionId: string }`。

### 3.2 `GET /api/finance/advisor/sessions` — 我的会话列表

- **响应** `200` `{ sessions: AdvisorSessionDTO[] }`。

### 3.3 `GET /api/finance/advisor/sessions/[id]/messages` — 会话历史

- **响应** `200` `DisclaimerEnvelope<{ messages: AdvisorMessageDTO[] }>`：
```ts
interface AdvisorMessageDTO {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citedFindings: SourceRef[];   // 可追溯（I1）
  degraded: boolean;            // LLM 失败降级（I7）
  proposalId: string | null;    // 携带的高风险提议
  createdAt: string;
}
```

### 3.4 `POST /api/finance/advisor/sessions/[id]/messages` — 发送提问

- **Body**：`{ content: string }`
- **行为**：取事实层（findings+health+forecast+trends）→ AI SDK 表达层（克隆报告红线 prompt，决策 8）；LLM 失败 → `degraded=true` 模板文本（200，非 5xx，SC-005）。若顾问提议高风险动作 → 生成 `proposed` 态 `proposalId` 返回，**不**直接落库（FR-004）。
- **响应** `200` `DisclaimerEnvelope<AdvisorMessageDTO>`。

## 4. 审批闭环（FR-004 / SC-003）

### 4.1 `GET /api/finance/approvals?status=pending` — 待审/历史提议

- **响应** `200` `{ approvals: ApprovalDTO[] }`：
```ts
interface ApprovalDTO {
  id: string;
  kind: 'flag_transaction_anomaly' | 'rebalance_suggestion' | 'amend_finding_override' | 'create_transaction';
  payload: unknown;             // kind 结构化
  status: 'proposed' | 'pending' | 'approved' | 'rejected' | 'applied' | 'expired';
  ruleValidation: { passed: boolean; reason?: string; refs: SourceRef[] };
  proposedBy: string | null;
  approvedAt: string | null;
  appliedAt: string | null;
  expiresAt: string;
}
```

### 4.2 `GET /api/finance/approvals/[id]` — 详情

- **响应** `200` `ApprovalDTO`。

### 4.3 `PATCH /api/finance/approvals/[id]` — 批准 / 拒绝

- **Body**：`{ decision: 'approve' | 'reject' }`
- **行为**：`pending→approved`（批准）/ `pending→rejected`（拒绝）。`approved` 后**不**自动落库，需显式 §4.4。
- **响应** `200` `ApprovalDTO`；非法转换 → 422。

### 4.4 `POST /api/finance/approvals/[id]/apply` — 执行落库（幂等）

- **前置**：必须先 `approved`。
- **行为**：**apply 时规则再校验**（defensive，I2/I8）；通过 → `applied` + 复用既有服务落库（`create_transaction` 走 `ledger.service` 平衡校验；其余按决策 6）；失败 → `rejected` + 原因。
- **响应**：成功 `200` `{ status: 'applied', appliedResult: unknown }`；重复 apply → `200` 幂等返回当前 `applied` 态（**非 409**，I8）。
- **422**：未 approved / 规则再校验失败；`expired` → 422 带 `code:'expired'`。

## 5. 健康分（既有端点扩展，FR-006）

### 5.1 `GET /api/finance/health-score` — 完善后健康分

- **响应** `200` `DisclaimerEnvelope<HealthScoreDTO>`（既有 DTO，复用）。
- **变化**（代码层）：`investmentRate` 维度接 Phase 3 持仓（不再 `await_phase3` 桩）；`cashflow` 维度改为方差稳定性评分（决策 12）。

## 6. 多期趋势对比（FR-005 / SC-004）

### 6.1 `GET /api/finance/trends?metric=savings_rate,debt_ratio,score&periods=12` — 趋势时序

- **行为**：纯函数聚合 `listReports` + 各期 `finance_rule_findings`（决策 13）。
- **响应** `200` `DisclaimerEnvelope<TrendDTO>`：
```ts
interface TrendSeries { metric: string; points: { period: string; value: string }[]; direction: 'up' | 'down' | 'flat'; deteriorating: boolean; }
interface TrendDTO { series: TrendSeries[]; }
```
- `deteriorating` 复用趋势规则（决策 10），显著恶化时前端据此提示。

## 7. 契约不变量（前端/测试共同遵守）

1. **数值必带 `sourceRefs`**：§1/§2/§3/§5/§6 任何含数值的响应都附 `sourceRefs`（SC-002）；前端可据此展开「为什么是这个数」。
2. **免责常量恒在**：所有预测/建议/预警响应携带 `disclaimer`（FR-009）。
3. **降级不报 5xx**：LLM 失败一律 200 + `degraded=true`/`insufficientHistory=true`（SC-005），客户端按标记渲染模板。
4. **高风险不自动落库**：§3.4 的 `proposalId` 仅创建 `proposed` 提议；落库**只**经 §4.3+§4.4 显式审批 + 再校验（SC-003）。
5. **幂等 apply**：§4.4 重复调用返回当前态，不报错、不双计（I8）。
6. **隔离**：所有路径 id 越权 → 404（I5）。
