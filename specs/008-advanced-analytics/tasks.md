---
description: "Task list for feature implementation"
---

# Tasks: 高级分析 (Phase 7)

**Input**: Design documents from `/specs/008-advanced-analytics/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md（均已就绪）

**Tests**: 本特性**包含测试**。原因：spec 的成功标准 SC-001（what-if 可复现、与基线一致）/SC-002（个税正确）/SC-003（退休标注不确定性）/SC-004（结论 100% 可追溯、免责）/SC-005（数据不足降级、不编造）均为可测不变式，data-model.md §6 列出 I1–I11 不变量，quickstart.md §6 明确测试文件，且 CLAUDE.md 强制测试文化。沿用仓库既有两层模式（见 `tests/finance/_helpers.ts`）：**纯函数引擎测试始终运行**（无 DB、确定性、可复现）；**服务层集成测试由 `FINANCE_INTEGRATION_TEST=1` 门控**（需真实 Postgres 测试库 + `scripts/init-finance.mjs`）。每个故事「先写测试、确保失败再实现」。

**Organization**: 任务按用户故事分组（US1 P1 what-if / US2 P2 个税 / US3 P3 退休 / US4 P4 组合优化）。Phase 1 Setup → Phase 2 Foundational（阻塞所有故事的 5 张表 schema + 迁移 + barrel/relations + 共享 `_lib/analysis-common.ts` + 版本化规则配置）→ Phase 3-6 各用户故事 → Phase 7 Polish。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、不依赖未完成任务）
- **[Story]**: 归属用户故事（US1/US2/US3/US4）；Setup/Foundational/Polish 阶段**无** story 标签
- 描述内必须含**精确文件路径**，并附依赖 `（依赖 Tx）` 与文档引用 `（data-model.md §N / research.md NCN / contracts/api.md §N / quickstart.md §N）`

## Path Conventions

- Schema: `src/database/schema/finance/`（barrel `index.ts`，关系集中在 `relations.ts`）—— 新增 `scenarios.ts`/`scenario-projections.ts`/`tax-estimates.ts`/`retirement-simulations.ts`/`portfolio-hints.ts`
- Repository: `src/repositories/finance/`（继承既有 `base.ts` 单 userId 范式；家庭视角按成员聚合后传入）
- Service: `src/services/finance/`（**纯函数引擎** `*.engine.ts` 导出供单测；`*.service.ts` 取数→引擎→落表）
- API: `src/app/api/finance/`（共享 `_lib/{auth,validation,serialize}.ts`，新增 `_lib/analysis-common.ts`）
- 前端: `src/features/finance/`（扩展既有 `api.ts` DTO + `hooks/use-finance.ts` TanStack Query + `components/`，与 Phase 0–6 UI 同位）
- 测试: `tests/finance/`
- **领域铁律（沿用全域，红线）**：金额一律字符串、内部「分」整数（`toCents`/`fromCents`，`src/services/finance/money.ts`），**禁止浮点**；用户表 `userId` 为纯文本无 FK；**确定性引擎/规则负责一切数字结论，LLM 仅解读、零编造**（research.md NC5）；结论带 `engineVersion`+`assumptions`+`disclaimers` 溯源（NC7）；数据不足走 `degraded`、不编造（NC6）；写操作单事务。

> ⚠️ **关键复用点**（避免重复造轮子）：
> - 纯函数引擎范本：`rules-engine.service.ts` 的 `computeFindingsFromData`/`computeHealthScore`/`computeConcentrationAlert`（导出、零幻觉、可复现）——Phase 7 四引擎照此范式。
> - 净资产基线：`net-worth.service.ts` 的 `computeNetWorthAtDate(userId, date)` → `{totalAssets, totalLiabilities, breakdown:{cash,savings,…}}`；应急金口径 `breakdown.cash + breakdown.savings`（见 `rules-engine.service.ts` 的 `getPeriodMetrics`）。
> - 结余画像：`rules-engine.service.ts` 的 `getPeriodMetrics`（income/expense 聚合，转账不计收支）——what-if/退休的 `surplusProfile` 沿用同口径，与 Phase 6 目标预计达成算法一致（research.md NC2）。
> - 集中度预警：`computeConcentrationAlert(positions, threshold)` —— 组合优化方向（US4）是它的自然扩展（单一持仓 → 资产类别偏离）。
> - LLM 解读层范本：`report.service.ts`（Phase 2 月报「规则结论 → LLM 表达」）——Phase 7 各 `/interpret` 子资源照此，并加**零编造校验**。
> - 家庭聚合：005 `requireFamilyMembership(familyId, userId)` + `computeFamilyNetWorthLive` —— 家庭视角分析复用。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 确认前置阶段就绪、补齐环境变量（本特性为增量，无脚手架）。

- [X] T001 ⚠️ **硬前置**：确认 Phase 0–4 已实现并达标——`src/database/schema/finance/`（accounts/transactions+entries/categories/asset+liability-details/net-worth-snapshots/positions/instruments/investment-trades）、`src/services/finance/{ledger,balance,net-worth,asset,liability,investment,rules-engine,report}.service.ts`、纯函数 `computeNetWorthAtDate`/`getPeriodMetrics`/`computeConcentrationAlert`、`money.ts`(cents)、`refreshSnapshots` 钩子均存在；运行 `pnpm test --run --silent='passed-only' 'finance'` 确认 Phase 0–4 测试全绿（quickstart.md §1）。
  - ⚠️ **Phase 6（006 预算/目标）尚未实现**：US1 的 `goalImpact`（情景对目标达成的影响）复用 Phase 6 目标投影算法——**Phase 6 未落地前 `goalImpact` 必须降级**（NC6：返回 null + missing 提示），不阻断 US1/US3 主体。US2（个税）/US4（组合）仅需 Phase 0–4，可独立交付。
  - ⚠️ **Phase 7（007 ai-wealth-advisor）仅有 spec、无 plan**：本特性**不依赖** 007 编排层；`/interpret` 直接复用 `report.service` 的 LLM 范式。007 的「AI 财富管家」总编排留待其自身 spec/plan。
- [X] T002 [P] 环境变量：在 `.env.local` 确认/补齐 `DATABASE_URL`、`DATABASE_TEST_URL`（集成测试库）、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`，以及 Phase 2 `report.service` 既有的 LLM 配置键（`/interpret` 不可用时返回空文本，结构化结果不受影响，contracts §0.2 LLM_UNAVAILABLE）。Phase 7 **无新增必需变量**（quickstart.md §3）。

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 所有用户故事共享的 5 张表 schema + 迁移 + barrel/relations + 共享 `_lib/analysis-common.ts` + 版本化规则配置，必须先完成。
**⚠️ CRITICAL**：未完成本阶段前不得开始任何用户故事。

