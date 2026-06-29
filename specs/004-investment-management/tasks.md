---
description: "Task list for feature implementation"
---

# Tasks: 投资管理 (Phase 3)

**Input**: Design documents from `/specs/004-investment-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md（均已就绪）

**Tests**: 本特性**包含测试**。原因：spec 的成功标准 SC-001..SC-005 均为可测不变式（复式平衡、IRR 对齐主流计算器、盈亏=市值−成本、行情降级、集中度预警），quickstart.md §核心不变式测试场景明确列出 must-pass 用例，且 CLAUDE.md 强制测试文化。沿用仓库既有两层模式（见 `tests/finance/_helpers.ts`）：**纯函数测试始终运行**（无 DB），**集成测试由 `FINANCE_INTEGRATION_TEST=1` 门控**（需真实 Postgres 测试库 + `scripts/init-finance.mjs`）。每个故事「先写测试、确保失败再实现」。

**Organization**: 任务按用户故事分组（US1 P1 / US2 P2 / US3 P3 / US4 P4）。Phase 1 Setup → Phase 2 Foundational（阻塞所有故事的 schema + 纯函数 + repository）→ Phase 3-6 各用户故事 → Phase 7 Polish。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、不依赖未完成任务）
- **[Story]**: 归属用户故事（US1/US2/US3/US4）；Setup/Foundational/Polish 阶段**无** story 标签
- 描述内必须含**精确文件路径**，并附依赖 `（依赖 Tx）` 与文档引用 `（data-model.md §N / research.md RN / contracts/api.md §N / quickstart.md §N）`

## Path Conventions

- Schema: `src/database/schema/finance/`（barrel `index.ts`，关系集中在 `relations.ts`）
- Repository: `src/repositories/finance/`（继承 `base.ts` 的 `FinanceRepository`，按 `userId` scope）
- Service: `src/services/finance/`
- API: `src/app/api/finance/`（共享 `_lib/{auth,validation,serialize}.ts`）
- 前端: `src/features/finance/`（`api.ts` DTO + `hooks/use-finance.ts` TanStack Query + `components/`）
- 测试: `tests/finance/`
- **领域铁律**：金额一律字符串、内部「分」整数（`toCents`/`fromCents`，`src/services/finance/money.ts`），**禁止浮点**；份额/价格用 `numeric(18,6)` 字符串；所有用户表带 `user_id`（纯文本，无 FK）；写操作单事务 + best-effort `refreshSnapshots`。

> ⚠️ **与 research.md R8 的重要修正**：R8 假设「Phase 2 仅落地 schema，`__revaluation`/revaluation/disposal 待 Phase 3 实现」——**该假设已过时**。当前代码**已实现**：`ensureSystemEquityAccounts()` 幂等创建 `__income`/`__expense`/`__revaluation`（`ledger.service.ts:81`）、`TRANSACTION_TYPES` 已含 `repayment`/`revaluation`/`disposal`（`transactions.ts:13`）、`asset.service.ts` 已导出纯函数 `buildRevaluationEntries`/`buildDisposalEntries` 与 `postEntriesTransaction`、`ledger.service.ts` 已实现 `recordRepayment`（3 腿）。**因此 Phase 3 复用这些，不重复实现**；buy/dividend_cash 复用既有 `transfer`/`income` 类型，**无需新增 transaction 类型**。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 确认前置阶段就绪、补齐环境变量（本特性为增量，无脚手架）。

- [X] T001 ⚠️ **硬前置**：确认 Phase 0/1/2 已实现并达标——`src/database/schema/finance/`（accounts 含 `investment` 类型、transactions+entries、asset/liability-details、net-worth-snapshots、rule-findings）、`src/services/finance/{ledger,asset,liability,balance,net-worth,rules-engine}.service.ts`、`ensureSystemEquityAccounts()` 已创建 `__revaluation`、`buildRevaluationEntries`/`buildDisposalEntries`/`recordRepayment` 已存在。运行 `pnpm test --run --silent='passed-only' 'finance'` 确认 Phase 0/1/2 测试全绿（quickstart.md §前置）。**未达标则本特性无法交付**。
- [ ] T002 [P] 环境变量：在 `.env.local` 确认/补齐 `DATABASE_URL`、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`，并新增可选 `MARKET_DATA_PROVIDER=http-quote`（默认）、`MARKET_DATA_TTL_SECONDS=300`（quickstart.md §2 / research.md R3）。

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 所有用户故事共享的数据层 + 无依赖纯函数 + repository，必须先完成。
**⚠️ CRITICAL**：未完成本阶段前不得开始任何用户故事。

