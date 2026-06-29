# Data Model: 高级分析 (Phase 7)

**Feature**: 008-advanced-analytics · **Date**: 2026-06-29 · **Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

> Phase 1 产出。本文定义 Phase 7 的**领域模型增量**：5 张新表（纯新增，不改既有表列），沿用 finance 域 Drizzle 约定（`text` userId 无 FK、`uuid` PK `defaultRandom`、`timestamp` 内联默认、`varchar+$type` 枚举、**不使用 pgEnum**、金额 `numeric(18,2)`、比率 `numeric(18,4)`）。命名见 `src/database/schema/finance/`。
>
> 全部表共享**溯源四元组**（NC7）：`engineVersion` + `assumptions jsonb` + `disclaimers text[]` + 各自的规则版本/基线快照，保证可复现、可追溯。

---

## 1. 实体关系总览

```
finance_scenarios (what-if 情景定义 + 基线快照)
  │ 1
  │
  │ ∞
  finance_scenario_projections (逐月确定性投影点; scenarioId+monthOffset)

finance_tax_estimates (个税估算; 含 separate/merged 对比 + ruleVintage)
  └── 独立（按 userId 隔离，可多次估算留痕）

finance_retirement_simulations (退休模拟; 假设束 + 三点区间结果)
  └── 独立（按 userId 隔离）

finance_portfolio_hints (组合优化方向; 按 assetClass 一条)
  └── 独立（随持仓重算覆盖；可挂快照批次）
```

所有表：`userId text NOT NULL`（会话注入，无 FK，与全域一致）；不直接关联 `aiReports`（解读层走 `report.service` 既有范式，不在本数据模型新增强制外键）。

---

## 2. 新增表

### 2.1 `finance_scenarios` — What-if 情景定义 + 基线快照

文件：`src/database/schema/finance/scenarios.ts`

| 列 | Drizzle 类型 | 说明 |
|----|--------------|------|
| `id` | `uuid('id').primaryKey().defaultRandom().notNull()` | |
| `userId` | `text('user_id').notNull()` | 会话注入，无 FK |
| `name` | `text('name').notNull()` | 用户命名，如「降薪 30% 持续 6 个月」 |
| `kind` | `varchar('kind', { length: 24 }).$type<ScenarioKind>().notNull()` | `income_cut`/`rate_hike`/`lump_expense`/`unemployment`/`custom` |
| `assumptions` | `jsonb('assumptions').$type<ScenarioAssumptions>().notNull()` | `{ incomeDeltaPct, durationMonths, rateDeltaPct?, lumpExpense?, affectedMonth? }`（NC2） |
| `baselineSnapshot` | `jsonb('baseline_snapshot').$type<BaselineSnapshot>().notNull()` | 计算时的净资产/结余画像快照（NC7，保证日后可复算） |
| `horizonMonths` | `integer('horizon_months').notNull()` | 投影时长（默认 12，上限 60） |
| `engineVersion` | `varchar('engine_version', { length: 32 }).notNull()` | 如 `projection@1.0.0`（NC7） |
| `status` | `varchar('status', { length: 16 }).$type<DegradedStatus>().default('ok').notNull()` | `ok`/`degraded`（NC6） |
| `missing` | `jsonb('missing').$type<string[]>().default([]).notNull()` | 降级时缺失项说明 |
| `disclaimers` | `jsonb('disclaimers').$type<string[]>().default([]).notNull()` | 强制免责（NC7） |
| `createdAt` | `timestamp('created_at').defaultNow().notNull()` | |
| `updatedAt` | `timestamp('updated_at').defaultNow().notNull()` | |

**索引**：`finance_scenarios_user_idx` on (`userId`)。

**导出**：`scenarios` table；`insertScenarioSchema`/`selectScenarioSchema`；`type ScenarioItem`、`type NewScenario`；`SCENARIO_KINDS`/`type ScenarioKind`；`type ScenarioAssumptions`、`type BaselineSnapshot`、`type DegradedStatus`。

**不变量**：
- I1：`assumptions.durationMonths ∈ [1, horizonMonths]`（情景持续不超过投影时长）。
- I2：`status='degraded'` 时 `missing` 必非空；`status='ok'` 时 `missing` 为空。

---

### 2.2 `finance_scenario_projections` — 确定性投影点

文件：`src/database/schema/finance/scenario-projections.ts`

> 每个情景的逐月投影点（基线值 + 情景值 + diff），确定性、可复现（NC2/NC7）。同一情景重算 → 按 `(scenarioId, monthOffset)` 覆盖。