- [X] T003 新增 `src/database/schema/finance/scenarios.ts`：`finance_scenarios`（id uuid PK defaultRandom、userId text 无 FK、name text、kind varchar24 $type 枚举 income_cut/rate_hike/lump_expense/unemployment/custom、assumptions jsonb、baselineSnapshot jsonb、horizonMonths integer 1..60、engineVersion varchar32、status varchar16 $type DegradedStatus default 'ok'、missing jsonb string[] default []、disclaimers jsonb string[] default []、手写 createdAt/updatedAt）。索引 `(userId)`；导出枚举常量 `SCENARIO_KINDS`/`type ScenarioKind`、`type ScenarioAssumptions`/`BaselineSnapshot`/`DegradedStatus`、`insert/select` schema、`ScenarioItem`/`NewScenario`（data-model.md §2.1 / research.md NC2/NC7）。**不使用 pgEnum**。
- [X] T004 [P] 新增 `src/database/schema/finance/scenario-projections.ts`：`finance_scenario_projections`（id uuid PK、scenarioId uuid FK→scenarios cascade、userId text、monthOffset integer、baselineNetWorth/scenarioNetWorth/netWorthDelta numeric18,2、baselineEmergencyMonths/scenarioEmergencyMonths numeric18,4 可空、goalImpact jsonb 可空、createdAt）。**UNIQUE(scenarioId, monthOffset)** + `(userId)` 索引；导出 `ScenarioProjectionItem`/`NewScenarioProjection`/`type GoalImpact`（data-model.md §2.2 / 依赖 T003）。
- [X] T005 [P] 新增 `src/database/schema/finance/tax-estimates.ts`：`finance_tax_estimates`（id、userId、taxYear integer、ruleVintage varchar32、inputs jsonb、methodComparison jsonb、totalTaxAmount numeric18,2、effectiveRate numeric18,6 可空、hints jsonb TaxHint[] default []、engineVersion、status、missing、disclaimers、createdAt）。索引 `(userId, taxYear)`；导出 `TaxEstimateItem`/`NewTaxEstimate`/`type TaxInputs`/`MethodComparison`/`TaxHint`（data-model.md §2.3 / research.md NC1）。
- [X] T006 [P] 新增 `src/database/schema/finance/retirement-simulations.ts`：`finance_retirement_simulations`（id、userId、assumptions jsonb、horizonMonths、resultPessimistic/resultBaseline/resultOptimistic jsonb RetirementPoint、sustainableVerdict text、engineVersion、status、missing、disclaimers、createdAt）。索引 `(userId)`；导出 `RetirementSimulationItem`/`NewRetirementSimulation`/`type RetirementAssumptions`/`RetirementPoint`（data-model.md §2.4 / research.md NC3）。
- [X] T007 [P] 新增 `src/database/schema/finance/portfolio-hints.ts`：`finance_portfolio_hints`（id、userId、batchId uuid defaultRandom、assetClass varchar32、currentRatio numeric18,6、targetBand jsonb {min,max}、direction varchar8 $type 'under'|'over'|'ok'、reason text、targetBandsVersion varchar32、engineVersion、disclaimers、createdAt）。**UNIQUE(userId, batchId, assetClass)** + `(userId)` 索引；导出 `PortfolioHintItem`/`NewPortfolioHint`（data-model.md §2.5 / research.md NC4）。
- [X] T008 扩展 `src/database/schema/finance/relations.ts`（`scenarioProjectionsRelations` → `scenarios` one）与 `index.ts`（barrel 追加 5 导出），运行 `pnpm db:generate` + `pnpm db:migrate`（依赖 T003–T007）。迁移为纯 `CREATE TABLE` + 索引、向后兼容、可安全回滚（无 ALTER、无数据回填）。
- [X] T009 [P] 新增 `src/app/api/finance/_lib/analysis-common.ts`（共享溯源/降级/免责，所有引擎/服务复用）：免责常量 `DISCLAIMERS`（generic / tax 含「非税务建议；需以当期法规/专业人士为准」/ retirement 含「长期模拟含强假设，区间仅供方向参考，非确定预测」/ portfolio 含「非投资建议，仅方向参考」）、`engineVersion` 构造器、`type AnalysisStatus='ok'|'degraded'`、`buildProvenance({engineVersion, ruleVintage?, targetBandsVersion?, assumptions, disclaimers})`、降级助手 `degraded(missing: string[])`。复用 `money.ts` cents（research.md NC5/NC6/NC7 / contracts/api.md §0.3）。
- [X] T010 [P] 新增版本化规则配置（**配置非代码**，具体数值留待临近实施按当时法规/真实数据回填，research.md NC1/NC3/NC4）：`src/services/finance/config/tax-rule.ts`（导出 `taxRuleConfig`：七级累进税率表 + 速算扣除 + 专项附加扣除目录定额 + `ruleVintage`，如 `PRC-IIT-2026`，占位值带 TODO）、`src/services/finance/config/target-bands.ts`（导出 `targetBands`：各资产类别目标区间 + `targetBandsVersion`）、`src/services/finance/config/retirement-defaults.ts`（默认 `realReturnRatePct`/`inflationPct`/`withdrawalRatePct`，保守取值 + 来源注释）。