- [X] T003 新增 `src/database/schema/finance/positions.ts`：`finance_positions`（1:1 投资账户），列 `id`(uuid PK defaultRandom)、`userId`(text)、`accountId`(uuid FK→financeAccounts onDelete cascade **unique**)、`instrumentCode`(varchar32)、`instrumentType`(varchar16 $type 枚举 stock/fund/bond/gold/etf/reits/crypto)、`quantity`/`costPrice`/`currentPrice`(decimal 18,6)、`priceSource`(manual/market/estimate)、`lastPriceAt`(timestamptz)、`currency`(default CNY)、`estimateConfidence`(high/medium/low)、`isClosed`(bool default false)、手写 `createdAt`/`updatedAt`；导出 `PositionItem`/`NewPosition`（data-model.md §1 / research.md R1）。
- [X] T004 [P] 新增 `src/database/schema/finance/instruments.ts`：`finance_instruments`（品种目录 + 行情缓存），列 `code`/`type`/`name`/`latestPrice`(18,6)/`priceSource`/`priceUpdatedAt`/`isStale`/`currency`/`meta`(jsonb) + 时间戳；`uniqueIndex(userId, code)`；导出类型（data-model.md §2）。
- [X] T005 [P] 新增 `src/database/schema/finance/investment-trades.ts`：`finance_investment_trades`（语义层 1:N），列 `positionId`(FK→positions cascade)、`action`(buy/sell/dividend_cash/dividend_reinvest/split)、`shares`/`price`(18,6)、`fee`/`tax`/`amount`(18,2)、`transactionId`(FK→transactions set null)、`dcaPlanId`(FK→dca_plans set null)、`occurredAt`、`note` + 时间戳；index `(positionId)`；导出类型（data-model.md §3 / research.md R2）。
- [X] T006 [P] 新增 `src/database/schema/finance/dca-plans.ts`：`finance_dca_plans`（定投计划，**仅配置/标记，不自动生成交易**），列 `instrumentCode`/`instrumentType`/`amount`/`frequency`(monthly/biweekly/weekly)/`dayOfPeriod`(int)/`cashAccountId`(FK set null)/`active`(bool) + 时间戳；导出类型（data-model.md §4 / research.md 注：IRR 真相源是 investment_trades 而非计划）。
- [X] T007 扩展 `src/database/schema/finance/relations.ts`（accounts↔positions 1:1、positions↔investment_trades 1:N、positions↔instruments 软关联）与 `index.ts`（barrel 导出 4 新表），运行 `pnpm db:generate` + `pnpm db:migrate`（依赖 T003–T006）。
- [X] T008 [P] 新增 `src/services/finance/irr.ts`：纯函数 `computeXirr(cashflows: {date:Date; amount:number}[])` —— 二分法 + Newton-Raphson，区间 [-0.999, +10]，tol 1e-7，max 100 迭代；不收敛/多解/无正现金流 → 返回 `{annualizedRate:null, converged:false, reason}`（**绝不返回错误数字**）。自实现、不引新依赖（research.md R6）。
- [X] T009 [P] 新增 `src/services/finance/pnl.ts`：纯函数 `pnl(marketValue, cost)`、`pnlRate(pnl, cost)`、`weightedAvgCost`、`aggregateByType(positions) → [{instrumentType, marketValue, ratio}]`、`concentrationRatio`（research.md R6/R9）。
- [X] T010 [P] 新增 `src/repositories/finance/position.repository.ts`：继承 `FinanceRepository`（userId scoped），`upsertByAccountId`/`findByAccountId`/`list({includeClosed})`/`update`（沿用 `asset-detail.repository.ts` 模式）（依赖 T003）。
- [X] T011 [P] 新增 `src/repositories/finance/instrument.repository.ts`：`upsertByCode`/`findByCode`/`list({type})`/`markStale`（依赖 T004）。
- [X] T012 [P] 新增 `src/repositories/finance/investment-trade.repository.ts`：`create`/`listByPosition`/`listBuysByInstrument`（IRR 现金流用）（依赖 T005）。

