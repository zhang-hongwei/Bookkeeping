# Tasks: AI 财富顾问深化 (Phase 6)

**Input**: Design documents from `/specs/007-ai-wealth-advisor/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md — all present

**Tests**: Included. The design artifacts (plan.md Project Structure + data-model.md invariants I1–I8) enumerate test files as deliverables, and the project mandates tests for modified files (CLAUDE.md). A focused invariant-test task is included per story (not exhaustive TDD).

**Organization**: Tasks grouped by user story (US1 P1 / US2 P2 / US3 P3) so each is independently implementable & testable. Story phases depend on Foundational.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: US1 / US2 / US3 — only on user-story phase tasks
- Exact file paths in every description

## Path Conventions

Next.js 全栈单仓（App Router）。`src/database/schema/finance` → `src/repositories/finance` → `src/services/finance` → `src/app/api/finance` → `src/features/finance`；测试在 `tests/finance/`。

---

## Phase 1: Setup (Shared Infra)

**Purpose**: Shared, story-agnostic groundwork reused by every Phase 6 route/DTO.

- [ ] T001 [P] Add `SourceRef` type, `DisclaimerEnvelope<T>` helper, and `NON_INVESTMENT_ADVICE_DISCLAIMER` constant to `src/app/api/finance/_lib/serialize.ts` (FR-007/FR-009, used by all story responses)
- [ ] T002 [P] Add shared Zod primitives to `src/app/api/finance/_lib/validation.ts`: period/month query schema, `riskLevel`/`severity`/alert `kind`/approval `status` enums, `targetMonth` regex (reused across stories)

**Checkpoint**: Shared DTO + validation scaffolding ready for all stories.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Rules-engine enhancements to the shared fact layer consumed by US2/US3.

- [ ] T003 Complete health-score dimensions in `src/services/finance/rules-engine.service.ts` (FR-006): wire `investmentRate` to Phase 3 positions (`investmentAssets / totalAssets`, reuse allocation/position data, drop `await_phase3` stub); replace binary `cashflow` with variance/stability score over `STABILITY_WINDOW` months (research.md 决策 12)
- [ ] T004 Update `tests/finance/rules-engine.service.test.ts`: assert `investmentRate` reflects positions and `cashflow` reflects variance (covers FR-006 determinism/reproducibility)

**⚠️ Note**: US1 (forecast) does NOT depend on T003/T004 and may proceed in parallel. US2/US3 consume the completed health score in their fact layer.

**Checkpoint**: Shared fact layer (rules engine) enhanced; user-story work can begin.

---

## Phase 3: User Story 1 — 现金流预测 + 应急金预警 (Priority: P1) 🎯 MVP

**Goal**: 基于历史收支预测未来数月现金流（带不确定性），定位应急金不足时点，并产出可追溯的智能预警；历史不足明确降级。
**Independent Test**: 给定 ≥ `MIN_HISTORY_MONTHS` 历史收支，`GET /api/finance/forecasts?months=3` 返回带区间的预测点 + `emergencyShortfallMonth`；预测应急金不足时 `GET /api/finance/alerts?status=active` 出现 `emergency_shortfall` 且 `ruleFindingRefs` 非空；新用户（< 3 月）返回 `insufficientHistory=true`、空 points；响应均含 `disclaimer` + `sourceRefs`。

### Tests for User Story 1

- [ ] T005 [P] [US1] Write `tests/finance/forecast.service.test.ts`: pure-function reproducibility (I3), uncertainty interval present, insufficient-history degradation returns empty points (SC-001/SC-005), money as decimal (I4)
- [ ] T006 [P] [US1] Write `tests/finance/alert.service.test.ts`: idempotent materialization on `(userId,kind,period)` (I6), `ruleFindingRefs` non-empty (I1), preferences mute filtering (FR-008)

> Write tests FIRST; ensure they FAIL before implementation.

### Implementation for User Story 1

- [ ] T007 [P] [US1] Create `src/database/schema/finance/cash-flow-forecasts.ts` (`finance_cash_flow_forecasts`: id, userId, targetMonth varchar(7), series jsonb, insufficientHistory bool, generatedAt, timestamps; unique `(userId,targetMonth)`) per data-model.md §2.1
- [ ] T008 [P] [US1] Create `src/database/schema/finance/smart-alerts.ts` (`finance_smart_alerts` + `finance_alert_preferences`: columns per data-model.md §2.2/§2.3; unique `(userId,kind,period)` on alerts, `(userId,kind)` on preferences)
- [ ] T009 [US1] Register new tables + relations in `src/database/schema/finance/index.ts` and `src/database/schema/finance/relations.ts` (depends T007, T008)
- [ ] T010 [US1] Generate migration: `pnpm drizzle-kit generate` (T007/T008 tables + indexes)
- [ ] T011 [P] [US1] Implement `src/repositories/finance/forecast.repository.ts` (userId-scoped upsert/read by targetMonth, extends `FinanceRepository` base)
- [ ] T012 [P] [US1] Implement `src/repositories/finance/alert.repository.ts` (userId-scoped; idempotent upsert on `(userId,kind,period)`; preference upsert; list-by-status)
- [ ] T013 [US1] Implement `src/services/finance/forecast.service.ts`: pure function (linear trend + monthly seasonality + residual-based uncertainty, research.md 决策 2), `MIN_HISTORY_MONTHS`/`FORECAST_HORIZON_MONTHS`/`LOOKBACK_MONTHS` constants, emergency-shortfall detection, insufficient-history degradation (决策 3), cache via forecast.repository, inputs from `sumAmountByType`/`getPeriodMetrics` (depends T011)
- [ ] T014 [US1] Implement `src/services/finance/alert.service.ts`: rule-triggered generation over latest findings+forecast (kinds `emergency_shortfall`/`savings_rate_decline`/`debt_ratio_high`; reuse `computeFindingsFromData` + concentration pattern), idempotent materialize, `ruleFindingRefs` populated (I1), preference-based filtering (depends T012, T013)
- [ ] T015 [US1] Add forecast/alert DTOs + Zod request schemas to `src/app/api/finance/_lib/serialize.ts` and `src/app/api/finance/_lib/validation.ts` (depends T001, T002)
- [ ] T016 [P] [US1] Implement `src/app/api/finance/forecasts/route.ts`: `GET` (read/regenerate cache) + `POST` (recompute), wrap in `DisclaimerEnvelope`, 401 via `requireUserId` (§1)
- [ ] T017 [P] [US1] Implement `src/app/api/finance/alerts/route.ts` (`GET ?status=`) and `src/app/api/finance/alerts/[id]/route.ts` (`PATCH acknowledge|silenced`) (§2.1/§2.2)
- [ ] T018 [US1] Implement `src/app/api/finance/alerts/preferences/route.ts` (`GET` / `PATCH` upsert by kind) (§2.3)
- [ ] T019 [P] [US1] Add forecast/alert methods + DTOs to `src/features/finance/api.ts` and TanStack Query hooks to `src/features/finance/hooks/use-finance.ts` (invalidate on PATCH/recompute)
- [ ] T020 [US1] Build `src/features/finance/components/ForecastPanel.tsx` (predicted series + uncertainty band + emergency-shortfall marker + disclaimer + "为什么是这个数" expandable sourceRefs)
- [ ] T021 [US1] Build `src/features/finance/components/AlertsPanel.tsx` (active alerts list + acknowledge + per-kind mute via preferences)

**Checkpoint**: US1 fully functional & independently testable — forecasts render with uncertainty, emergency alerts fire & are traceable/silenceable, degradation path works. (MVP)

---

## Phase 4: User Story 2 — 顾问对话 + 审批闭环 (Priority: P2)

**Goal**: 自然语言顾问对话，数字/结论来自规则引擎（零幻觉），LLM 失败降级模板；高风险动作走 `提议→规则校验→用户审批→落库`，未审批绝不落库，apply 幂等。
**Independent Test**: `POST .../advisor/sessions/{id}/messages {content:'储蓄率怎么提'}` 回答中的数字能在 `citedFindings` 找到来源；顾问提议高风险动作返回 `proposalId`（`proposed`），未经 `PATCH approve` + `POST apply` 账目无变化；批准并 apply 后落库且重复 apply 幂等；LLM 失效时 `degraded=true` + 模板文本、200。

### Tests for User Story 2

- [ ] T022 [P] [US2] Write `tests/finance/approval.service.test.ts`: state machine (proposed→pending→approved→applied; rejected/expired terminal), apply idempotency (I8), `create_transaction` apply routes through `ledger.service` balance check (I2/不破坏 Phase 0 不变量), double rule-validation at apply (defensive)
- [ ] T023 [P] [US2] Write `tests/finance/advisor.service.test.ts`: assistant numbers traceable via `citedFindings` (I1), LLM-failure degradation `degraded=true` + template (I7/SC-005), high-risk suggestion creates `proposed` approval (not auto-committed, FR-004)

> Write tests FIRST; ensure they FAIL before implementation.

### Implementation for User Story 2

- [ ] T024 [P] [US2] Create `src/database/schema/finance/approvals.ts` (`finance_approvals`: id, userId, kind, payload jsonb, ruleValidation jsonb, status, proposedBy, approvedAt, appliedAt, appliedResult, expiresAt, timestamps; index `(userId,status)`) per data-model.md §2.6
- [ ] T025 [P] [US2] Create `src/database/schema/finance/advisor.ts` (`finance_advisor_sessions` + `finance_advisor_messages`: columns per §2.4/§2.5; message `citedFindings`/`degraded`/`proposalId` FK→approvals set null)
- [ ] T026 [US2] Register tables + relations in `src/database/schema/finance/index.ts` and `src/database/schema/finance/relations.ts` (session↔message↔approval) (depends T024, T025)
- [ ] T027 [US2] Generate migration: `pnpm drizzle-kit generate` (T024/T025 tables + indexes)
- [ ] T028 [P] [US2] Implement `src/repositories/finance/approval.repository.ts` (userId-scoped CRUD + status-transition guard + list-by-status)
- [ ] T029 [P] [US2] Implement `src/repositories/finance/advisor.repository.ts` (userId-scoped session/message CRUD, message create with citedFindings/proposalId)
- [ ] T030 [US2] Implement `src/services/finance/approval.service.ts`: state machine, `PROPOSAL_TTL` (default 7d) expiry→expired, kind whitelist + validators (`flag_transaction_anomaly`/`rebalance_suggestion`/`amend_finding_override`/`create_transaction`), double rule-validation (propose gate + apply defensive), idempotent apply routing `create_transaction` through `ledger.service` (决策 4/5/6, depends T028)
- [ ] T031 [US2] Implement `src/services/finance/advisor.service.ts`: gather fact layer (`computeFindingsFromData` + health score + forecast + trends) → AI SDK expression layer (`generateText`/`streamText`, clone `report.service.ts` red-line system prompt: "数字必须引用给定结论，严禁计算/推测/捏造"), LLM-failure→degraded template, context trim via `chat-context-trimmer.ts`, high-risk suggestion→create `proposed` approval + return `proposalId` (决策 7/8, depends T029, T030)
- [ ] T032 [US2] Add advisor/approval DTOs + Zod schemas to `src/app/api/finance/_lib/serialize.ts` and `src/app/api/finance/_lib/validation.ts` (depends T001, T002)
- [ ] T033 [P] [US2] Implement `src/app/api/finance/advisor/sessions/route.ts` (`POST` create / `GET` list) (§3.1/§3.2)
- [ ] T034 [US2] Implement `src/app/api/finance/advisor/sessions/[id]/messages/route.ts` (`GET` history / `POST` send → returns assistant message in `DisclaimerEnvelope`) (§3.3/§3.4)
- [ ] T035 [P] [US2] Implement `src/app/api/finance/approvals/route.ts` (`GET ?status=` list) (§4.1)
- [ ] T036 [US2] Implement `src/app/api/finance/approvals/[id]/route.ts` (`GET` detail / `PATCH approve|reject`) (§4.2/§4.3)
- [ ] T037 [US2] Implement `src/app/api/finance/approvals/[id]/apply/route.ts` (`POST` idempotent apply, 200 current-state on repeat, 422 if not approved/expired/rule-revalidation-failed) (§4.4)
- [ ] T038 [P] [US2] Add advisor/approval methods + DTOs to `src/features/finance/api.ts` and hooks to `src/features/finance/hooks/use-finance.ts` (invalidate approvals after approve/apply)
- [ ] T039 [US2] Build `src/features/finance/components/AdvisorChat.tsx` (session list + message thread + citedFindings expansion + inline proposal→approval hand-off)
- [ ] T040 [US2] Build `src/features/finance/components/ApprovalCenter.tsx` (pending list + approve/reject + apply + result + expiry display)

**Checkpoint**: US1 + US2 both independently functional — advisor answers are grounded & traceable, high-risk actions require explicit approval + idempotent apply, degradation works.

---

## Phase 5: User Story 3 — 多期趋势对比 + 趋势预警 (Priority: P3)

**Goal**: 多期报告关键指标（储蓄率/负债率/健康分）的时序与方向，显著恶化（如健康分连续下降）给出趋势预警。
**Independent Test**: 有多期报告后 `GET /api/finance/trends?metric=savings_rate,score` 返回时序 + direction + `deteriorating`，值与各期报告结论一致；连续 `TREND_DECLINE_PERIODS` 期下降时 `GET /api/finance/alerts` 出现 `trend_deterioration` 且可追溯。
**Depends on**: US1's alert infrastructure (T008/T012/T014) — reused; US1 need not be UI-complete.

### Tests for User Story 3

- [ ] T041 [P] [US3] Write `tests/finance/trend.service.test.ts`: series matches each period's report findings (SC-004), direction/deteriorating flags correct, money as decimal (I4)
- [ ] T042 [P] [US3] Extend `tests/finance/rules-engine.service.test.ts`: trend rules emit `metric='trend_*'` findings on consecutive decline (决策 10)

> Write tests FIRST; ensure they FAIL before implementation.

### Implementation for User Story 3

- [ ] T043 [US3] Add trend rules to `src/services/finance/rules-engine.service.ts`: pure functions over multi-period `FindingData` (savings/health consecutive `TREND_DECLINE_PERIODS` decline → `trend_*` finding; emergency cross-threshold) emitting existing `FindingData` shape (metric `trend_savings_decline`/`trend_health_decline`), reusable by trends + alerts (决策 10)
- [ ] T044 [US3] Implement `src/services/finance/trend.service.ts`: aggregate `listReports` (score/period) + `finance_rule_findings` per metric → ordered series + direction (↑/↓/flat) + `deteriorating` flag (决策 13, reuses report/finding repositories read-only)
- [ ] T045 [US3] Wire `trend_deterioration` alert kind into `src/services/finance/alert.service.ts` generation (reuse US1 infra, idempotent `(userId,kind,period)`) (depends T014)
- [ ] T046 [US3] Add trend DTO + schema to `src/app/api/finance/_lib/serialize.ts` and `src/app/api/finance/_lib/validation.ts`
- [ ] T047 [P] [US3] Implement `src/app/api/finance/trends/route.ts` (`GET ?metric=&periods=` in `DisclaimerEnvelope`) (§6.1)
- [ ] T048 [P] [US3] Add trend methods + DTOs to `src/features/finance/api.ts` and hooks to `src/features/finance/hooks/use-finance.ts`
- [ ] T049 [US3] Build `src/features/finance/components/TrendComparison.tsx` (multi-metric time series + direction + deterioration highlight + sourceRefs)

**Checkpoint**: All three stories independently functional; trends align with report conclusions, deterioration surfaces trend alerts.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cross-cutting FR enforcement + quality gates spanning multiple stories.

- [ ] T050 [P] Resolve `anomaly_flag` landing column for `flag_transaction_anomaly`: in `src/database/schema/finance/transactions.ts`, prefer reusing any existing remark/flag column; if none, add minimal `anomalyFlag varchar(20)` (nullable, backward-compatible) + migration (research.md §3.2)
- [ ] T051 [P] Audit FR-009 compliance: verify every forecast/alert/advisor/trend/health-score response appends `disclaimer` + `sourceRefs` (grep routes + serialize)
- [ ] T052 [P] Audit FR-007 traceability: verify no LLM-fabricated numbers stored as authoritative — all numeric conclusions route through `SourceRef`-backed paths
- [ ] T053 [P] Audit FR-010 isolation: confirm all new repositories/routes enforce `userId` scoping; cross-user resource access → 404 (not 403 leak)
- [ ] T054 Update `src/features/finance/README.md` with Phase 6 capabilities (forecast/alerts/advisor/approvals/trends) and the zero-hallucination/approval red lines
- [ ] T055 Run quality gates: `pnpm type-check` (only 007 files must be clean — baseline ~340 legacy errors are pre-existing) and `pnpm test --run --silent='passed-only' 'tests/finance/(forecast|alert|approval|advisor|trend)'`
- [ ] T056 Run `specs/007-ai-wealth-advisor/quickstart.md` §6 end-to-end smoke (SC-001..SC-005)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1; **blocks US2 & US3** (consume completed health score). **US1 may proceed in parallel** with T003/T004.
- **US1 (Phase 3)**: Depends on Phase 1 (serialize/validation scaffolding). MVP scope.
- **US2 (Phase 4)**: Depends on Phase 1 + Phase 2 (health score in fact layer). Approval service is self-contained; advisor depends on approval (T031←T030).
- **US3 (Phase 5)**: Depends on Phase 1 + Phase 2 + **US1 alert infrastructure** (T008/T012/T014) — reuses it for `trend_deterioration`.
- **Polish (Phase 6)**: After the stories it audits; T050 can run once US2 approval lands `flag_transaction_anomaly`.

### User Story Dependencies

- **US1 (P1)**: After Phase 1. No story deps. → **MVP**
- **US2 (P2)**: After Phase 1+2. Self-contained approval; advisor integrates approval (T030→T031). Independently testable.
- **US3 (P3)**: After Phase 1+2 + US1 alert infra. Adds trend rules + trend alert kind + trend service/UI. Independently testable.

### Within Each User Story

- Tests written FIRST and FAIL before implementation (TDD where tests included)
- Schema → repository → service → route → feature
- Migration generated after that story's schema files exist
- Story checkpoint reached before next priority

### Parallel Opportunities

- T001/T002 (Phase 1) — different files.
- T003/T004 can overlap US1 work (US1 doesn't need health score).
- Within US1: T005/T006 tests in parallel; T007/T008 schema in parallel; T011/T012 repos in parallel; T016/T017 routes in parallel; T019 feature in parallel with routes.
- Within US2: T022/T023 tests; T024/T025 schema; T028/T029 repos; T033/T035 routes; T038 feature.
- Within US3: T041/T042 tests; T047/T048 route+feature.
- Polish T050–T053 are mutually parallel (different concerns/files).

---

## Parallel Example: User Story 1

```bash
# Tests first (fail before impl):
Task: "T005 forecast.service.test.ts"
Task: "T006 alert.service.test.ts"