**Checkpoint**：5 张新表已迁移 + barrel/relations 就绪；`analysis-common`（溯源/降级/免责）可用；版本化规则配置 scaffolding 就绪。Phase 3-6 引擎可开始。

---

## Phase 3: User Story 1 - 问问「如果」：失业/降薪/加息会怎样 (Priority: P1) 🎯 MVP

**Goal**: 用户设置 what-if 情景（降薪/加息/大额支出），系统基于**确定性投影纯函数引擎**推演对净资产曲线、应急金月数、目标达成的影响；结果与基线同口径、可复现、可解释（FR-001/FR-005/FR-007，SC-001/SC-004/SC-005）。
**Independent Test**: 设「降薪 30% 持续 6 个月」→ 净资产曲线 diff 正确、应急金月数随之变化、`netWorthDelta = scenario − baseline`（I3）；同输入重算结果一致（可复现）；无历史结余 → `degraded` + missing 提示，不编造。

### Tests for User Story 1（先写测试、确保失败再实现）

- [X] T011 [P] [US1] 纯函数测试 `tests/finance/projection.engine.test.ts`：`projectBaseline` 可复现；`projectScenario` 每点 `netWorthDelta = scenarioNetWorth − baselineNetWorth`（I3）；monthOffset 连续 0..horizonMonths 无空洞（I4）；surplus ≤ 0 时基线持平/下行并标注；金额字符串/内部 cents；降薪 delta 在 durationMonths 内生效、之后恢复（research.md NC2 / SC-001）。先写、待 T013 实现后转绿。
- [X] T012 [P] [US1] 集成测试（门控 `FINANCE_INTEGRATION_TEST=1`）`tests/finance/scenario.service.test.ts` 骨架：建情景 → projections 按 (scenarioId, monthOffset) 落表且唯一；无历史结余 → `status='degraded'`。先写、待实现后转绿（SC-005）。

### Implementation for User Story 1

- [X] T013 [US1] 新增 `src/services/finance/projection.engine.ts`（**确定性纯函数引擎**，what-if 与退休 US3 共用）：
  - `buildSurplusProfile(monthlySurpluses: string[])` → 近 N 月平均结余（**与 Phase 6 目标预计达成同口径/同窗口**；空 → null 触发降级）。
  - `projectBaseline(snapshot: BaselineSnapshot, surplusProfile, horizonMonths)` → 逐月 `{netWorth, emergencyMonths}`（基线净资产 = 起点净资产 + 累计结余；应急金沿用 `(cash+savings)/月支出` 口径，与 `getPeriodMetrics` 一致）。
  - `projectScenario(baseline, assumptions: ScenarioAssumptions)` → 逐月叠加确定性 delta：`incomeDeltaPct`+`durationMonths`（区间内结余按比例调整）、`rateDeltaPct`（对房贷负债重算月供增量计入支出）、`lumpExpense`（指定月一次性扣除）→ 每点 `{baselineNetWorth, scenarioNetWorth, netWorthDelta, baselineEmergencyMonths, scenarioEmergencyMonths, goalImpact?}`。
  - **纯函数、cents 整数、`O(horizon)` 内存循环、零随机性、零 DB**（research.md NC2/NC8 / 复用 `money.ts`）。