**Checkpoint**：4 张新表已迁移、`irr.ts`/`pnl.ts` 纯函数可单测、3 个 repository 就绪；Phase 3 业务可开始。

---

## Phase 3: User Story 1 - 买入/卖出后，持仓和净资产都对 (Priority: P1) 🎯 MVP

**Goal**: 记录「银行卡买入 ¥1,000 某基金」→ 银行卡 −¥1,000、持仓 +¥1,000 成本、**净资产不变**；卖出如实记录盈亏（SC-001）。
**Independent Test**: 买入后现金 −1000、持仓余额 +1000（成本）、净资产不变、份额/成本价正确、Σdebit==Σcredit；部分卖出 → 份额减、成本价不变、(proceeds−bookValue) 实现盈亏、净资产反映盈亏。

### Tests for User Story 1（先写测试、确保失败再实现）

- [X] T013 [P] [US1] 纯函数测试 `tests/finance/investment.entries.test.ts`：待 `investment.service` 导出的 `buildBuyEntries`（debit 持仓 amount=shares×price+fee / credit 现金，平衡）、`buildDividendCashEntries`（debit 现金 / credit `__income`）后断言 `balanced(legs)`；并复用既有 `buildDisposalEntries` 验证**部分卖出**（按比例 bookValue=balance×(shares/quantity)、proceeds=shares×price−fee−tax、盈→credit `__income`、亏→debit `__expense`、平→2 腿、非正 proceeds 抛 `LedgerInvariantError`）。沿用 `tests/finance/_helpers.ts` 的 `balanced()`（research.md R5 / contracts/api.md §1）。

### Implementation for User Story 1

- [X] T014 [US1] 新增 `src/services/finance/investment.service.ts` 的 `registerPosition({userId, name, instrumentCode, instrumentType, currency?, includeInNetWorth?})`：建 `investment` 账户（balance=0）+ upsert positions（qty 0 / cost 0），返回 `{account, position}`（contracts/api.md §1 / 依赖 T010）。
- [X] T015 [US1] 新增 `investment.service.ts` 的 `buy({userId, positionId, cashAccountId, shares, price, fee, occurredAt?, note?, dcaPlanId?})`：amount=shares×price+fee；**镜像 `recordRepayment` 的 inline 单事务**（写 transactions type=`transfer` + entries + 按 `signedDeltaCents` 原子改 balance），同事务内 `quantity += shares` 并重算 `costPrice`（加权平均），写 `investment_trades(action:'buy')`，提交后 `refreshSnapshots`。复用 `assertBalanced`/`signedDeltaCents`/`toCents`/`fromCents`（research.md R7 / 依赖 T013、T010、T012）。
- [X] T016 [US1] 新增 `investment.service.ts` 的 `sell({userId, positionId, cashAccountId, shares, price, fee, tax, occurredAt?, note?})`：proceeds=shares×price−fee−tax、bookValue=balance×(shares/quantity)；**复用 `buildDisposalEntries`**（来自 `asset.service`），type=`disposal` 单事务写盘 + `quantity -= shares`（costPrice 不变）、全部卖出置 `isClosed=true`、写 `investment_trades(action:'sell')`、`refreshSnapshots`；返回 `{transaction, realizedPnl, position}`（contracts/api.md §1 / 依赖 T013、T015）。
- [X] T017 [P] [US1] 扩展 `src/app/api/finance/_lib/validation.ts`：`createPositionSchema`/`patchPositionSchema`（仅 name/estimateConfidence/includeInNetWorth，**禁止** balance/quantity/costPrice）、`buySchema`(shares/price 高精度字符串、fee≥0)、`sellSchema`(+tax≥0)；导出 `type`（contracts/api.md §1）。
- [X] T018 [P] [US1] 扩展 `src/app/api/finance/_lib/serialize.ts`：`toPositionDto({account, position})` → 平铺 `{id, name, type:'investment', balance, includeInNetWorth, isArchived, position:{instrumentCode, instrumentType, quantity, costPrice, currentPrice, priceSource, lastPriceAt, currency, estimateConfidence, isClosed, cost, marketValue, pnl, pnlRate}}`，派生字段用 `pnl.ts`（contracts/api.md §1 / 依赖 T009）。
- [X] T019 [P] [US1] 新增 `src/app/api/finance/positions/route.ts`（GET 列表带派生指标 / POST 登记）与 `src/app/api/finance/positions/[id]/route.ts`（PATCH 元数据）；`requireUserId` 门控、Zod、→ service、`LedgerInvariantError`→400 `LEDGER_INVARIANT`（contracts/api.md §1）。
- [X] T020 [P] [US1] 新增 `src/app/api/finance/positions/[id]/buy/route.ts` 与 `src/app/api/finance/positions/[id]/sell/route.ts`：`requireUserId` + 校验账户归属/类型，调用 `buy`/`sell`，返回 `{transaction, position}` / `{transaction, realizedPnl, position}`（contracts/api.md §1）。
- [X] T021 [P] [US1] 扩展 `src/features/finance/api.ts`：`PositionDTO`/`BuyResult`/`SellResult` 类型 + `listPositions`/`createPosition`/`updatePosition`/`buyPosition`/`sellPosition` 客户端方法。
- [X] T022 [US1] 扩展 `src/features/finance/hooks/use-finance.ts`：`usePositions`/`useCreatePosition`/`useBuyPosition`/`useSellPosition`（TanStack Query，`onSuccess` 失效 `['finance','positions']`/`accounts`/`net-worth`/`transactions`）。
- [X] T023 [US1] 新增 `src/features/finance/components/PositionManager.tsx`（持仓列表 + 登记 + 买入/卖出入口，接 US1 hooks）与 `TradeForm.tsx`（份额/价格/费/税表单，react-hook-form + Zod，沿用 frontend-dev 规范）。
- [X] T024 [US1] 集成测试（门控 `FINANCE_INTEGRATION_TEST=1`）`tests/finance/investment.service.test.ts`：买入不变式 SC-001（现金 −1000、持仓余额 +1000、净资产不变、Σdebit==Σcredit）+ 部分卖出实现盈亏（依赖 T015、T016）。

