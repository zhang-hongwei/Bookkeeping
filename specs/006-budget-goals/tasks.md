---
description: "Task list for feature implementation"
---

# Tasks: 预算与目标 (Phase 5)

**Input**: Design documents from `/specs/006-budget-goals/`
**Prerequisites**: plan.md（必需）、spec.md（必需，用户故事）、research.md、data-model.md、contracts/、quickstart.md（均已就绪）

**Tests**: 本特性**包含测试**。原因：spec 的 SC-001..SC-005 均为可测不变式（预算已用与账目一致、超事事中预警、ETA 可复现+负结余正确、数值 100% 来自规则可追溯、跨月重置无串扰），data-model.md §7 列出 I1–I8 不变量，quickstart.md §7 明确测试文件，CLAUDE.md 强制测试文化。沿用仓库既有两层模式（见 `tests/finance/_helpers.ts` 与 005-family-finance/tasks.md）：**纯函数测试始终运行**（无 DB），**集成测试由 `FINANCE_INTEGRATION_TEST=1` 门控**（需真实 Postgres 测试库 + `scripts/init-finance.mjs`）。每个故事「先写测试、确保失败再实现」。

**Organization**: 任务按用户故事分组（US1 P1 / US2 P2 / US3 P3）。Phase 1 Setup → Phase 2 Foundational（阻塞所有故事的 3 张表 + 迁移 + repository + 纯计算函数）→ Phase 3-5 各用户故事 → Phase 6 Polish。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、不依赖未完成任务）
- **[Story]**: 归属用户故事（US1/US2/US3）；Setup/Foundational/Polish 阶段**无** story 标签
- 描述内必须含**精确文件路径**，并附依赖 `（依赖 Tx）` 与文档引用 `（data-model.md §N / research.md 决策N / contracts/api.md §N / quickstart.md §N）`

## Path Conventions

- Schema: `src/database/schema/finance/`（barrel `index.ts`，关系集中在 `relations.ts`）
- Repository: `src/repositories/finance/`（**继承 `FinanceRepository`** 单 userId 绑定 + `xxxRepository(userId)` 工厂，与 Phase 0–3 个人表一致）
- Service: `src/services/finance/`
- API: `src/app/api/finance/`（共享 `_lib/{auth,validation,serialize}.ts`）
- 前端: `src/features/finance/`（扩展既有 `api.ts` DTO + `hooks/use-finance.ts` TanStack Query + `components/`，与 Phase 0–4 UI 同位）
- 测试: `tests/finance/`
- **领域铁律**（沿用全域）：金额一律字符串、内部「分」整数（`toCents`/`fromCents`/`addCents`，`src/services/finance/money.ts`），**禁止浮点**；用户表 `user_id` 为纯文本无 FK；预算已用仅计 `type='expense'`（transfer/repayment/revaluation/disposal 排除）。
- **单一事实源**（research.md 决策9 / data-model.md I1）：预算「已用」、目标「当前金额」、ETA **全部派生**自 transactions/accounts/净资产，**无物化 live 列**——SC-001 由构造保证。

> ⚠️ **关键复用点**（避免重复造轮子）：`requireUserId`（`_lib/auth.ts`）；`money.ts`（`toCents`/`fromCents`/`addCents`）；净资产 `computeNetWorthLive(userId)` / `deriveViewNetWorth(nw,'high'|'all')`（`net-worth.service.ts`）；结余口径参照 rules-engine 的 `sumAmountByType`（`type∈{income,expense}`、按 `occurredAt` 月份、transfers 排除）；错误类 `LedgerInvariantError`（`balance.service.ts`）为业务不变量错误范本；既有 `finance_categories.parentId` 提供父子分类树。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 确认前置阶段就绪、补齐环境变量（本特性为增量，无脚手架、无新依赖）。