- [X] T014 [US1] 新增 `src/services/finance/scenario.service.ts` 的 `computeScenario({userId, name, kind, assumptions, horizonMonths, familyId?})`：取数（`computeNetWorthAtDate` 快照 + `getPeriodMetrics` 历史结余 → `surplusProfile`；`familyId` 则按成员聚合复用 005）→ 调 `projectBaseline`+`projectScenario` → `baselineSnapshot` jsonb 溯源 → 无结余/无快照 → `degraded`+missing（NC6）→ **单事务**落 scenario + projections（按 scenarioId 整组删后重灌）→ 附 `engineVersion`/`assumptions`/`disclaimers`（FR-001/SC-001/SC-004 / 依赖 T013、T015）。
- [X] T015 [US1] 新增 `src/repositories/finance/scenario.repository.ts`：`createScenario`、`upsertProjections(scenarioId, points[])`（事务内 delete+insert）、`listByUser(userId)`、`findWithProjections(id, userId)`（依赖 T003、T004）。
- [X] T016 [P] [US1] 扩展 `src/app/api/finance/_lib/validation.ts`：`createScenarioSchema`(name 必填、kind 枚举、assumptions、horizonMonths 1..60)；`_lib/serialize.ts`：`toScenarioDto`、`toScenarioPointDto`（金额 string、日期 ISO）（contracts/api.md §1 / data-model.md §2.1-2.2）。
- [X] T017 [P] [US1] 新增 `src/app/api/finance/scenarios/route.ts`(POST 计算并保存 / GET 列表)、`scenarios/[id]/route.ts`(GET 详情含 projections)、`scenarios/[id]/interpret/route.ts`(POST LLM 解读：**仅消费该情景结构化结果**、零编造校验、LLM 不可用→`{text:""}` 200)。`requireUserId` + (familyId)`requireFamilyMembership` + Zod + 错误映射（200 DEGRADED、403 FORBIDDEN、422 VALIDATION、404）（contracts/api.md §1.1-1.4 / 依赖 T009）。
- [X] T018 [P] [US1] 扩展 `src/features/finance/api.ts`：`ScenarioDTO`/`ScenarioPointDTO` 类型 + `createScenario`/`listScenarios`/`getScenario`/`interpretScenario` 客户端方法；`hooks/use-finance.ts`：`useCreateScenario`/`useScenarios`/`useScenario`（TanStack Query，`onSuccess` 失效 `['finance','scenarios']`）。
- [X] T019 [US1] 新增 `src/features/finance/components/ScenarioSimulator.tsx`：参数表单（kind/assumptions/horizonMonths，react-hook-form + Zod）→ 提交 → 渲染净资产曲线（baseline vs scenario）+ 应急金月数变化 + 逐点 diff + `goalImpact`（**Phase 6 未落地时降级提示**）+ `disclaimers` 强渲染。沿用 frontend-dev 规范（MUI v7、sx 优先、react-i18next）。
- [X] T020 [US1] 集成测试（门控）`tests/finance/scenario.service.test.ts` 转绿：projections 落表且**可复现**（SC-001）；`netWorthDelta = scenario − baseline`（I3）；`degraded` 路径（SC-005）；`disclaimers` 非空（SC-004）（依赖 T013、T014、T015）。

**Checkpoint**：US1 MVP——what-if 可计算、可复现、可解释、与基线一致（SC-001/SC-004/SC-005）。`goalImpact` 在 Phase 6 落地前降级。

---

## Phase 4: User Story 2 - 个税规划（中国） (Priority: P2)

**Goal**: 按当期中国个税规则估算应纳税额，支持年终奖单独/合并计税对比，给出规则化节税方向；显著标注免责（FR-002/FR-006，SC-002/SC-004）。
**Independent Test**: 给定收入 + 扣除 + 年终奖 → separate/merged 应纳税额正确（与权威计算器一致，允许末位差），`diff`/`better` 正确（I5）；`disclaimers` 含「需以当期法规为准」（I6）；`ruleVintage` 与配置一致（I7）。

### Tests for User Story 2（先写测试、确保失败再实现）

- [X] T021 [P] [US2] 纯函数测试 `tests/finance/tax.engine.test.ts`：综合所得七级累进 + 速算扣除正确；年终奖 `separate` vs `merged` 差额（I5）；`effectiveRate`；`ruleVintage` 与 `taxRuleConfig` 一致（I7）；固定输入与权威计算器一致（允许末位差，SC-002）。先写、待 T023 实现后转绿（依赖 T010）。
- [X] T022 [P] [US2] 集成测试（门控）`tests/finance/tax.service.test.ts` 骨架：估算落表含 `ruleVintage`；收入缺失 → `degraded`。先写、待实现后转绿。