**Checkpoint**: 可登记投资品种、买入/卖出，复式恒等与净资产不变式成立（SC-001），UI 可操作。

---

## Phase 4: User Story 2 - 自动看到持仓的市值、收益与收益率 (Priority: P2)

**Goal**: 每个持仓当前市值/累计成本/浮动盈亏/收益率；多持仓汇总；行情缺失或陈旧时降级为手动输入并标注来源/时间，**绝不展示虚假最新价**（FR-003/FR-004/FR-008，SC-003/SC-004）。
**Independent Test**: 现价 ¥1.00→¥1.20 时显示市值 ¥1,200、成本 ¥1,000、盈亏 +¥200、盈亏率 +20%；行情不可用 → `MARKET_UNAVAILABLE` 提示手动；手动价 → `priceSource='manual'`、`lastPriceAt` 正确。

### Tests for User Story 2（先写测试、确保失败再实现）

- [X] T025 [P] [US2] 纯函数测试 `tests/finance/pnl.test.ts`：`pnl=marketValue−cost`、`pnlRate=pnl/cost`、多持仓汇总（总市值/总成本/总盈亏/综合收益率）边界（cost=0 不除零）（依赖 T009 / SC-003）。
- [X] T026 [P] [US2] 纯函数测试 `tests/finance/market-data.service.test.ts`：mock `fetch` 验证 provider 路由、缓存命中/穿透、TTL 过期置 `isStale`、provider 失败/超时 → 降级抛 `MARKET_UNAVAILABLE`（**不伪造价格**）（依赖 T027 / SC-004 / research.md R3）。

### Implementation for User Story 2