- [ ] T001 ⚠️ **硬前置**：确认 Phase 0–4 已实现并达标——`src/database/schema/finance/`（accounts/transactions+entries/categories/net-worth-snapshots 等）、`src/services/finance/{ledger,balance,net-worth,rules-engine}.service.ts`、纯函数 `computeNetWorthLive`/`deriveViewNetWorth`、`money.ts`、`requireUserId` 均存在。运行 `pnpm test --run --silent='passed-only' 'finance'` 确认 Phase 0–4 测试全绿（quickstart.md §1）。**未达标则本特性无法交付**。
- [ ] T002 [P] 环境变量：在 `.env.local` 确认/补齐 `DATABASE_URL`、`DATABASE_TEST_URL`（集成测试库）、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`。Phase 5 **无新增必需变量**（quickstart.md §1–§2）。

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 所有用户故事共享的 schema + 迁移 + repository + 纯计算函数，必须先完成。
**⚠️ CRITICAL**：未完成本阶段前不得开始任何用户故事。

- [ ] T003 新增 `src/database/schema/finance/budgets.ts`：`finance_budgets`（id uuid PK defaultRandom、userId text 无 FK、categoryId uuid **可空**(NULL=总支出预算)、name text 可空、amount decimal18,2 >0、periodType varchar8 $type<BudgetPeriodType> default month、alertThreshold decimal3,2 default 0.80、rollover boolean default false(预留)、active boolean default true、时间戳）+ `finance_budget_periods`（id uuid PK、budgetId uuid FK→budgets cascade、userId text、periodStart date、periodEnd date、amountSnapshot decimal18,2、spentSnapshot decimal18,2 default 0、status varchar12 $type<BudgetStatus>、closedAt、时间戳）。索引：budgets `(userId,active)`、`unique(userId,categoryId,periodType)`；periods `unique(budgetId,periodStart)`、`(userId,periodStart,periodEnd)`。导出枚举 `BUDGET_PERIOD_TYPES`/`BUDGET_STATUSES` + 类型、`insert/select` schema、`BudgetItem`/`NewBudget`/`BudgetPeriodItem`/`NewBudgetPeriod`（data-model.md §2.1/§2.2 / research.md 决策1/11）。**不用 pgEnum**（沿用全域 varchar+$type）。
- [ ] T004 [P] 新增 `src/database/schema/finance/goals.ts`：`finance_goals`（id uuid PK defaultRandom、userId text 无 FK、name text、targetAmount decimal18,2 >0、targetDate date **可空**、progressBasis varchar12 $type<GoalProgressBasis> default manual、linkedAccountIds jsonb string[] default []、manualAmount decimal18,2 default 0、notes text 可空、status varchar12 $type<GoalStatus> default active、completedAt 可空、时间戳）。索引：`(userId,status)`。导出枚举 `GOAL_PROGRESS_BASES`/`GOAL_STATUSES` + 类型、schema、`GoalItem`/`NewGoal`（data-model.md §2.3 / research.md 决策4）。
- [ ] T005 扩展 `src/database/schema/finance/relations.ts`（budgets→category 逻辑 one、budgets↔periods many/one、goals 占位）与 `index.ts`（barrel 导出 budgets + goals），运行 `pnpm db:generate` + `pnpm db:migrate`（依赖 T003、T004）。迁移为纯增量、可逆、**不改既有表**（data-model.md §8）。
- [ ] T006 [P] 新增 `src/repositories/finance/budget.repository.ts`（**继承 `FinanceRepository`**，`budgetRepository(userId)` 工厂）：`create`/`findById`/`listByUser({active,period?})`/`update`/`delete`、`findByUserCategoryPeriod(userId, categoryId, periodType)`（建预算前查重，防重复，INVARIANT）、periods 的 `upsertSnapshot`/`findRange(budgetId,from,to)`/`findLatest`（依赖 T003）。
- [ ] T007 [P] 新增 `src/repositories/finance/goal.repository.ts`（继承 `FinanceRepository`，`goalRepository(userId)` 工厂）：`create`/`findById`/`listByUser({status})`/`update`/`delete`（依赖 T004）。
- [ ] T008 [P] 新增纯计算函数 `src/services/finance/budget.service.ts`（**纯函数、无 DB**，可单测）：`computePeriodRange(periodType, refDate)`→`{start,end}`（month/week/year 边界，D1）、`buildCategorySubtreeMap(categories[])`→`Map<catId,Set<descId>>`（D2）、`sumExpensesInSubtree(expenseTxns, subtreeSet)`→cents（**零双计 I8、仅 expense I7、cents I2**）、`computeBudgetAlert(budget, period, spentCents)`→`BudgetAlert{ratio,status(normal/warning/overrun),riskLevel,verdict}`（阈值 alertThreshold/1.0，D3/D10）（data-model.md §6 I2/I7/I8 / research.md 决策1/2/3/10 / 依赖 `money.ts`）。
- [ ] T009 [P] 新增纯计算函数 `src/services/finance/goal.service.ts`（**纯函数、无 DB**）：`computeGoalCurrent(goal, {netWorth?, linkedAccounts?})`→cents（按 progressBasis: manual→manualAmount / linked→ΣlinkedAccountIds 余额 / net_worth→netWorth，D4）、`computeGoalProgress(goal, currentCents, surplusSeries, {windowMonths})`→`{progressRate,completed,eta:{etaDate,etaStatus(on_track/at_risk/unreachable/completed),monthsToGoal,avgMonthlySurplus}}`（**avgSurplus≤0→unreachable 且 etaDate=null I5/SC-003**；无 targetDate→etaDate=null 仅显进度 D5；monthsToGoal=ceil(remaining/avgSurplus)）（data-model.md §6 I4/I5 / research.md 决策4/5 / 依赖 `money.ts`）。
- [ ] T010 [P] 新增 DB 取数 `getMonthlySurplusSeries(userId, months)` 于 `goal.service.ts`：按 `sumAmountByType` 同口径（`type∈{income,expense}`、按 `occurredAt` 月份分组、transfers 排除、cents 求差）返回近 N 月 `{month,income,expense,surplus}[]`（D5/D6 / research.md 决策5/6 / 依赖 `transaction.repository`/`money.ts`）。

**Checkpoint**：3 张新表已迁移（不改既有表）；budget/goal repository 就绪；budget/goal 纯计算函数可单测（I2/I4/I5/I7/I8）。Phase 3 业务可开始。

---

## Phase 3: User Story 1 - 给每类开销设个预算，超支立刻知道 (Priority: P1) 🎯 MVP

**Goal**: 按分类（含父子子树）设周期预算（默认月度，支持周/年），实时计算已用/剩余/状态，达阈值或超支时预警；跨周期自动重置、历史可回溯、改额度不污染历史（FR-001/002/003/004/007/008/009，SC-001/002/004/005）。
**Independent Test**: 给「餐饮」设月预算 ¥2,000，记若干餐饮支出 → 已用/剩余实时正确（与账目一致）；累计达 ¥2,000 → 超支提示（事中）；子类「外卖」支出计入父类「餐饮」预算；跨月自动重置；中途改额度，历史周期额度不变。

### Tests for User Story 1（先写测试、确保失败再实现）

- [ ] T011 [P] [US1] 纯函数测试 `tests/finance/budget.service.test.ts`：`computePeriodRange`(month/week/year 边界正确)、`buildCategorySubtreeMap`(父+全部后代)、`sumExpensesInSubtree`(子树内一笔交易计一次 I8、仅 type=expense I7、cents 无浮点 I2)、`computeBudgetAlert`(ratio<阈值→normal、≥阈值→warning、≥1→overrun；verdict/riskLevel 正确)（依赖 T008）。
- [ ] T012 [P] [US1] 集成测试（门控 `FINANCE_INTEGRATION_TEST=1`）`tests/finance/budget.service.test.ts` 骨架：建预算→记支出→已用实时正确（I1/SC-001）；达额度→overrun 触发（SC-002）；子类支出计入父类预算（FR-004/I8）；transfer 支出不计入（I7）。先写、待实现后转绿。

### Implementation for User Story 1

- [ ] T013 [US1] `budget.service.ts` DB 编排：`getBudgetStatus(budget, refDate)`（取用户分类→`buildCategorySubtreeMap`→取周期内 expense 交易→`sumExpensesInSubtree`→`computeBudgetAlert`，产出 spent/remaining/ratio/status/riskLevel/verdict）、`listBudgetsWithStatus(userId, refDate, {active})`、`listBudgetAlerts(userId, refDate, {status?})`（contracts/api.md §1.2/§2.2 / 依赖 T006、T008）。
- [ ] T014 [US1] `budget.service.ts` 写操作：`createBudget`（**建前查重** `findByUserCategoryPeriod`，重复→`LedgerInvariantError` INVARIANT；categoryId 可空=总支出；应用层防重复总支出预算）、`updateBudget`（**categoryId 不可改** C6；amount 变更仅影响当前+未来周期）、`deactivate`/`deleteBudget`（contracts/api.md §1.1/§1.4/§1.5 / 依赖 T006）。
- [ ] T015 [US1] `budget.service.ts` 历史快照：`closePeriod`(upsert `finance_budget_periods`，写 amountSnapshot+spentSnapshot+status，**写入后不可变 I3**)、`listPeriodHistory(budgetId, from, to)`、`backfillPeriodHistory`（缺失周期按需从 transactions 复算 + 当时 amountSnapshot 回填，沿用 Phase 1 `backfillHistory` 思路）（data-model.md §2.2 / research.md 决策11 / contracts/api.md §2.1 / 依赖 T006）。
- [ ] T016 [US1] 改 `src/services/finance/ledger.service.ts` 写后钩子（D9）：创建/更新交易后 **best-effort** 计算 `categoryId`（及其祖先链）命中的预算当前 `BudgetAlert[]`，**非阻塞**附在响应 `{transaction, budgetAlerts?}`（try/catch，预算计算失败不回滚交易，不污染核心账目写入）（research.md 决策9 / contracts/api.md §4.1 / 依赖 T008、T013）。
- [ ] T017 [P] [US1] 扩展 `src/app/api/finance/_lib/validation.ts`：`createBudgetSchema`(amount>0、periodType enum、alertThreshold?、categoryId? nullable)、`updateBudgetSchema`(**omit categoryId**，.partial())、`budgetQuerySchema`(active?、period?)、`alertsQuerySchema`(period?、status?)、`periodRangeSchema`(from/to)（contracts/api.md §1/§2）。
- [ ] T018 [P] [US1] 扩展 `src/app/api/finance/_lib/serialize.ts`：`toBudgetDto`(含派生 period/spent/remaining/ratio/status/riskLevel/verdict)、`toBudgetAlertDto`、`toBudgetPeriodDto`，金额 string、日期 ISO（contracts/api.md §0.3）。
- [ ] T019 [P] [US1] 新增 `src/app/api/finance/budgets/route.ts`(POST 建 / GET 列表含当前状态) 与 `src/app/api/finance/budgets/alerts/route.ts`(GET 当前周期预警汇总)；`requireUserId` + Zod + → service + 错误映射（422 VALIDATION/INVARIANT、404）（contracts/api.md §1.1/§1.2/§2.2 / 依赖 T013、T014、T017、T018）。
- [ ] T020 [P] [US1] 新增 `src/app/api/finance/budgets/[id]/route.ts`(GET 详情 / PATCH / DELETE) 与 `src/app/api/finance/budgets/[id]/periods/route.ts`(GET 历史周期)；归属校验（非本人→404 C7）（contracts/api.md §1.3-1.5/§2.1 / 依赖 T013、T014、T015、T017、T018）。
- [ ] T021 [P] [US1] 改 `src/app/api/finance/transactions/route.ts` 与 `transactions/[id]/route.ts`：响应**可选**附 `budgetAlerts`（D9 写后回带，无则省略字段）（contracts/api.md §4.1 / 依赖 T016）。
- [ ] T022 [P] [US1] 扩展 `src/features/finance/api.ts`：`BudgetDTO`/`BudgetAlertDTO`/`BudgetPeriodDTO` 类型 + `listBudgets`/`createBudget`/`getBudget`/`updateBudget`/`deleteBudget`/`listBudgetAlerts`/`listBudgetPeriods` 客户端方法（contracts/api.md §0.3）。
- [ ] T023 [US1] 扩展 `src/features/finance/hooks/use-finance.ts`：`useBudgets`/`useCreateBudget`/`useUpdateBudget`/`useDeleteBudget`/`useBudgetAlerts`（TanStack Query，`onSuccess` 失效 `['finance','budgets']`/`['finance','budget-alerts']`）。
- [ ] T024 [US1] 新增 `src/features/finance/components/`：`BudgetForm.tsx`(设预算：分类+额度+周期+阈值)、`BudgetProgressRing.tsx`(已用/剩余/状态环)、`BudgetAlertsBanner.tsx`(即将超支/已超支提示，消费 `useBudgetAlerts`)、`BudgetHistoryChart.tsx`(历史周期)；接入个人仪表盘概览。沿用 frontend-dev 规范（MUI v7、sx 优先、react-i18next zh-CN）。
- [ ] T025 [US1] 集成测试（门控）全量验收 `tests/finance/budget.service.test.ts`：已用实时与账目一致（I1/SC-001）；超支事中触发（SC-002）；子类计入父类且单预算零双计（FR-004/I8）；transfer 不计入（I7）；改额度后历史周期 `amountSnapshot` 不变（I3/SC-005）（依赖 T013–T016）。

**Checkpoint**: 分类预算 CRUD + 实时已用/剩余 + 阈值/超支预警 + 写后回带 + 跨月重置 + 历史不可变。MVP（SC-001/002/005）可独立验收。

---

## Phase 4: User Story 2 - 设定财务目标，看到离目标还有多远 (Priority: P2)

**Goal**: 设定储蓄目标（金额 + 可选截止日），按显式口径（手动/关联账户/总净资产）显示当前金额与进度率，按近 N 月平均结余估算预计达成时间；负/零结余明确「无法达成」、无截止日仅显进度（FR-005/006/007/008，SC-003/004）。
**Independent Test**: 建 linked 目标 → 进度率正确；近 N 月均结余 → ETA 月数可复现；结余≤0 → unreachable；无截止日 → 仅进度无 ETA；net_worth/manual 口径各正确。

### Tests for User Story 2（先写测试、确保失败再实现）

- [ ] T026 [P] [US2] 纯函数测试 `tests/finance/goal.service.test.ts`：`computeGoalCurrent`(manual/linked/net_worth 三口径)、`computeGoalProgress`(on_track/at_risk/unreachable/completed；monthsToGoal=ceil(remaining/avgSurplus)；无 targetDate→etaDate=null；avgSurplus≤0→unreachable 且 etaDate=null **I5/SC-003**；avgSurplus>0→on_track，ETA>targetDate→at_risk；progressRate≥1→completed)（依赖 T009）。
- [ ] T027 [P] [US2] 集成测试（门控）`tests/finance/goal.service.test.ts` 骨架：建 linked 目标（Σ 账号余额）、net_worth 口径（复用 `computeNetWorthLive`）、`getMonthlySurplusSeries`（transfers 排除）、ETA 由纯函数复现（SC-003）。先写、待实现后转绿。

### Implementation for User Story 2

- [ ] T028 [US2] `goal.service.ts` 编排：`createGoal`(basis=linked→`linkedAccountIds` 非空且账号属当前用户否则 INVARIANT；net_worth 忽略 linked；manual)、`updateGoal`(manual 基准可改 `manualAmount`；改 basis/linked 后重算)、`getGoalWithProgress(goalId,{windowMonths})`(取数→`computeGoalCurrent`+`getMonthlySurplusSeries`+`computeGoalProgress`)、`listGoalsWithProgress`（contracts/api.md §3 / 依赖 T007、T009、T010）。
- [ ] T029 [US2] `goal.service.ts` 完成事件：在 `getGoalWithProgress`/`updateGoal` 中检测**首次** progressRate≥100% → 写 `completedAt`（事件标记）；`completed` 始终为派生标志（C4），不改 `status`（data-model.md §2.3/§5.3 / research.md 决策4）。
- [ ] T030 [P] [US2] 扩展 `_lib/validation.ts`：`createGoalSchema`(targetAmount>0、progressBasis enum、targetDate? nullable、linkedAccountIds?)、`updateGoalSchema`(.partial())、`progressQuerySchema`(windowMonths? 默认3)；`_lib/serialize.ts`：`toGoalDto`(含派生 currentAmount/progressRate/completed/eta)、`toGoalProgressDto`(surplusSeries+eta)（contracts/api.md §3 / §3.6）。
- [ ] T031 [P] [US2] 新增 `src/app/api/finance/goals/route.ts`(POST/GET) 与 `src/app/api/finance/goals/[id]/route.ts`(GET/PATCH/DELETE) 与 `src/app/api/finance/goals/[id]/progress/route.ts`(GET 进度+ETA+surplusSeries，可解释可追溯)；归属校验→404（C7）（contracts/api.md §3.1-3.6 / 依赖 T028、T030）。
- [ ] T032 [P] [US2] 扩展 `features/finance/api.ts`：`GoalDTO`/`GoalProgressDTO` 类型 + `listGoals`/`createGoal`/`getGoal`/`updateGoal`/`deleteGoal`/`getGoalProgress` 客户端方法（contracts/api.md §0.3/§3.6）。
- [ ] T033 [US2] 扩展 `hooks/use-finance.ts`：`useGoals`/`useCreateGoal`/`useUpdateGoal`/`useDeleteGoal`/`useGoalProgress`（失效 `['finance','goals']`）。
- [ ] T034 [US2] 新增 `src/features/finance/components/`：`GoalForm.tsx`(名称/金额/截止日/口径/关联账号)、`GoalCard.tsx`(进度环 + ETA + unreachable 状态文案)、`GoalProgressDetail.tsx`(surplusSeries 明细，让 ETA 可解释可追溯 US3)；仪表盘集成；react-i18next zh-CN。
- [ ] T035 [US2] 集成测试（门控）全量验收 `tests/finance/goal.service.test.ts`：三口径正确（D4）；ETA 可复现（SC-003）；结余≤0→unreachable 无假日期（I5）；无截止日→无 ETA（D5）；首次达标→completedAt（C4）（依赖 T028、T029）。

**Checkpoint**: 储蓄目标 CRUD + 三口径进度 + ETA（可复现、负结余正确、开放式不估 ETA）。

---

## Phase 5: User Story 3 - 预算超支与目标进度由规则驱动，可信赖 (Priority: P3)

**Goal**: 预算超支预警与目标进度/ETA 为**确定性规则结论**（纯函数对账目数据计算），作为结构化事实喂给 AI 月报；每个数值可逐项追溯；LLM 仅做个性化表达、不编造金额（FR-008，SC-004）。
**Independent Test**: 触发超支预警 → 已用/超支额 100% 来自账目+规则、可追溯；目标 ETA 基于明确算法可复现；AI「如何改善」建议引用规则结论、不自行编造数字。
**依赖**：US1（BudgetAlert）与 US2（GoalProgress）已实现。

### Tests for User Story 3（先写测试、确保失败再实现）

- [ ] T036 [P] [US3] 确定性/可追溯测试 `tests/finance/budget.service.test.ts` + `goal.service.test.ts` 补充：相同输入→`BudgetAlert`/`GoalProgress` 输出恒定（可复现 SC-003/SC-004）；`BudgetAlert.spent` == 该周期子树 expense 交易之和（可逐项追溯）；`GoalProgress.eta` == `computeGoalProgress` 输出（不依赖 LLM）。先写、待实现后转绿。

### Implementation for User Story 3

- [ ] T037 [US3] 规则层事实装配：在 `src/services/finance/rules-engine.service.ts`（或报告输入构建处）新增 `collectBudgetGoalFacts(userId, period, {windowMonths})`——复用 `listBudgetAlerts`（T013）+ `listGoalsWithProgress`（T028）产出**结构化事实**（FindingData 同构），作为 AI 月报输入；**禁止 LLM 重新计算金额**（FR-008/SC-004 / research.md 决策3 / US3 验收1-2 / 依赖 T013、T028）。
- [ ] T038 [US3] 可追溯性：确认超支预警背后的账目明细（该周期命中预算子树的 expense 交易列表）与 ETA 背后的 surplusSeries，分别经 `GET budgets/[id]?period=`（T020）与 `GET goals/[id]/progress`（T031）可查——每个数值可审计（US3 验收1-2 / SC-004）。
- [ ] T039 [US3] AI 月报护栏：在报告 prompt/输入层把预算+目标事实作为结构化上下文传入，并约束 LLM **仅引用所给数值、不得编造金额**（系统提示 + 事实注入）；校验「如何改善」建议基于规则结论（US3 验收3 / SC-004）。
- [ ] T040 [US3] 集成/契约测试（门控）：超支预警数值 == 账目汇总（可追溯）；ETA == `computeGoalProgress`（可复现）；AI 报告输入含结构化事实、prompt 含禁造数约束（依赖 T037–T039）。

**Checkpoint**: 预算/目标数值 100% 来自规则、可追溯、可复现；LLM 仅表达不编造（SC-004）。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 端到端验收、质量门、错误处理与隔离核对、i18n 与文档。

- [ ] T041 [P] 类型与质量门：`pnpm type-check` + `pnpm check`（type-check + lint）全绿，无 `any` 残留（`.claude/rules/typescript.md`）。仅计本特性新增文件零新增错误（基线已有 ~340 遗留错误，与本特性无关）。
- [ ] T042 [P] 测试全绿：`pnpm test --run --silent='passed-only' 'finance'`（含 006 纯函数 `budget.service`/`goal.service` 始终运行 + 门控集成；Phase 0–4 既有测试无回归）。纯函数测试**不得**依赖 `FINANCE_INTEGRATION_TEST`。
- [ ] T043 [P] SC 验收清单：按 `quickstart.md §5-§7` 逐项核对 SC-001（已用实时一致）/SC-002（超事事中预警）/SC-003（ETA 可复现 + 负结余 unreachable）/SC-004（数值 100% 来自规则、可追溯、LLM 不编造）/SC-005（跨月重置 + 历史无串扰）。
- [ ] T044 [P] 错误处理与隔离核对：所有预算/目标路由 `requireUserId`；跨用户访问→404（不泄漏存在性 C7）；重复建预算/linked 账号不属用户→422 INVARIANT；金额字符串/内部 cents；`ledger.service` 写后回带 best-effort 非阻塞（contracts/api.md §0/§5 / research.md 决策9）。
- [ ] T045 [P] i18n 与文档：预算/目标文案接入 react-i18next（zh-CN）；更新 `src/features/finance/README.md`（预算/目标说明：单一事实源、子树汇总、三口径、ETA 算法、历史不可变）与 `specs/006-budget-goals/` 交叉引用（quickstart.md §8）。
- [ ] T046 [P] 端到端验证：按 `quickstart.md §5`（预算超支闭环 US1）与 `§6`（目标进度+ETA US2）curl 走通；`§7` 测试命令全绿。

---

## Dependencies & Execution Order

### Phase 依赖
- Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3-5 (用户故事) → Phase 6 (Polish)。
- Phase 2 的 schema/迁移（T003–T005）阻塞**所有**故事；budget 纯函数（T008）阻塞 US1 聚合；goal 纯函数（T009）+ surplus 序列（T010）阻塞 US2 ETA。

### User Story 依赖
- **US1 → US2 → US3**（建议顺序）：
  - US1 建预算模型 + 实时已用 + BudgetAlert（地基，复用既有记账与净资产纯函数，无外部依赖，可独立验收 = MVP）。
  - US2 目标进度复用 `computeNetWorthLive`/账号余额；ETA 复用结余口径（`getMonthlySurplusSeries` T010）；与 US1 无文件冲突，US1 完成后可并行。
  - US3 消费 US1 的 `BudgetAlert`（T013）与 US2 的 `GoalProgress`（T028），**必须**在两者之后。
- US1 与 US2 文件几乎不交叠（budget.* vs goal.*），US1 完成后 US2 可由另一人并行；US3 必须串行收尾（依赖前两者产出）。

### 各故事内部顺序
先写测试（fail）→ schema/repo（Foundational 已备）→ 纯函数（Foundational 已备）→ service 编排 → validation/serialize → API 路由 → 前端 DTO/hooks → 组件 → 集成测试（pass）。

### 并行机会
- Foundational：T004（goals schema）、T006/T007（budget/goal repo）、T008/T009/T010（纯函数/取数）可并行（T003 先行，T005 迁移依赖 T003+T004 收口）。
- US1：T017/T018/T019/T020/T021/T022（validation/serialize/路由/DTO 并行，避开共享 `budget.service.ts` 串行的 T013→T014→T015→T016）。
- US2：T030/T031/T032（validation/路由/DTO 并行）。
- US1 与 US2 在 Foundational 完成后、由两人分别推进（文件域分离）。

---

## Parallel Example: User Story 1

```bash
# 先串行写 service 内核（共享 budget.service.ts，避免冲突）
# T013 getBudgetStatus/listBudgets/listBudgetAlerts
# T014 createBudget/updateBudget/deleteBudget
# T015 closePeriod/listPeriodHistory/backfill
# T016 ledger.service 写后回带钩子（D9）

