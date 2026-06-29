---

description: "Task list for feature implementation"
---

# Tasks: 资产/负债完整化 (Phase 2)

**Input**: Design documents from `/specs/003-assets-liabilities/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: 本特性的验收标准（SC-001..SC-005）均为「错账发生率 = 0 / 不一致发生率 = 0 / 曲线平滑」等可测不变式，且项目 CLAUDE.md 强制测试文化（提交前必跑 `pnpm type-check` + 相关文件测试）——故为每个用户故事包含**关键正确性测试任务**（先写测试、确保失败、再实现）。测试与源码同目录 `*.test.ts`（Vitest）。

**Organization**: 任务按用户故事分组（US1 资产/负债完整登记 + 曲线呈现 / US2 贷款还款正确性 / US3 信用卡账单周期），使各故事可独立实现与测试。资产生命周期（估值更新/处置）归入 US1（资产完整化的「维护」语义，FR-008）。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、不依赖未完成任务）
- **[Story]**: 所属用户故事（US1/US2/US3）
- 描述含确切文件路径

## Path Conventions

- 单一 Next.js 全栈项目：`src/database/schema/finance/`、`src/repositories/finance/`、`src/services/finance/`、`src/app/api/finance/`、`src/features/finance/`
- 测试：与源码同目录 `*.test.ts` 或 `tests/finance/*.test.ts`（Vitest，`pnpm test --run --silent='passed-only' '<pattern>'`）
- 金额一律字符串、内部「分」整数（`services/finance/money.ts`），禁止浮点

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 确认前置条件与环境（增量特性，无新工程脚手架）

- [X] T001 ⚠️ **硬前置**：确认 Phase 0 复式记账核心 + Phase 1 净资产闭环已实现并达标——`src/database/schema/finance/`（accounts/transactions+entries/categories/bill-imports/net-worth-snapshots）、`services/finance/{balance,ledger,net-worth}.service.ts`、系统权益账户 `__income`/`__expense` 已 seed；Phase 0/1 退出标准测试通过（账目平衡、转账不改净资产、快照一致）。**未达标则本特性无法交付**（research.md R9）。
- [X] T002 [P] 环境变量：在 `.env.local` 确认/补齐 `DATABASE_URL`、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`（见 quickstart.md §2）
- [X] T003 [P] 依赖确认：`drizzle-orm`/`drizzle-kit`/`zod`/`@supabase/ssr`/`recharts`/`vitest` 已安装（`package.json`），缺则补装（Phase 2 无新增主依赖）
- [X] T004 [P] schema 形态确认：确认 `finance_accounts.type`/`finance_transactions.type` 为 `varchar + $type<>`（非 DB 枚举）——决定类型扩展是否需要 ALTER 枚举（data-model.md §3、quickstart.md §3）

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Phase 2 全部用户故事共享的 schema 地基 + **关键净资产改造**

**⚠️ CRITICAL**: 任何用户故事实现前必须完成本阶段（新负债类型 + 净资产负债识别是 US1/US2/US3 的共同前置）

- [X] T005 [P] 扩展 `src/database/schema/finance/accounts.ts`：`ACCOUNT_TYPES` 追加 `mortgage`/`car_loan`/`consumer_loan`/`borrowing`；导出 `LIABILITY_ACCOUNT_TYPES = ['credit','mortgage','car_loan','consumer_loan','borrowing']`；`EQUITY_ACCOUNT_NAMES` 追加 `revaluation: '__revaluation'`（data-model.md §3.1/§3.2）
- [X] T006 [P] 扩展 `src/database/schema/finance/transactions.ts`：`TRANSACTION_TYPES` 追加 `repayment`/`revaluation`/`disposal`；新增 `principalAmount`/`interestAmount`（`numeric(18,2)` nullable，repayment 专用）列与类型（data-model.md §3.3）
- [X] T007 [P] 新增 `src/database/schema/finance/asset-details.ts`：`finance_asset_details`（1:1 挂账户，`account_id` UNIQUE + `onDelete: cascade`；`cost_basis`/`valuation_source`/`estimate_confidence`/`valuation_date`/`valuation_history jsonb`/`is_disposed`；`user_id` 隔离；金额 numeric(18,2)），导出类型（data-model.md §1）
- [X] T008 [P] 新增 `src/database/schema/finance/liability-details.ts`：`finance_liability_details`（1:1；`kind`/`principal`/`interest_rate numeric(8,5)`/`monthly_payment`/`due_date`/`paid_amount`/`statement_day`/`repayment_day`；`user_id` 隔离），导出类型（data-model.md §2）
- [X] T009 更新 `src/database/schema/finance/index.ts`（barrel 导出 2 新表）与 `relations.ts`（`finance_accounts` 1—1 `asset/liability_details`，按 `account_id`），运行 `pnpm db:generate` + `pnpm db:migrate`（依赖 T005–T008）
- [X] T010 ⚠️ **关键改造**：`src/services/finance/net-worth.service.ts` 与 `src/services/finance/balance.service.ts` 中负债识别从 `a.type === 'credit'` 改为 `LIABILITY_ACCOUNT_TYPES.includes(a.type)`（`computeNetWorthFromAccounts`/`computeNetWorthAtDatePure`/`netWorthCents`），否则房贷/车贷不计负债、净资产虚高（research.md R7）；新增回归测试 `tests/finance/net-worth-liability-types.test.ts`（mortgage 账户正确计入总负债、credit 行为不变）（依赖 T005、T009）
- [X] T011 [P] 扩展 `src/app/api/finance/_lib/validation.ts`：`createAccountSchema.type` 枚举追加 4 贷款类型；`createTransactionSchema.type` 追加 `repayment`/`revaluation`/`disposal`（依赖 T005、T006）

**Checkpoint**: schema 地基 + 净资产负债识别就绪，用户故事实现可开始

---

## Phase 3: User Story 1 - 资产/负债完整登记 + 曲线呈现 (Priority: P1) 🎯 MVP

**Goal**: 用户把房产/车辆/房贷/车贷/信用卡/借款全部登记进来；仪表盘总资产/总负债/净资产正确反映全部家底；实物资产在曲线上被标记为「估值点」，可切换「仅高流动性」/「全部资产」视图。含资产生命周期（估值更新/处置，FR-008 + Edge Cases）。

**Independent Test**: 登记一套房产（带估值与置信度）、一辆车、一笔房贷、一笔车贷、信用卡欠款后，`净资产 = 总资产 − 总负债` 与逐项汇总一致；实物资产在曲线上被标记为估值点；`?view=high` 过滤之、`?view=all` 含之，可一键切回；估值更新/处置后曲线相关日期同步刷新、无旧值残留。

### Tests for User Story 1（先写测试、确保失败再实现）

- [ ] T012 [P] [US1] 资产登记/列表正确性测试：建 `real_asset`/`investment` 账户 + 明细后，当前价值 == 账户 `balance`、`estimateConfidence` 持久化、`includeInNetWorth` 生效，于 `tests/finance/asset.service.test.ts`
- [ ] T013 [P] [US1] 负债登记/列表正确性测试：建 mortgage/credit 账户 + 明细后，剩余本金 == 账户 `balance`、`principal`/`interestRate`/`monthlyPayment`/`paidAmount(=0)`/`statementDay` 持久化，于 `tests/finance/liability.service.test.ts`
- [ ] T014 [P] [US1] 流动性视图测试：`view=high` 净资产 == `(cash+savings+investment) − totalLiabilities`、过滤 `real_asset`；`view=all` 含之，于 `tests/finance/net-worth.service.test.ts`
- [ ] T015 [P] [US1] 估值更新/处置正确性测试：`revalueAsset` 后资产 `balance=新值`、`valuationHistory` 追加、快照刷新；`disposeAsset` 后资产清零、现金 +proceeds、损益入 `__income`/`__expense`、`Σdebit==Σcredit`，于 `tests/finance/asset.service.test.ts`

### Implementation for User Story 1

- [ ] T016 [P] [US1] 新增 `src/repositories/finance/asset-detail.repository.ts`：继承 `FinanceRepository`（scoped by userId），`upsertByAccountId`/`findByAccountId`/`list`/`update`，`account_id` UNIQUE（沿用 base.ts 模式）
- [ ] T017 [P] [US1] 新增 `src/repositories/finance/liability-detail.repository.ts`：同上模式，承载贷款/信用卡明细读写
- [ ] T018 [US1] 扩展 `src/services/finance/ledger.service.ts` 的 `ensureSystemEquityAccounts()`：幂等创建 `__revaluation` 系统权益账户（`user_id='__system__'`、`type='equity'`、`systemKey='revaluation'`、`includeInNetWorth=false`），返回 `{ income, expense, revaluation }`（依赖 T005）
- [ ] T019 [US1] 新增 `src/services/finance/asset.service.ts`：`register/update`（建 `real_asset`/`investment` 账户 + upsert 明细：成本/置信度/来源/估值日）、`list`（带明细 + 当前价值=balance + 置信度）（依赖 T012、T016）
- [ ] T020 [US1] 新增 `src/services/finance/liability.service.ts`：`register/update`（建 credit/贷款账户 + upsert 明细：本金/利率/月供/到期/账单日）、`list`（带明细 + 剩余本金=balance + 已还）（依赖 T013、T017）
- [ ] T021 [US1] 扩展 `src/services/finance/asset.service.ts`：`revalueAsset`（revaluation 2 腿：资产 ↔ `__revaluation`，`balance=新值` + 追加 `valuationHistory` + `refreshSnapshots`）与 `disposeAsset`（disposal 3 腿：现金 + 资产清零 + 损益入 `__income`/`__expense` + `isDisposed` + `refreshSnapshots`），落库前 `assertBalanced`（依赖 T015、T018；data-model.md §4）
- [ ] T022 [US1] 扩展 `src/app/api/finance/_lib/validation.ts`：新增 `createAssetSchema`/`patchAssetSchema`（`estimateConfidence` ∈ high/medium/low）/`createLiabilitySchema`/`patchLiabilitySchema`（`kind` 枚举、`statementDay`/`repaymentDay` ∈ 1–31）/`revalueSchema`/`disposeSchema`
- [ ] T023 [P] [US1] 新增 `src/app/api/finance/assets/route.ts`（GET 列表/POST 登记）与 `src/app/api/finance/assets/[id]/route.ts`（PATCH 更新，不改 balance）
- [ ] T024 [P] [US1] 新增 `src/app/api/finance/liabilities/route.ts`（GET/POST）与 `src/app/api/finance/liabilities/[id]/route.ts`（PATCH，不改 balance/paidAmount）
- [ ] T025 [P] [US1] 新增 `src/app/api/finance/assets/[id]/revalue/route.ts` 与 `src/app/api/finance/assets/[id]/dispose/route.ts`（调用 asset.service）
- [ ] T026 [US1] 扩展 `src/services/finance/net-worth.service.ts` 流动性视图派生（`liquidNetWorth = (breakdown.cash+savings+investment) − totalLiabilities`，纯函数可单测）+ `src/app/api/finance/net-worth/route.ts` 与 `snapshots/route.ts` 加 `?view=high|all`（依赖 T014；research.md R2）
- [ ] T027 [P] [US1] 扩展 `src/features/finance/api.ts`：新增 `AssetDTO`/`AssetDetailDTO`/`LiabilityDTO`/`LiabilityDetailDTO` 类型 + `listAssets/createAsset/updateAsset/revalueAsset/disposeAsset/listLiabilities/createLiability/updateLiability` 客户端方法
- [ ] T028 [US1] 扩展 `src/features/finance/hooks/use-finance.ts`：`useAssets`/`useLiabilities`/`useRevalueAsset`/`useDisposeAsset`/`useNetWorth(view)`/`useNetWorthSnapshots(view)` hooks（TanStack Query）
- [ ] T029 [P] [US1] 新增 `src/features/finance/components/AssetManager.tsx`：资产登记表单 + 列表（估值置信度高/中/低 视觉标记、当前价值=balance）+ 估值更新/处置入口
- [ ] T030 [P] [US1] 新增 `src/features/finance/components/LiabilityManager.tsx`：负债登记表单 + 列表（贷款明细：本金/利率/月供/到期/已还；信用卡：账单日/还款日）+ 还款/账单入口占位（US2/US3 填充）
- [ ] T031 [US1] 扩展 `src/features/finance/components/NetWorthDashboard.tsx`：流动性视图切换（`high`/`all` ToggleButton）+ 曲线「估值点」标记（`real_asset` 段着色/虚线，低置信度灰点）

**Checkpoint**: 全部家底可登记、净资产恒等成立、曲线含估值点且可切换、资产可估值更新/处置——US1 独立可用（MVP）

---

## Phase 4: User Story 2 - 贷款还款正确性 (Priority: P2)

**Goal**: 记录一笔还款后，负债正确减少、现金正确减少、净资产仅因利息平滑变化（本金对冲不扭曲），复式平衡不变。

**Independent Test**: 记录一笔房贷还款（本金 ¥3,000 + 利息 ¥2,000 = ¥5,000）：剩余本金 −¥3,000、现金 −¥5,000、净资产 −¥2,000、资产端不变；`Σdebit==Σcredit`；曲线因利息平滑下降、无虚假波动（SC-001）。

### Tests for User Story 2

- [ ] T032 [P] [US2] 还款正确性测试：`recordRepayment` 后——负债账户 `balance − principal`、现金账户 `−(principal+interest)`、`liability_details.paidAmount += principal`、`__expense` 记 interest、`Σdebit==Σcredit`、净资产 `−interest`、资产端不变；含提前还款重算到期，于 `tests/finance/ledger.service.test.ts`

### Implementation for User Story 2

- [ ] T033 [US2] 新增 `src/services/finance/ledger.service.ts` 的 `recordRepayment({ userId, liabilityAccountId, cashAccountId, principal, interest, occurredAt, note?, earlyRepayment? })`：构造 3 腿（debit 负债 principal、debit `__expense` interest、credit 现金 principal+interest），`assertBalanced` 后单事务写 `transactions(type=repayment, principalAmount, interestAmount)` + entries + 原子更新两账户 balance + 更新 `liability_details.paidAmount`，提交后 `refreshSnapshots`；`earlyRepayment` 时按剩余本金/月供/利率重算 `dueDate`（依赖 T032、T010、T017、T018；data-model.md §4 / research.md R3）
- [ ] T034 [US2] 扩展 `src/app/api/finance/_lib/validation.ts`：新增 `repaySchema`（`cashAccountId` 必填、`principal` 正金额、`interest` ≥0、`occurredAt?`/`note?`）
- [ ] T035 [P] [US2] 新增 `src/app/api/finance/liabilities/[id]/repay/route.ts`：`POST`，校验账户归属/类型为负债，调用 `recordRepayment`，返回 `{ transaction, remainingPrincipal, paidAmount }`（contracts/api.md §2）
- [ ] T036 [US2] 扩展 `src/features/finance/api.ts`（`repayLiability`）与 `hooks/use-finance.ts`（`useRepayLiability` mutation，成功后失效负债/净资产/快照查询）
- [ ] T037 [US2] 扩展 `src/features/finance/components/LiabilityManager.tsx`：还款入口（本金/利息拆分输入 + 提前还款选项）+ 结果展示（剩余本金/累计已还）

**Checkpoint**: 任意贷款/信用卡还款账目平衡、净资产仅因利息变化、曲线平滑——US1 + US2 独立可用

---

## Phase 5: User Story 3 - 信用卡账单周期与还款日 (Priority: P3)

**Goal**: 设置信用卡账单日/还款日，看到本期账单金额/已还/待还，临近还款日提示（不自动代扣、不存凭证）。

**Independent Test**: 设一张信用卡账单日 5/还款日 25，按账单周期聚合本期账单/已还/待还正确；全额还款后信用负债归零、本期账单标记已还清；临近还款日 `dueSoon=true`（SC-004）。

### Tests for User Story 3

- [ ] T038 [P] [US3] 账单周期聚合测试：`getCreditCardPeriod` 周期边界正确（跨月滚动）、`statementAmount == Σ credit 侧消费`、`paidAmount == Σ debit 侧还款`、`remaining`、临近 `repaymentDay` 时 `dueSoon=true`/`daysUntilDue` 正确，于 `tests/finance/liability.service.test.ts`

### Implementation for User Story 3

- [ ] T039 [US3] 新增 `src/services/finance/liability.service.ts` 的 `getCreditCardPeriod(userId, accountId)`：由 `finance_entries`（join transactions）按账单周期 `[上 statementDay, 当前 statementDay)` 聚合本期账单/已还/待还 + 还款提示（`dueSoon`/`daysUntilDue`，不自动代扣、不存凭证）（依赖 T038、T017；research.md R6）
- [ ] T040 [P] [US3] 新增 `src/app/api/finance/liabilities/[id]/billing/route.ts`：`GET`，仅 `credit` 账户（否则 `400 NOT_CREDIT`），返回 `CreditBillingDTO`（contracts/api.md §2）
- [ ] T041 [US3] 扩展 `src/features/finance/api.ts`（`getCreditCardBilling`）与 `hooks/use-finance.ts`（`useCreditCardBilling`）
- [ ] T042 [US3] 扩展 `src/features/finance/components/LiabilityManager.tsx`（或新增 `CreditBillingCard.tsx`）：信用卡账单卡片（本期账单/已还/待还 + 还款日倒计时提示 + 全额还款入口）

**Checkpoint**: 信用卡账单周期可管理、临近还款日提示——US1 + US2 + US3 全部独立可用

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 跨故事的质量门与一致性

- [ ] T043 [P] 类型与质量门：`pnpm type-check` + `pnpm check`（type-check + lint）全绿，无 `any` 残留（见 `.claude/rules/typescript.md`）
- [ ] T044 [P] 测试全绿：`pnpm test --run --silent='passed-only' 'finance'`（含 T010 净资产负债识别回归、Phase 0/1 既有快照/曲线测试无回归）
- [ ] T045 [P] SC 验收清单：按 `quickstart.md §5` 逐项核对 SC-001（还款错账=0）/SC-002（估值点+视图切换）/SC-003（净资产恒等含新贷款类型）/SC-004（账单周期）/SC-005（估值/负债变动后快照刷新）
- [ ] T046 [P] 文档更新：更新 `src/features/finance/README.md`（资产/负债/还款/账单/流动性视图用法）
- [ ] T047 数据一致性巡检：在 `balance.service.verifyAll` 或 `net-worth.service.verifySnapshots` 中追加 `liability_details` 校验——`principal − paidAmount` 应近似账户 `balance`，偏差即异常并告警（research.md R8 防漂移）
- [ ] T048 [P] 错误处理与隔离核对：所有新路由 `requireUserId` + scoped 查询、越权返回 404、复式违反返回 `400 LEDGER_INVARIANT`、信用卡非 credit 返回 `400 NOT_CREDIT`（contracts/api.md 通用约定）

---

## Dependencies & Execution Order

### Phase 依赖

- **Setup（Phase 1）**：无依赖，立即可开始（T001 为硬前置门）
- **Foundational（Phase 2）**：依赖 Setup；**阻塞全部用户故事**（T005–T011）
- **User Stories（Phase 3+）**：均依赖 Foundational 完成
  - US1（Phase 3）依赖 T010（净资产改造）、T011（枚举）
  - US2（Phase 4）依赖 US1 的 `liability-detail.repository`(T017)、`liability.service.register`(T020)
  - US3（Phase 5）依赖 US1 的 `liability-detail.repository`(T017)、`liability.service.register`(T020)
- **Polish（Phase 6）**：依赖全部目标用户故事完成

### User Story 依赖

- **US1（P1）**：Foundational 后即可开始，不依赖其它故事（MVP）
- **US2（P2）**：Foundational + US1 负债登记（T017/T020）后开始；还款作用于 US1 登记的负债
- **US3（P3）**：Foundational + US1 信用卡登记（T017/T020）后开始；账单聚合 US1 登记的信用卡 entries

### 各故事内部顺序

- 测试先写并失败 → repository → service → validation → API route → api.ts/hooks → UI
- 资产/负债明细 repository（T016/T017）先于其 service（T019/T020/T021）
- `recordRepayment`(T033) 先于还款 API(T035)/UI(T037)

### 并行机会

- Foundational schema 任务 T005–T008 标 [P]，可并行（不同文件）
- US1 内 repository（T016/T017）、API（T023/T024/T025）、DTO/hooks（T027）、UI（T029/T030）标 [P]，可并行
- 不同用户故事在 Foundational 完成后可由不同人并行（US1 先行，US2/US3 待 US1 负债登记完成）

---

## Parallel Example: User Story 1

```bash
# 并行写 US1 关键正确性测试（先写、确保失败）：
Task: "资产登记/列表测试 in tests/finance/asset.service.test.ts"          # T012
Task: "负债登记/列表测试 in tests/finance/liability.service.test.ts"      # T013
Task: "流动性视图测试 in tests/finance/net-worth.service.test.ts"         # T014
Task: "估值更新/处置测试 in tests/finance/asset.service.test.ts"          # T015

# 并行建 US1 repository（不同文件）：
Task: "asset-detail.repository.ts"   # T016
Task: "liability-detail.repository.ts" # T017

# 并行建 US1 API 路由（不同文件）：
Task: "assets route + [id] route"        # T023
Task: "liabilities route + [id] route"   # T024
Task: "assets/[id]/revalue + dispose"    # T025
```

---

## Implementation Strategy

### MVP First（仅 US1）

1. 完成 Phase 1: Setup（T001 硬前置门）
2. 完成 Phase 2: Foundational（T005–T011，**T010 净资产改造最关键**）
3. 完成 Phase 3: US1（资产/负债完整登记 + 曲线流动性视图 + 资产生命周期）
4. **STOP 验证**：登记全部家底后净资产恒等、曲线估值点 + 视图切换、估值更新/处置刷新
5. 可发布/演示 MVP

### Incremental Delivery

1. Setup + Foundational → 地基就绪
2. + US1 → 独立测试 → 发布/演示（MVP：全部家底 + 诚实净资产曲线）
3. + US2 → 独立测试 → 发布/演示（还款正确性）
4. + US3 → 独立测试 → 发布/演示（信用卡账单管理）
5. Polish → 质量门 + 一致性巡检

### Parallel Team Strategy

多开发者：Setup + Foundational 共同完成 → Foundational 完成后：
- 开发者 A：US1（资产/负债/曲线/生命周期）
- 开发者 B（待 US1 负债登记 T017/T020 完成）：US2（还款）
- 开发者 C（待 US1 信用卡登记完成）：US3（账单）

---

## Notes

- [P] 任务 = 不同文件、不依赖未完成任务
- [Story] 标签映射任务到用户故事，便于追溯
- 每个用户故事应独立可完成、可测试
- 测试先写并失败再实现（CLAUDE.md 测试文化 + SC 可测不变式）
- 每个任务或逻辑组提交一次（gitmoji 前缀，见 `.claude/rules/code-review.md`）
- 金额一律字符串 + 「分」整数，禁止浮点；余额只能由 entries 维护
- 避免：模糊任务、同文件冲突、破坏故事独立性的跨故事依赖
- ⚠️ 关键风险：T010 净资产负债识别改造必须先于任何故事，且须回归 Phase 1 快照/曲线测试
