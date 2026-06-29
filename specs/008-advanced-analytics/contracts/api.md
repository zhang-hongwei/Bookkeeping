# API Contracts: 高级分析 (Phase 7)

**Feature**: 008-advanced-analytics · **Date**: 2026-06-29 · **Spec**: [spec.md](./spec.md) · **Data Model**: [data-model.md](../data-model.md)

> Phase 1 产出。本文定义 Phase 7 对外暴露的 HTTP 契约。**沿用 finance 域既有约定**（005 同款）：响应体为 `{ data }` 或错误 `{ error, code, details? }`；金额一律 **string**（decimal）；日期 ISO 8601；`userId` 永远来自会话，**不得**出现在请求体；鉴权用 `_lib/auth.ts` 的 `requireUserId()`；家庭视角端点额外用 005 `_lib/family-auth.ts` 的 `requireFamilyMembership(familyId)`。
>
> **红线（NC5）**：所有数字结论由确定性引擎在服务端计算并落入 `data`；`/interpret` 子资源仅返回 LLM **解读文本**（消费同一份结构化结果，禁止编造数字）。前端**始终渲染结构化数字**，解读文本仅作旁注。

---

## 0. 通用约定

### 0.1 鉴权与权限
- 所有端点：`const authed = await requireUserId(); if (authed instanceof NextResponse) return authed;`
- 家庭视角（请求体/查询含 `familyId`）：随后 `requireFamilyMembership(familyId, userId)`，否则 **403**（复用 005）。

### 0.2 错误码
| code | HTTP | 说明 |
|------|------|------|
| `UNAUTHORIZED` | 401 | 未登录 |
| `FORBIDDEN` | 403 | 非该家庭 active 成员 |
| `BAD_BODY` | 400 | 非合法 JSON |
| `VALIDATION` | 422 | Zod 校验失败（含 `details`） |
| `DEGRADED` | 200 | ⚠️ **非错误**——数据不足以计算完整结论，`data.status='degraded'`，附 `missing[]`，HTTP 仍 200（NC6） |
| `NOT_FOUND` | 404 | 资源不存在或不属于当前用户 |
| `LLM_UNAVAILABLE` | 200 | `/interpret` 在 LLM 不可用时返回空文本 `""`，不阻断结构化结果 |
| `INTERNAL` | 500 | 服务端错误 |

错误体示例：
```json
{ "error": "无权访问该家庭数据", "code": "FORBIDDEN" }
```

### 0.3 公共 DTO 形状
```ts
type Money = string;                 // decimal, e.g. "12345.67"
type Ratio = string;                 // 0–1 或小数, e.g. "0.3000"

/** 溯源四元组（NC7），所有结果共享 */
interface EngineMeta {
  engineVersion: string;             // "projection@1.0.0"
  ruleVintage?: string;              // 个税: "PRC-IIT-2026"
  targetBandsVersion?: string;       // 组合: band 配置版本
  assumptions: Record<string, unknown>;   // 本次全部假设/参数
  disclaimers: string[];             // 强制免责（前端必渲染）
}

type AnalysisStatus = 'ok' | 'degraded';

interface DegradedInfo {
  status: 'degraded';
  missing: string[];                 // 缺失项说明（NC6）
}
```

---

## 1. What-if 情景模拟

### 1.1 `POST /api/finance/scenarios` — 计算并保存情景
请求体（`userId` 来自会话）：
```jsonc
{
  "name": "降薪 30% 持续 6 个月",
  "kind": "income_cut",                       // income_cut|rate_hike|lump_expense|unemployment|custom
  "assumptions": {
    "incomeDeltaPct": -0.30,                  // 降薪 30%
    "durationMonths": 6,
    "rateDeltaPct": null,                     // rate_hike 时填
    "lumpExpense": null,                      // lump_expense 时填（Money）
    "affectedMonth": null
  },
  "horizonMonths": 12,
  "familyId": null                            // 可选：家庭视角
}
```
响应 `201` `{ data: ScenarioDTO }`（或 `200` + `status:'degraded'` 当无历史结余/净资产）。

### 1.2 `GET /api/finance/scenarios` — 列表
查询：`?familyId=`。响应 `{ data: ScenarioDTO[] }`（不含投影点明细，仅概要 + 最末点 delta）。

### 1.3 `GET /api/finance/scenarios/[id]` — 详情（含投影点）
响应 `{ data: ScenarioDTO }`（`projections[]` 完整）。

### 1.4 `POST /api/finance/scenarios/[id]/interpret` — LLM 解读
请求体：`{ "familyId"?: string }`（可选，指定视角）。响应 `{ data: { text: string } }`。LLM 仅消费该情景的结构化结果，输出自然语言解读；不可用时 `text: ""`（`LLM_UNAVAILABLE`，HTTP 200）。

```ts
interface ScenarioDTO extends EngineMeta {
  id: string;
  name: string;
  kind: ScenarioKind;
  assumptions: ScenarioAssumptions;
  horizonMonths: number;
  status: AnalysisStatus;
  missing?: string[];                // degraded 时
  baselineSnapshot: BaselineSnapshot;
  projections: ScenarioPointDTO[];   // 详情含全集；列表仅最末点
}

interface ScenarioPointDTO {
  monthOffset: number;               // 0..horizonMonths
  baselineNetWorth: Money;
  scenarioNetWorth: Money;
  netWorthDelta: Money;              // = scenario − baseline (I3)
  baselineEmergencyMonths: Ratio | null;
  scenarioEmergencyMonths: Ratio | null;
  goalImpact?: GoalImpact;           // { goalId?, baselineAchieveMonth?, scenarioAchieveMonth?, deltaMonths? }
}
```