| 列 | Drizzle 类型 | 说明 |
|----|--------------|------|
| `id` | `uuid('id').primaryKey().defaultRandom().notNull()` | |
| `scenarioId` | `uuid('scenario_id').references(() => scenarios.id, { onDelete: 'cascade' }).notNull()` | |
| `userId` | `text('user_id').notNull()` | 冗余便于隔离查询（与全域一致） |
| `monthOffset` | `integer('month_offset').notNull()` | 0 = 当下，1..horizonMonths |
| `baselineNetWorth` | `numeric('baseline_net_worth', { precision: 18, scale: 2 })` | 基线净资产（cents 语义，存 decimal） |
| `scenarioNetWorth` | `numeric('scenario_net_worth', { precision: 18, scale: 2 })` | 情景净资产 |
| `netWorthDelta` | `numeric('net_worth_delta', { precision: 18, scale: 2 })` | 情景 − 基线 |
| `baselineEmergencyMonths` | `numeric('baseline_emergency_months', { precision: 18, scale: 4 })` | 基线应急金月数 |
| `scenarioEmergencyMonths` | `numeric('scenario_emergency_months', { precision: 18, scale: 4 })` | 情景应急金月数 |
| `goalImpact` | `jsonb('goal_impact').$type<GoalImpact>()` | 目标达成时点位移（复用 Phase 6 Goal 口径，NC2）：`{ goalId?, baselineAchieveMonth?, scenarioAchieveMonth?, deltaMonths? }` |
| `createdAt` | `timestamp('created_at').defaultNow().notNull()` | |

**索引**：`finance_scenario_projections_scenario_month_unique` UNIQUE on (`scenarioId`, `monthOffset`)；`finance_scenario_projections_user_idx` on (`userId`)。

**导出**：`scenarioProjections` table；`type ScenarioProjectionItem`、`type NewScenarioProjection`；`type GoalImpact`。

**不变量**：
- I3：`netWorthDelta = scenarioNetWorth − baselineNetWorth`（行内一致性，测试锚点）。
- I4：同一 `scenarioId` 的 `monthOffset` 覆盖 `0..horizonMonths` 连续（无空洞）。

---

### 2.3 `finance_tax_estimates` — 个税估算

文件：`src/database/schema/finance/tax-estimates.ts`

| 列 | Drizzle 类型 | 说明 |
|----|--------------|------|
| `id` | `uuid('id').primaryKey().defaultRandom().notNull()` | |
| `userId` | `text('user_id').notNull()` | |
| `taxYear` | `integer('tax_year').notNull()` | 纳税年度（如 2026） |
| `ruleVintage` | `varchar('rule_vintage', { length: 32 }).notNull()` | 规则版本，如 `PRC-IIT-2026`（NC1/NC7） |
| `inputs` | `jsonb('inputs').$type<TaxInputs>().notNull()` | `{ annualIncome, insuranceAndFund, specialDeductions: {...}, annualBonus? }` |
| `methodComparison` | `jsonb('method_comparison').$type<MethodComparison>().notNull()` | 年终奖两种计税对比（NC1）：`{ separate: {taxAmount}, merged: {taxAmount}, diff, better }`；无年终奖时两者相等 |
| `totalTaxAmount` | `numeric('total_tax_amount', { precision: 18, scale: 2 }).notNull()` | 较优方向的应纳税额（decimal） |
| `effectiveRate` | `numeric('effective_rate', { precision: 18, scale: 6 })` | 实际税率（totalTax / 应税所得） |
| `hints` | `jsonb('hints').$type<TaxHint[]>().default([]).notNull()` | 规则化节税方向（如「年终奖单独计税少缴 X」），非税务建议 |
| `engineVersion` | `varchar('engine_version', { length: 32 }).notNull()` | 如 `tax@1.0.0` |
| `status` | `varchar('status', { length: 16 }).$type<DegradedStatus>().default('ok').notNull()` | 收入/扣除缺失 → `degraded`（NC6） |
| `missing` | `jsonb('missing').$type<string[]>().default([]).notNull()` | |
| `disclaimers` | `jsonb('disclaimers').$type<string[]>().default([]).notNull()` | 强制含「非税务建议；需以当期法规/专业人士为准」（NC1 edge） |
| `createdAt` | `timestamp('created_at').defaultNow().notNull()` | |

**索引**：`finance_tax_estimates_user_year_idx` on (`userId`, `taxYear`)。

**导出**：`taxEstimates` table；`insertTaxEstimateSchema`/`selectTaxEstimateSchema`；`type TaxEstimateItem`、`type NewTaxEstimate`；`type TaxInputs`、`type MethodComparison`、`type TaxHint`。