# 随后并行外围（不同文件）
# T011 budget.service.test.ts（纯函数，始终运行）
# T017 validation.ts（budget schemas）
# T018 serialize.ts（budget/alert/period DTOs）
# T019 budgets/route.ts + budgets/alerts/route.ts
# T020 budgets/[id]/route.ts + budgets/[id]/periods/route.ts
# T021 transactions/route.ts 响应附 budgetAlerts
# T022 features/api.ts（budget DTO + 方法）
# 串行收尾：T023 hooks → T024 组件 → T025 集成测试（门控）
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
仅交付 US1（T001–T025）：分类预算 CRUD + 实时已用/剩余 + 阈值/超支预警（含写后回带）+ 跨月重置 + 历史不可变（SC-001/002/005）。复用 Phase 0/1 既有记账与金额工具，零既有表改动、无外部依赖，可独立验收。这是「主动控制支出」价值验证的最小闭环。

### Incremental Delivery
- US2：储蓄目标 + 进度（三口径）+ ETA（可复现、负结余正确）—— 复用净资产/账号余额与结余口径，增量加 goals 域。
- US3：规则驱动信任 —— 把 US1/US2 的确定性结论接入 AI 月报事实层，兑现「规则负责准确、LLM 负责表达」（设计 P5 双层架构）。