# Schema (different files, parallel):
Task: "T007 cash-flow-forecasts.ts"
Task: "T008 smart-alerts.ts"

# Repositories (different files, parallel):
Task: "T011 forecast.repository.ts"
Task: "T012 alert.repository.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational) — optional to overlap with US1, but do before US2/US3.
3. Complete Phase 3 (US1: forecast + emergency alert).
4. **STOP and VALIDATE** US1 independently (quickstart §6 steps 1–4).
5. Demo/deploy if ready — "事前预警" value already delivered.

### Incremental Delivery

1. Setup + Foundational → shared fact layer ready.
2. + US1 → forecast + alerts → validate → **MVP demo**.
3. + US2 → advisor + approval loop → validate → "可信可追溯顾问" demo.
4. + US3 → trends + trend alerts → validate → "成长曲线" demo.
5. Polish → FR-007/009/010 audits + quality gates.

### Parallel Team Strategy

1. Team completes Setup + Foundational together.
2. Once Foundational done:
   - Dev A: US1 (forecast + alerts)
   - Dev B: US2 (advisor + approval) — after A's alert infra only if US3 needs it; US2 itself is independent
   - Dev C: US3 (trends) — after US1 alert infra lands
3. Stories integrate independently; cross-story dep (US3↔US1 alerts) is the only coupling.

---

## Notes

- [P] = different files, no dependency on incomplete tasks.
- [Story] label maps task to US1/US2/US3 for traceability.
- Each user story is independently completable & testable; US3 reuses US1 alert infra (documented).
- Commit after each task or logical group; run that story's tests before moving on.
- Stop at any checkpoint to validate a story independently.
- Money everywhere `decimal(18,4)` via `src/services/finance/money.ts`; never floats.
- Zero-hallucination red line: numeric conclusions only from rules engine; LLM failure → degraded template.