### Implementation for User Story 2

- [X] T023 [US2] 新增 `src/services/finance/tax.engine.ts`（**确定性纯函数引擎**）：`computeComprehensiveTax(taxableIncome, brackets)`（七级超额累进 + 速算扣除，brackets 来自 `taxRuleConfig`）、`computeBonusSeparate(bonus, brackets)`（÷12 定档）、`compareBonusMethods(comprehensive, bonus, brackets)` → `{separate:{taxAmount}, merged:{taxAmount}, diff, better}`（I5，`better` 取较小者，规则化非建议）、`computeEstimate(inputs, config)` → `{totalTaxAmount, effectiveRate, methodComparison, hints}`。纯函数、cents（research.md NC1 / 依赖 T010）。
- [X] T024 [US2] 新增 `src/services/finance/tax.service.ts` 的 `computeTaxEstimate({userId, taxYear, inputs, familyId?})`：按 `taxYear` 载入 `taxRuleConfig` → 调引擎 → 收入/扣除缺失 → `degraded`+missing（NC6）→ 落表（`engineVersion`/`ruleVintage`/`assumptions=inputs`/`disclaimers` 强制含「非税务建议；需以当期法规/专业人士为准」I6）→ 返回（FR-002/SC-002/SC-004 / 依赖 T023、T025）。
- [X] T025 [US2] 新增 `src/repositories/finance/tax-estimate.repository.ts`：`create`、`findLatestByUserAndYear(userId, taxYear)`（依赖 T005）。
- [X] T026 [P] [US2] 扩展 `_lib/validation.ts`：`taxEstimateSchema`(taxYear、inputs{annualIncome, insuranceAndFund, specialDeductions, annualBonus?})；`_lib/serialize.ts`：`toTaxEstimateDto`（contracts/api.md §2 / data-model.md §2.3）。
- [X] T027 [P] [US2] 新增 `src/app/api/finance/tax-estimates/route.ts`(POST 估算 / GET ?taxYear= 取最近)、`tax-estimates/[id]/interpret/route.ts`(POST LLM 解读计税方式差异与规则化节税方向、零编造)。`requireUserId` + (familyId)`requireFamilyMembership` + Zod + 错误映射（200 DEGRADED）（contracts/api.md §2.1-2.3 / 依赖 T009）。
- [X] T028 [P] [US2] 扩展 `features/finance/api.ts`：`TaxEstimateDTO` + `computeTaxEstimate`/`getLatestTaxEstimate`/`interpretTax`；`hooks/use-finance.ts`：`useComputeTax`/`useLatestTax`。
- [X] T029 [US2] 新增 `src/features/finance/components/TaxEstimator.tsx`：收入/五险一金/专项附加扣除/年终奖表单 → separate vs merged 对比卡片 + `diff` + 较优方向 + `hints` + `disclaimers` 强渲染（「非税务建议」）。
- [X] T030 [US2] 集成测试（门控）`tax.service.test.ts` 转绿：估算正确且可复现（SC-002）；`diff`/`better`（I5）；`disclaimers` 含法规提示（I6）；`ruleVintage`（I7）；`degraded`（SC-005）（依赖 T023、T024、T025）。

**Checkpoint**：个税估算正确、可解释、显著免责（SC-002/SC-004）。

---

## Phase 5: User Story 3 - 退休模拟 (Priority: P3)

> 依赖 US1 的 `projection.engine.ts`（T013）——退休长期投影复用同引擎（research.md NC3）。

**Goal**: 按储蓄/投资节奏 + 退休假设推演退休时资产与可持续性，**显著标注关键假设与不确定性**（三点区间），不呈现为确定预测（FR-003/FR-006，SC-003/SC-004）。
**Independent Test**: 给定假设 → 退休 corpus 三点（悲观 ≤ 中性 ≤ 乐观，I8）+ 可持续性判定；`disclaimers` 含不确定性提示（I9）；调整假设 → 结果刷新。

### Tests for User Story 3（先写测试、确保失败再实现）

- [X] T031 [P] [US3] 纯函数测试（追加 `tests/finance/projection.engine.test.ts`）：`projectRetirement` 三点单调（I8）；`depletionAge`（可持续→null）；`sustainableVerdict` 规则判定；长期 480 点（40 年×12）性能 < 50ms（NC8）。先写、待 T033 实现后转绿。
- [X] T032 [P] [US3] 集成测试（门控）`tests/finance/retirement.service.test.ts` 骨架：模拟落表含 `assumptions`；年龄/节奏缺失 → `degraded`。先写、待实现后转绿。

### Implementation for User Story 3