**不变量**：
- I5：`methodComparison.diff = separate.taxAmount − merged.taxAmount`；`better` 取较小者（规则化，非建议）。
- I6：`disclaimers` 必含「需以当期法规为准」类文案（应用层校验 + 测试）。
- I7：税率表/扣除额来自版本化 `taxRuleConfig`（配置，非代码分支）；`ruleVintage` 与所用配置一致。

---

### 2.4 `finance_retirement_simulations` — 退休模拟

文件：`src/database/schema/finance/retirement-simulations.ts`

| 列 | Drizzle 类型 | 说明 |
|----|--------------|------|
| `id` | `uuid('id').primaryKey().defaultRandom().notNull()` | |
| `userId` | `text('user_id').notNull()` | |
| `assumptions` | `jsonb('assumptions').$type<RetirementAssumptions>().notNull()` | 假设束（NC3）：`{ currentAge, retirementAge, monthlyContribution, realReturnRatePct, inflationPct, postRetirementMonthlySpend, withdrawalRatePct }` |
| `horizonMonths` | `integer('horizon_months').notNull()` | 至退休（+退休后覆盖期）的总月数 |
| `resultPessimistic` | `jsonb('result_pessimistic').$type<RetirementPoint>().notNull()` | 悲观（回报率 −2%） |
| `resultBaseline` | `jsonb('result_baseline').$type<RetirementPoint>().notNull()` | 中性 |
| `resultOptimistic` | `jsonb('result_optimistic').$type<RetirementPoint>().notNull()` | 乐观（回报率 +2%） |
| `sustainableVerdict` | `text('sustainable_verdict').notNull()` | 「可维持 / 勉强 / 不足」规则判定（中性口径） |
| `engineVersion` | `varchar('engine_version', { length: 32 }).notNull()` | 如 `projection@1.0.0`（与 what-if 同引擎，NC3） |
| `status` | `varchar('status', { length: 16 }).$type<DegradedStatus>().default('ok').notNull()` | 年龄/节奏缺失 → `degraded`（NC6） |
| `missing` | `jsonb('missing').$type<string[]>().default([]).notNull()` | |
| `disclaimers` | `jsonb('disclaimers').$type<string[]>().default([]).notNull()` | 强制含「长期模拟含强假设，区间仅供方向参考，非确定预测」（SC-003） |
| `createdAt` | `timestamp('created_at').defaultNow().notNull()` | |

`RetirementPoint = { retirementCorpus: string, monthlySustainable: string, depletionAge?: number | null }`（金额 string/decimal 语义）。

**索引**：`finance_retirement_simulations_user_idx` on (`userId`)。

**导出**：`retirementSimulations` table；`insertRetirementSchema`/`selectRetirementSchema`；`type RetirementSimulationItem`、`type NewRetirementSimulation`；`type RetirementAssumptions`、`type RetirementPoint`。

**不变量**：
- I8：`resultPessimistic.retirementCorpus ≤ resultBaseline ≤ resultOptimistic`（三点单调，确定性扫描，NC3）。
- I9：`disclaimers` 必含不确定性提示文案（SC-003 测试锚点）。

---

### 2.5 `finance_portfolio_hints` — 组合优化方向

文件：`src/database/schema/finance/portfolio-hints.ts`

> 随持仓重算覆盖；按 `(userId, batchId, assetClass)` 唯一。`batchId` 标识一次重算批次（便于整组覆盖与追溯）。

| 列 | Drizzle 类型 | 说明 |
|----|--------------|------|
| `id` | `uuid('id').primaryKey().defaultRandom().notNull()` | |
| `userId` | `text('user_id').notNull()` | |
| `batchId` | `uuid('batch_id').defaultRandom().notNull()` | 一次重算的批次（整组覆盖） |
| `assetClass` | `varchar('asset_class', { length: 32 }).notNull()` | 复用 Phase 3 allocation 类别（现金/固收/权益/另类） |
| `currentRatio` | `numeric('current_ratio', { precision: 18, scale: 6 }).notNull()` | 当前占比（0–1） |
| `targetBand` | `jsonb('target_band').$type<{ min: number; max: number }>().notNull()` | 目标区间（参数化，NC4） |
| `direction` | `varchar('direction', { length: 8 }).$type<'under'|'over'|'ok'>().notNull()` | 偏离方向（仅方向，非指令） |
| `reason` | `text('reason').notNull()` | 引用规则的可解释依据 |
| `targetBandsVersion` | `varchar('target_bands_version', { length: 32 }).notNull()` | band 配置版本（NC4/NC7） |
| `engineVersion` | `varchar('engine_version', { length: 32 }).notNull()` | 如 `portfolio-hint@1.0.0` |
| `disclaimers` | `jsonb('disclaimers').$type<string[]>().default([]).notNull()` | 强制含「非投资建议，仅方向参考」 |
| `createdAt` | `timestamp('created_at').defaultNow().notNull()` | |