- [X] T027 [US2] 新增 `src/services/finance/market-data.service.ts`：`MarketDataProvider` 接口 + 默认 `HttpQuoteProvider`（新浪 `hq.sinajs.cn` / 腾讯 `qt.gtimg.cn` / 东方财富 `push2.eastmoney.com`，运行时实测端点/格式/限频），经 `instrument.repository` 读写缓存 + TTL(`MARKET_DATA_TTL_SECONDS`) + `isStale`，失败降级抛 `MARKET_UNAVAILABLE`；**Node 运行时**（非 Edge）。实现期需真实测试端点；REITs/加密货币等无源品种走手动兜底（research.md R3 / 依赖 T011）。
- [X] T028 [US2] 新增 `investment.service.ts` 的 `revalue({userId, positionId, currentPrice, source, fetchedAt?})`：newValue=quantity×currentPrice；**复用 `buildRevaluationEntries`**（currentValue=balance）type=`revaluation` 单事务改 balance=newValue + 更新 positions.`currentPrice`/`priceSource`/`lastPriceAt`，`refreshSnapshots`（FR-008 / 依赖 T015、T009）。
- [X] T029 [US2] 新增 `investment.service.ts` 的 `listWithMetrics(userId, {instrumentType?, includeClosed?})` 与 `getMetrics(positionId)`：从 positions + account.balance 经 `pnl.ts` 派生 marketValue/cost/pnl/pnlRate（依赖 T009）。
- [X] T030 [P] [US2] 扩展 `_lib/validation.ts`：`revaluePositionSchema`(currentPrice 正、source manual/market/estimate、fetchedAt)、`createInstrumentSchema`/`upsertManualPriceSchema`(source='manual')、`quoteQuerySchema`。
- [X] T031 [P] [US2] 扩展 `_lib/serialize.ts`：`toInstrumentDto`、`toQuoteDto`（含 `isStale`/`priceSource`/`priceUpdatedAt`）。
- [X] T032 [P] [US2] 新增 `src/app/api/finance/positions/[id]/revalue/route.ts`、`src/app/api/finance/instruments/route.ts`(GET/POST 手动价)、`src/app/api/finance/instruments/[code]/quote/route.ts`（`runtime='nodejs'`，成功 200 `{latestPrice, priceSource:'market', priceUpdatedAt, isStale:false}`，失败 503 `{error:'行情暂不可用', code:'MARKET_UNAVAILABLE', details:{suggestion:'manual'}}`）（contracts/api.md §2）。
- [X] T033 [P] [US2] 扩展 `features/finance/api.ts`：`InstrumentDTO`/`QuoteDTO` + `listInstruments`/`upsertManualPrice`/`getQuote`/`revaluePosition`。
- [X] T034 [US2] 扩展 `use-finance.ts`：`useInstruments`/`useQuote`/`useRevaluePosition`/`useManualPrice`（失效 positions/net-worth/instruments）。
- [X] T035 [US2] 扩展 `PositionManager.tsx`：现价/市值/盈亏列、行情来源与时间徽标、手动改价入口（行情陈旧时高亮提示）。
- [X] T036 [US2] 集成测试（门控）追加 `investment.service.test.ts`：现价更新后 pnl=市值−成本、balance 经 revaluation 更新、快照刷新、曲线无陈旧值（SC-003 / 依赖 T028、T029）。

**Checkpoint**: 持仓自动显示市值/盈亏/收益率，行情降级诚实（SC-003/SC-004）。

---

## Phase 5: User Story 3 - 基金定投累计投入、市值与年化收益（IRR）(Priority: P3)

**Goal**: 记录定投历史，显示累计投入/当前市值/累计盈亏，及考虑资金时间价值的真实年化收益（XIRR），结果与主流基金 IRR 计算器一致（FR-005，SC-002）。
**Independent Test**: 每月定投 ¥1,000 共 12 月 → 累计投入 ¥12,000 + 当前市值 + `computeXirr` 与天天基金对齐（容差内）；中断/恢复按实际投入时点重算。

### Tests for User Story 3（先写测试、确保失败再实现）

- [X] T037 [P] [US3] 纯函数测试 `tests/finance/irr.test.ts`：`computeXirr` 对固定现金流夹具 ≈ 天天基金（容差 1e-4）；极端/不收敛 → `{annualizedRate:null, converged:false}`；中断后按实际时点重算（依赖 T008 / SC-002 / research.md R6）。

### Implementation for User Story 3