- [X] T033 [US3] 扩展 `src/services/finance/projection.engine.ts`（同文件，复用基线长期循环）：`projectRetirement(snapshot, assumptions: RetirementAssumptions, horizonMonths)` → `RetirementPoint{retirementCorpus, monthlySustainable, depletionAge}`（monthlyContribution + 实际回报复利 − 通胀 − 退休后支出；`withdrawalRatePct` 算月可支撑）；`scanSensitivity(...)` → 三点（`realReturnRatePct` ±2%：pessimistic/baseline/optimistic，确定性扫描非蒙特卡洛）；`verdictSustainability(...)` → `sustainable`/`marginal`/`insufficient`。纯函数、cents、内存（research.md NC3/NC8 / 依赖 T013）。
- [X] T034 [US3] 新增 `src/services/finance/retirement.service.ts` 的 `computeRetirement({userId, assumptions, familyId?})`：取数（快照 + `surplusProfile` 推 monthlyContribution）→ 调 `projectRetirement`+`scanSensitivity` → 年龄/节奏缺失 → `degraded`（NC6）→ 落表（`assumptions`/三点结果/`sustainableVerdict`/`engineVersion`/`disclaimers` 强制含不确定性 I9）→ 返回（FR-003/SC-003/SC-004 / 依赖 T033、T035）。
- [X] T035 [US3] 新增 `src/repositories/finance/retirement.repository.ts`：`create`、`findLatestByUser(userId)`（依赖 T006）。
- [X] T036 [P] [US3] 扩展 `_lib/validation.ts`：`retirementSchema`(assumptions{currentAge, retirementAge, monthlyContribution, realReturnRatePct, inflationPct, postRetirementMonthlySpend, withdrawalRatePct})；`_lib/serialize.ts`：`toRetirementDto`、`toRetirementPointDto`（contracts/api.md §3 / data-model.md §2.4）。
- [X] T037 [P] [US3] 新增 `src/app/api/finance/retirement/route.ts`(POST 模拟)、`retirement/latest/route.ts`(GET 最近)、`retirement/[id]/interpret/route.ts`(POST LLM 解读、零编造)。`requireUserId` + (familyId)`requireFamilyMembership` + Zod + 错误映射（200 DEGRADED）（contracts/api.md §3.1-3.3）。
- [X] T038 [P] [US3] 扩展 `features/finance/api.ts`：`RetirementDTO`/`RetirementPointDTO` + `computeRetirement`/`getLatestRetirement`/`interpretRetirement`；`hooks/use-finance.ts`：`useComputeRetirement`/`useLatestRetirement`。
- [X] T039 [US3] 新增 `src/features/finance/components/RetirementSimulator.tsx`：假设滑杆（年龄/回报率/通胀/支出/提取率）→ 三点区间图（悲观/中性/乐观 corpus）+ 可持续性判定 + `depletionAge` + **不确定性显著标注** + `disclaimers` 强渲染。
- [X] T040 [US3] 集成测试（门控）`retirement.service.test.ts` 转绿：三点单调（I8/SC-003）；`disclaimers` 含不确定性（I9）；可复现；`degraded`（SC-005）（依赖 T033、T034、T035）。

**Checkpoint**：退休模拟含不确定性标注，非确定预测（SC-003/SC-004）。

---

## Phase 6: User Story 4 - 投资组合优化方向 (Priority: P4)

**Goal**: 基于当前持仓识别资产类别配置偏离，给方向性建议（仅方向、非具体买卖指令），依据可追溯（FR-004/FR-006，SC-004）。
**Independent Test**: 给定持仓 + 目标 band → 识别偏低/偏高类别，`direction` 正确（I10）；hint **不含**具体品种/买卖数量（I11）；无持仓/总市值 0 → 空 `hints`（NC6）。

### Tests for User Story 4（先写测试、确保失败再实现）

- [X] T041 [P] [US4] 纯函数测试 `tests/finance/portfolio-hint.engine.test.ts`：按 assetClass 聚合占比；`direction` under/over/ok vs band（I10）；扩展不破坏既有 `computeConcentrationAlert`；总市值 0 → 空。先写、待 T043 实现后转绿（依赖 `money.ts`、rules-engine）。
- [X] T042 [P] [US4] 集成测试（门控）`tests/finance/portfolio-hint.service.test.ts` 骨架：hints 按 batchId 落表；无持仓 → 空。先写、待实现后转绿。

### Implementation for User Story 4