---

## 2. 中国个税估算

### 2.1 `POST /api/finance/tax-estimates` — 估算（支持计税方式对比）
请求体（`userId` 来自会话）：
```jsonc
{
  "taxYear": 2026,
  "inputs": {
    "annualIncome": "360000.00",
    "insuranceAndFund": "36000.00",
    "specialDeductions": {                  // 专项附加扣除（NC1，目录化）
      "children_education": "12000.00",
      "supporting_elderly": "24000.00"
    },
    "annualBonus": "60000.00"               // 可选；无则 separate==merged
  },
  "familyId": null
}
```
响应 `201` `{ data: TaxEstimateDTO }`（缺收入/扣除 → `status:'degraded'` + 已填项按 0 估算的 `missing[]`）。

### 2.2 `GET /api/finance/tax-estimates?taxYear=` — 取最近一次估算
响应 `{ data: TaxEstimateDTO | null }`。

### 2.3 `POST /api/finance/tax-estimates/[id]/interpret` — LLM 解读
响应 `{ data: { text: string } }`（解读计税方式差异与规则化节税方向；不得新增数字）。

```ts
interface TaxEstimateDTO extends EngineMeta {
  id: string;
  taxYear: number;
  ruleVintage: string;               // "PRC-IIT-2026" (I7)
  inputs: TaxInputs;
  methodComparison: {
    separate: { taxAmount: Money };   // 年终奖单独计税
    merged:  { taxAmount: Money };     // 并入综合所得
    diff: Money;                       // separate − merged (I5)
    better: 'separate' | 'merged';     // 较小者（规则化，非建议）
  };
  totalTaxAmount: Money;              // 较优方向应纳税额
  effectiveRate: Ratio | null;
  hints: TaxHint[];                   // 规则化节税方向，非税务建议
  status: AnalysisStatus;
  missing?: string[];
}
```
> `disclaimers` 服务端强制注入「非税务建议；需以当期法规/专业人士为准」（I6）。

---

## 3. 退休模拟

### 3.1 `POST /api/finance/retirement` — 模拟
请求体：
```jsonc
{
  "assumptions": {
    "currentAge": 30,
    "retirementAge": 60,
    "monthlyContribution": "5000.00",
    "realReturnRatePct": 4.0,         // 实际回报（默认保守）
    "inflationPct": 2.5,
    "postRetirementMonthlySpend": "8000.00",
    "withdrawalRatePct": 4.0          // 安全提取率（经验假设）
  },
  "familyId": null
}
```
响应 `201` `{ data: RetirementDTO }`（缺年龄/节奏 → `status:'degraded'`）。

### 3.2 `GET /api/finance/retirement/latest` — 取最近一次
响应 `{ data: RetirementDTO | null }`。

### 3.3 `POST /api/finance/retirement/[id]/interpret` — LLM 解读
响应 `{ data: { text: string } }`。

```ts
interface RetirementDTO extends EngineMeta {
  id: string;
  assumptions: RetirementAssumptions;
  horizonMonths: number;
  resultPessimistic: RetirementPoint;  // 回报率 −2% (I8)
  resultBaseline: RetirementPoint;     // 中性
  resultOptimistic: RetirementPoint;   // 回报率 +2%
  sustainableVerdict: 'sustainable' | 'marginal' | 'insufficient';
  status: AnalysisStatus;
  missing?: string[];
}

interface RetirementPoint {
  retirementCorpus: Money;             // 退休时点预估资产
  monthlySustainable: Money;           // 按提取率可支撑月支出
  depletionAge: number | null;         // 资产耗尽年龄（null = 可持续）
}
```
> `disclaimers` 服务端强制注入「长期模拟含强假设，区间仅供方向参考，非确定预测」（I9，SC-003）。

---

## 4. 组合优化方向

### 4.1 `GET /api/finance/portfolio-hints` — 当前持仓的方向建议
查询：`?familyId=`。响应 `{ data: PortfolioHintsDTO }`。无持仓/总市值 0 → `hints: []`（同 `computeConcentrationAlert` 现状，不编造）。

### 4.2 `POST /api/finance/portfolio-hints/interpret` — LLM 解读
请求体：`{ "familyId"?: string }`。响应 `{ data: { text: string } }`。

```ts
interface PortfolioHintsDTO extends EngineMeta {
  batchId: string;
  targetBandsVersion: string;
  totalMarketValue: Money;
  hints: PortfolioHintDTO[];          // 可能为空（无持仓）
}

interface PortfolioHintDTO {
  assetClass: string;                 // 复用 Phase 3 allocation 类别
  currentRatio: Ratio;
  targetBand: { min: number; max: number };
  direction: 'under' | 'over' | 'ok'; // 仅方向 (I10)
  reason: string;                     // 引用规则的可解释依据
}
```
> `disclaimers` 服务端强制注入「非投资建议，仅方向参考」；hint **不含**具体品种/买卖数量（I11，US4/FR-004）。

---

## 5. 跨切面契约要点

- **确定性优先**：所有 `data` 内数字由引擎计算；`/interpret` 仅文本，且前端不依赖其数字。
- **降级不抛错**：数据不足 → HTTP 200 + `status:'degraded'` + `missing[]`（NC6），客户端据此渲染降级提示。
- **免责强渲染**：`disclaimers[]` 是结构化数据，前端**必须**显著渲染（合规免责 edge case）。
- **可复现**：同 `engineVersion + assumptions + baselineSnapshot` → 同结果；落表可追溯（SC-004）。
- **隔离**：`userId` 仅来自会话；家庭视角经 `requireFamilyMembership`（FR-008）。