- [X] T038 [US3] 新增 `investment.service.ts` 的 `getPerformance({userId, positionId, asOf?})`：现金流来自 `investment_trades`（每次买入 −(shares×price+fee)、现金分红 +amount、终端 +当前市值），调 `computeXirr`；不收敛返回 `{annualizedRate:null, converged:false, reason:'IRR 无法收敛'}`。同时返回 `{marketValue, cost, pnl, pnlRate, totalInvested, irr}`（contracts/api.md §1 / 依赖 T008、T012、T029）。
- [X] T039 [P] [US3] 新增 `src/repositories/finance/dca-plan.repository.ts`（最小 CRUD：create/list/updateActive，**仅配置**）与 `investment.service.createDcaPlan/listDcaPlans`（IRR 真相源仍是 trades）（依赖 T006）。
- [X] T040 [P] [US3] 扩展 `_lib/validation.ts`：`createDcaPlanSchema`(frequency/dayOfPeriod)、`performanceQuerySchema`(asOf 可选)。
- [X] T041 [P] [US3] 新增 `src/app/api/finance/positions/[id]/performance/route.ts`（GET ?asOf → `PerformanceDTO`）与 `dca-plans/route.ts`（GET/POST）（contracts/api.md §1）。
- [X] T042 [P] [US3] 扩展 `features/finance/api.ts`：`PerformanceDTO`/`DcaPlanDTO` + `getPositionPerformance`/`listDcaPlans`/`createDcaPlan`；`use-finance.ts` 加 `usePositionPerformance`/`useDcaPlans`。
- [X] T043 [US3] 新增 `src/features/finance/components/DcaOverview.tsx`：累计投入/当前市值/累计盈亏/IRR 展示，**不收敛时显式提示**（不展示错误数字）。
- [X] T044 [US3] 集成测试（门控）追加 `investment.service.test.ts`：DCA 多次买入 + 终端市值 → IRR 与夹具对齐（SC-002 / 依赖 T038）。

**Checkpoint**: 定投 IRR 对齐主流计算器，不收敛诚实降级（SC-002）。

---

## Phase 6: User Story 4 - 我的钱都投在了哪里（资产配置与集中度）(Priority: P4)

**Goal**: 按股票/债券/黄金/现金等类型汇总占比并可视化；单品种占比超阈值时集中度预警（仅提示，不代为操作）（FR-007，SC-005）。
**Independent Test**: 多类型持仓 → 按类型占比；单一品种占比 > 60% → `rules-engine` 产出 `rule_finding`、`/allocation` 返回预警。

### Tests for User Story 4（先写测试、确保失败再实现）

- [X] T045 [P] [US4] 纯函数测试 `tests/finance/allocation.test.ts`：`aggregateByType` 占比合计=1、`concentrationRatio` 超阈值判定（依赖 T009 / SC-005）。

### Implementation for User Story 4

- [X] T046 [US4] 扩展 `src/services/finance/rules-engine.service.ts`：新增**集中度规则**（单一品种 marketValue/总投资 > 阈值，默认 60% 可配），产出 `rule_finding {code:'CONCENTRATION', severity:'warn', message, threshold}`，复用既有 `rule_findings` 表（**不新建预警表**，research.md R9 / 依赖 T009）。
- [X] T047 [US4] 新增 `investment.service.ts` 的 `getAllocation({userId, view='by_type'})`：经 `pnl.ts` 按类型聚合 + 读 `rule_findings` 拼装 alerts（确定性结论，**非 LLM 计算**，research.md R9 / 依赖 T009、T046）。
- [X] T048 [P] [US4] 扩展 `_lib/validation.ts`：`allocationViewSchema`(by_type 默认)；`_lib/serialize.ts`：`toAllocationDto`。
- [X] T049 [P] [US4] 新增 `src/app/api/finance/allocation/route.ts`（GET ?view → `{items:[{instrumentType, marketValue, ratio}], total, alerts:[...]}`，advisory only）（contracts/api.md §3）。
- [X] T050 [P] [US4] 扩展 `features/finance/api.ts`：`AllocationDTO` + `getAllocation`；`use-finance.ts` 加 `useAllocation`。
- [X] T051 [US4] 新增 `src/features/finance/components/AllocationDashboard.tsx`（recharts 饼图占比 + 集中度预警条）。
- [X] T052 [US4] 集成测试（门控）追加 `investment.service.test.ts`：单一品种 > 60% → `rule_finding` 写入 + `/allocation` 返回 warning（SC-005 / 依赖 T046、T047）。

**Checkpoint**: 资产配置占比可视化 + 集中度预警（SC-005）。

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 端到端验收、质量门、错误处理与隔离核对。

- [X] T053 [P] 类型与质量门：`pnpm type-check` + `pnpm check`（type-check + lint）全绿，无 `any` 残留（`.claude/rules/typescript.md`）。
- [X] T054 [P] 测试全绿：`pnpm test --run --silent='passed-only' 'finance'`（含 004 纯函数 + 门控集成；Phase 0/1/2 既有测试无回归）。
- [X] T055 [P] SC 验收清单：按 `quickstart.md §核心不变式测试场景` 逐项核对 SC-001（买入不变式）/SC-002（IRR）/SC-003（盈亏）/SC-004（行情降级）/SC-005（集中度）。
- [X] T056 [P] 错误处理与隔离核对：所有新路由 `requireUserId` + scoped 查询、越权返回 404（不泄漏存在性）、复式违反 → 400 `LEDGER_INVARIANT`、行情不可用 → 503 `MARKET_UNAVAILABLE`、IRR 不收敛 → `null`+提示、金额字符串/内部 cents（contracts/api.md 通用约定 / research.md R10）。