- [X] T043 [US4] 新增 `src/services/finance/portfolio-hint.engine.ts`（**确定性纯函数引擎**，扩展 `computeConcentrationAlert` 范式）：`aggregateByAssetClass(positions)` → 各类占比（复用 Phase 3 allocation 类别）、`computeHints(ratios, targetBands)` → `[{assetClass, currentRatio, targetBand, direction, reason}]`（threshold 可配，参数化 band）；**hint 仅方向、不含品种/数量**（I11）。纯函数、cents/比率（research.md NC4 / 依赖 T010）。
- [X] T044 [US4] 新增 `src/services/finance/portfolio-hint.service.ts` 的 `computeHintsForUser({userId, familyId?})`：取 positions（总市值 + assetClass，复用 Phase 3 `investment.service`/allocation）→ 载入 `targetBands` → 调引擎 → 无持仓/总市值 0 → 空 `hints`（NC6）→ 落表（新 batchId 整组覆盖）→ 附 `engineVersion`/`targetBandsVersion`/`disclaimers`「非投资建议」→ 返回（FR-004/SC-004 / 依赖 T043、T045）。
- [X] T045 [US4] 新增 `src/repositories/finance/portfolio-hint.repository.ts`：`replaceBatch(userId, hints[])`（新 batchId、整组覆盖）、`findLatestByUser(userId)`（依赖 T007）。
- [X] T046 [P] [US4] 扩展 `_lib/serialize.ts`：`toPortfolioHintsDto`、`toPortfolioHintDto`（GET-only，无需 body schema）（contracts/api.md §4 / data-model.md §2.5）。
- [X] T047 [P] [US4] 新增 `src/app/api/finance/portfolio-hints/route.ts`(GET 当前方向建议)、`portfolio-hints/interpret/route.ts`(POST LLM 解读、零编造)。`requireUserId` + (familyId)`requireFamilyMembership` + 错误映射（contracts/api.md §4.1-4.2）。
- [X] T048 [P] [US4] 扩展 `features/finance/api.ts`：`PortfolioHintsDTO`/`PortfolioHintDTO` + `getPortfolioHints`/`interpretPortfolioHints`；`hooks/use-finance.ts`：`usePortfolioHints`。
- [X] T049 [US4] 新增 `src/features/finance/components/PortfolioOptimization.tsx`：当前配置 vs 目标 band 雷达/条形 + 偏低/偏高方向卡 + `reason` + 「非投资建议」强渲染；无持仓 → 空态。
- [X] T050 [US4] 集成测试（门控）`portfolio-hint.service.test.ts` 转绿：`direction` 正确（I10）；无品种/数量（I11/FR-004）；可复现；无持仓空 `hints`（SC-005）（依赖 T043、T044、T045）。

**Checkpoint**：组合优化方向可追溯、仅方向、免责（FR-004/SC-004）。

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 端到端验收、质量门、红线核对、文档。

- [X] T051 [P] 类型与质量门：`pnpm type-check` + `pnpm check`（type-check + lint）全绿，无 `any` 残留（`.claude/rules/typescript.md`）。⚠️ **实现记录**：Phase 7 finance 全部新增/改动文件 type-check **零错误**（已逐文件核对）；但仓库 `pnpm type-check` 整体存在 **348 个既有错误**，全部位于与本特性无关的遗留模块（`src/features/mui-theme-creator/**`、`src/store/**`、`src/services/palette.service.ts`、`src/lib/github/**` 等模板代码），非本次引入，超出本特性范围。
- [X] T052 [P] 测试全绿：`pnpm test --run --silent='passed-only' 'finance'`（含 008 纯函数引擎 `projection.engine`/`tax.engine`/`portfolio-hint.engine` **始终运行** + 门控集成 `scenario`/`tax`/`retirement`/`portfolio-hint` service；Phase 0–6 既有测试无回归）。**纯函数测试不得依赖 `FINANCE_INTEGRATION_TEST`**。
- [X] T053 [P] SC 验收清单：按 `quickstart.md §6` 逐项核对 SC-001（what-if 可复现、与基线一致）/SC-002（个税与权威一致）/SC-003（退休标注不确定性）/SC-004（结论可追溯+免责）/SC-005（数据不足降级、不编造）。
- [X] T054 [P] 红线核对：所有数字来自确定性引擎；各 `/interpret` **零编造校验**（LLM 输出不得含引擎结果外金额）；四面板 `disclaimers` 强渲染；`userId` 仅来自会话 + 家庭视角经 `requireFamilyMembership`；易变规则（个税/band/退休默认）走版本化配置 + `ruleVintage`/`targetBandsVersion`，不硬编码（research.md NC1/NC3/NC4/NC5/NC7 / contracts/api.md §5）。
- [X] T055 [P] 文档：更新 `src/features/finance/README.md`（Phase 7 高级分析：4 引擎、双层架构、可信边界、免责标注、降级语义）与 `specs/008-advanced-analytics/` 交叉引用（quickstart.md §8）。

---

## Dependencies & Execution Order

### Phase 依赖
- Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3-6 (用户故事) → Phase 7 (Polish)。
- Phase 2 的 5 schema + 迁移（T003–T008）阻塞**所有**故事；`analysis-common`（T009）阻塞所有引擎的溯源/免责；版本化规则配置（T010）阻塞 US2（个税 config）/US4（band config）。

### User Story 依赖
- **US1（P1，MVP）/ US2（P2）/ US4（P4）**：Foundational 完成后**相互独立**，可并行（文件无交集：projection/scenario vs tax vs portfolio-hint）。
- **US3（P3）→ US1**：退休复用 US1 的 `projection.engine.ts`（T013），须在 US1 完成后进行（同文件 T033 扩展）。
- **跨阶段硬依赖**：US1 的 `goalImpact` 依赖 Phase 6（006 目标）——Phase 6 未实现前**降级**（不阻断 US1/US3 主体）；US2/US4 仅依赖 Phase 0–4（已就绪）。