### Parallel Team Strategy
Foundational 由 1 人串行收口（schema/迁移不可并行冲突）；US1 由 1 人串行（service 内核共享文件）；Foundational 完成后 US1 与 US2 可分两人并行（文件域分离 budget.* vs goal.*）；US3 须等 US1+US2 完成后串行收尾；前端组件可与后端路由并行（先以契约 mock）。

---

## Notes

- **单一事实源是根基**（research.md 决策9 / data-model.md I1）：预算已用、目标当前金额、ETA **均派生**自 transactions/accounts/净资产，无物化 live 列——SC-001（不一致=0）由构造保证，无同步漂移面。
- **子树汇总 + 单预算零双计**（research.md 决策2 / I8）：预算按分类子树 rollup；一笔交易对一个预算至多计一次；父类与子类预算各自追踪、重叠为正确。
- **确定性结论**（research.md 决策3/5 / I4/I5）：BudgetAlert 与 ETA 为纯函数，可复现可追溯；avgSurplus≤0→unreachable 无假日期（SC-003）；LLM 仅表达不编造（SC-004）。
- **历史不可变**（research.md 决策11 / I3）：`finance_budget_periods.amountSnapshot` 锁定；改预算额度不回溯历史（SC-005）。
- **写后回带非阻塞**（research.md 决策9）：`ledger.service` 写交易后 best-effort 附 `budgetAlerts`，失败不回滚账目。
- ⚠️ **关键风险任务**：T013（预算实时聚合：子树构建 + 周期窗口 + 零双计，SC-001/FR-004 交汇点）、T016（写后回带：避免阻塞核心记账事务）、T009 的 ETA（unreachable 边界 SC-003）为本特性最易出错处，务必配门控集成测试（T012/T025/T027/T035）。
- ⚠️ **setup 脚本注意**：`setup-tasks.sh`/`setup-plan.sh` 按当前分支/`feature.json` 解析 feature（本仓库各 Phase 同居 `001-double-entry-ledger` 分支、`feature.json` 可能指向其他 Phase），会误指向他处；本 tasks.md 已用 `SPECIFY_FEATURE_DIRECTORY` 覆盖、按正确目录 `specs/006-budget-goals/` 生成（见 plan.md 头部说明）。