---

## Dependencies & Execution Order

### Phase 依赖
- Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3-6 (用户故事) → Phase 7 (Polish)。
- Phase 2 的 schema/迁移（T003–T007）阻塞**所有**故事；纯函数 `irr.ts`/`pnl.ts`（T008/T009）与 repository（T010–T012）阻塞对应故事。

### User Story 依赖
- **US1 → US2 → US3 → US4**（建议顺序，因 service 文件增量扩展：`investment.service` 在 US1 建 `registerPosition`/`buy`/`sell`，US2 加 `revalue`/metrics，US3 加 `getPerformance`，US4 加 `getAllocation`）。
- US1 与 US2 在 `investment.service.ts`/`PositionManager.tsx` 上有文件耦合 → **不建议纯并行**，串行更稳。
- US3、US4 各自新增独立组件（`DcaOverview`/`AllocationDashboard`）+ 独立路由，可在 US2 完成后并行。

### 各故事内部顺序
先写测试（fail）→ 纯函数/repository → service → validation/serialize → API 路由 → 前端 DTO/hooks → 组件 → 集成测试（pass）。

### 并行机会
- Foundational：T004/T005/T006（独立 schema）、T008/T009（独立纯函数）、T010/T011/T012（独立 repository）可并行。
- US1：T017/T018/T019/T020/T021（validation/serialize/路由/DTO 并行）。
- US2：T030/T031/T032/T033 并行。
- US3 与 US4 在 US2 完成后整体并行。

---

## Parallel Example: User Story 1

```bash
# 先串行写 service 内核（共享 investment.service.ts，避免冲突）
# T014 registerPosition → T015 buy → T016 sell → T024 集成测试

# 随后并行外围（不同文件）
pnpm dev &  # 后台起服务
# T013 investment.entries.test.ts（纯函数）
# T017 validation.ts（positions/buy/sell schema）
# T018 serialize.ts（toPositionDto）
# T019 positions/route.ts + [id]/route.ts
# T020 [id]/buy + [id]/sell route.ts
# T021 features/api.ts（PositionDTO + 方法）
# 串行收尾：T022 hooks → T023 PositionManager/TradeForm
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
仅交付 US1（T001–T024）：登记投资品种 + 买入/卖出 + 复式/净资产不变式（SC-001）+ 持仓 UI。这是**正确性地基**，复用 Phase 0/2 既有记账能力，无外部行情依赖，可独立验收。

### Incremental Delivery
- US2：市值/盈亏/收益率 + 行情（含降级）—— 需外部源实测（R3 风险点）。
- US3：DCA + IRR —— 纯函数先于 service。
- US4：配置 + 集中度 —— 复用 rules-engine。

### Parallel Team Strategy
Foundational 由 1 人串行收口（schema/迁移不可并行冲突）；US2 完成后，US3 与 US4 可分两人并行（独立组件 + 路由）；前端组件可与后端路由并行（先以契约 mock）。

---

## Notes

- **最大风险（R3 行情源）**：`market-data.service` 的端点/格式/限频需实现期真实测试；REITs/加密货币等无免费源品种走手动兜底，**绝不伪造价格**（FR-004/SC-004）。
- **精度（R7）**：份额/价格 `numeric(18,6)`、金额 `numeric(18,2)` 字符串 + 内部 cents，避免累积漂移。
- **不重复造轮子**：revalue 复用 `buildRevaluationEntries`、sell 复用 `buildDisposalEntries`、buy/dividend 复用既有 `transfer`/`income` 类型与 `signedDeltaCents`/`assertBalanced`；`postEntriesTransaction`/`recordRepayment` 为单事务 posting 范本。
- ⚠️ **关键风险任务**：T015（`buy` 单事务：分录 + 余额 + positions 加权成本 + investment_trades）与 T027（行情源实测 + 降级）为本特性最易出错处，务必配门控集成测试。