### 各故事内部顺序
先写测试（fail）→ schema/repository → 纯函数引擎 → service（取数→引擎→落表）→ validation/serialize → API 路由（含 `/interpret`）→ 前端 DTO/hooks → 组件 → 集成测试（pass）。

### 并行机会
- Foundational：T004–T010 大多可并行（独立 schema 文件 / analysis-common / 三个 config）；T003 先行（T004 依赖 scenarios 表）；T008（barrel+迁移）串行收口（依赖 T003–T007）。
- US1/US2/US4 在 Foundational 后可三人并行（projection+scenario / tax / portfolio-hint，文件不冲突）。
- US1 内部：T016/T017/T018（validation+路由+DTO）并行；US2：T026/T027/T028 并行；US4：T046/T047/T048 并行。
- US3 须等 US1 引擎就绪后串行扩展 `projection.engine.ts`。

---

## Parallel Example: User Story 1

```bash
# 先串行写引擎内核（共享 projection.engine.ts / scenario.service.ts，避免冲突）
# T013 projection.engine（baseline + scenario）→ T014 scenario.service → T015 scenario.repository

# 随后并行外围（不同文件）
# T011 projection.engine.test.ts（纯函数，始终运行）
# T016 validation.ts（scenario schemas）+ serialize.ts（scenario DTOs）
# T017 scenarios/route.ts + [id]/route.ts + [id]/interpret/route.ts
# T018 features/api.ts（scenario DTO + 方法）
# 串行收尾：T018 hooks → T019 ScenarioSimulator → T020 集成测试（门控）
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
仅交付 US1（T001–T020）：what-if 情景模拟 + 确定性投影引擎（baseline/scenario diff）+ 可复现/可解释/免责/降级（SC-001/SC-004/SC-005）。`projection.engine.ts` 同时为 US3 退休奠基。`goalImpact` 在 Phase 6 落地前降级。复用 Phase 0–2 既有净资产/结余纯函数，无外部依赖，可独立验收——「如果……会怎样」价值验证的最小闭环。

### Incremental Delivery
- US2：个税估算（独立，仅依赖 Phase 0–4 + tax config）—— 可与 US1 并行交付。
- US3：退休模拟（复用 US1 引擎 + 不确定性三点区间）—— 在 US1 之后。
- US4：组合优化方向（扩展集中度，仅依赖 Phase 3 持仓 + band config）—— 可与 US1/US2 并行交付。

### Parallel Team Strategy
Foundational 由 1 人串行收口（schema/迁移不可并行冲突）；Foundational 完成后：US1/US2/US4 分三人并行（文件无交集），US3 等 US1 引擎就绪后接入；前端组件可与后端路由并行（先以契约 mock）。

---

## Notes

- **双层架构是脊柱**（research.md NC5）：确定性纯函数引擎产出一切数字 → 落表可追溯（`engineVersion`/`assumptions`/`disclaimers`，NC7）→ LLM `/interpret` 仅解读结构化结果并过**零编造校验**；前端始终渲染引擎数字，解读文本仅旁注。这是 SC-001/SC-004 的构造性保证。
- **易变口径走版本化配置**（research.md NC1/NC3/NC4）：个税税率表/扣除额（`taxRuleConfig` + `ruleVintage`）、组合目标区间（`targetBands` + `targetBandsVersion`）、退休默认假设（`retirement-defaults`）均为**配置文件占位**，具体数值留待临近实施按当时法规/真实数据回填——与 spec「锁定做什么/可信边界，不预固化易变口径」一致。
- **数据不足即降级，不编造**（research.md NC6）：每引擎显式 `degraded` + `missing[]`，HTTP 200（非错误，contracts §0.2 DEGRADED）—— SC-005。
- **口径一致性**：what-if/退休的结余画像、应急金口径**复用** `getPeriodMetrics`/`computeNetWorthAtDate`，与 Phase 1 规则引擎、Phase 6 目标达成同口径——这是「与基线一致、可复现」（SC-001）的根基。
- ⚠️ **Phase 6 未实现风险**：US1 `goalImpact` 复用 Phase 6 目标投影；Phase 6 落地前必须降级（返回 null + missing），不得编造。US2/US4 不受影响。
- ⚠️ **关键风险任务**：T013（投影引擎：基线/情景 diff 的可复现性与口径一致性，US1+US3 共用）、T023（个税引擎：与权威计算器一致，SC-002）、T033（退休三点扫描：单调性 I8 + 长期性能 NC8）—— 务必配纯函数单测（T011/T021/T031），确定性、可复现。
- ⚠️ **setup 脚本注意**：`setup-tasks.sh`/`setup-plan.sh` 按当前分支/`feature.json` 解析 feature（本仓库各 Phase 同居 `001-double-entry-ledger` 分支，且 `feature.json` 指针会被外部改动），会误指向他处；本 tasks.md 已按正确目录 `specs/008-advanced-analytics/` 生成（用 `SPECIFY_FEATURE_DIRECTORY` 覆盖）。