**索引**：`finance_portfolio_hints_user_batch_class_unique` UNIQUE on (`userId`, `batchId`, `assetClass`)；`finance_portfolio_hints_user_idx` on (`userId`)。

**导出**：`portfolioHints` table；`type PortfolioHintItem`、`type NewPortfolioHint`。

**不变量**：
- I10：`direction='ok'` ⇔ `targetBand.min ≤ currentRatio ≤ targetBand.max`。
- I11：所有 hint **不含**具体品种/买卖数量（应用层 + 测试保证，US4/FR-004）。

---

## 3. 既有表改列

**无**。Phase 7 是纯增量，不修改任何既有 `finance_*` 表（与 005 不同，无需 memberId/visibility 类改列）。复用既有 `positions`（组合优化输入）、`net_worth_snapshots`（基线快照来源）、Phase 6 goals（goalImpact 口径）。

## 4. 关系（`finance/relations.ts` 增补）

```ts
// finance_scenario_projections → finance_scenarios（已由 FK 表达，关系声明供 Drizzle 查询）
export const scenarioProjectionsRelations = relations(scenarioProjections, ({ one }) => ({
  scenario: one(scenarios, { fields: [scenarioProjections.scenarioId], references: [scenarios.id] }),
}));
```

其余三表（tax/retirement/portfolio-hints）无表间关系，不新增 relations 条目。

## 5. 状态转换

### 5.1 分析状态机（通用）
```
[引擎计算] → status='ok'      （数据充足）
           → status='degraded'（数据不足，附 missing[]；不产出编造结论，NC6）
```
无终态流转；每次计算为一次性快照，可重算覆盖（scenario_projections 按 scenarioId+monthOffset；portfolio_hints 按 batchId）。

### 5.2 情景重算
用户调整 `assumptions` → 旧 `scenario_projections` 按 scenarioId 整组删除后重灌（事务内，沿用 `refreshSnapshots` best-effort 范式可参考但此处需一致性，故用事务）。

## 6. 不变量（测试锚点）

- **I1**：`durationMonths ∈ [1, horizonMonths]`。
- **I2**：`degraded ⇔ missing 非空`。
- **I3**：`netWorthDelta = scenario − baseline`（投影点行内一致）。
- **I4**：投影点 monthOffset 连续无空洞。
- **I5**：`methodComparison.diff = separate − merged`；`better` 取较小。
- **I6**：个税 `disclaimers` 含「需以当期法规为准」。
- **I7**：税率/扣除来自版本化配置，`ruleVintage` 一致。
- **I8**：退休三点单调（悲观 ≤ 中性 ≤ 乐观）。
- **I9**：退休 `disclaimers` 含不确定性提示。
- **I10**：组合 `direction='ok' ⇔ 落在 band 内`。
- **I11**：组合 hint 不含具体品种/买卖数量。

## 7. 迁移

- `pnpm drizzle-kit generate` 生成 5 张新表的 `*.sql`（纯 `CREATE TABLE` + 索引，无 `ALTER`，向后兼容、可安全回滚）。
- 迁移文件输出至 `src/database/migrations/`。
- 不需要数据回填（新表，无历史数据）。

## 8. 影响面速查（实现阶段参照）

| 改动点 | 文件 |
|--------|------|
| 新表 schema ×5 | `src/database/schema/finance/{scenarios,scenario-projections,tax-estimates,retirement-simulations,portfolio-hints}.ts` |
| barrel 追加 5 导出 | `src/database/schema/finance/index.ts` |
| relations 增补 | `src/database/schema/finance/relations.ts` |
| 引擎 ×4（纯函数） | `src/services/finance/{projection.engine,tax.engine,portfolio-hint.engine}.ts`（退休复用 projection.engine） |
| 服务 ×4（取数→引擎→落表） | `src/services/finance/{scenario,tax,retirement,portfolio-hint}.service.ts` |
| repository ×4 | `src/repositories/finance/{scenario,tax-estimate,retirement,portfolio-hint}.repository.ts` |
| API ×4 组 | `src/app/api/finance/{scenarios,tax-estimates,retirement,portfolio-hints}/` |
| 前端 ×4 面板 + hooks/api | `src/features/finance/components/*`、`hooks/use-finance.ts`、`api.ts` |
