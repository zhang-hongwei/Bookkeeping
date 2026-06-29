# Implementation Plan: 预算与目标 (Phase 5)

**Branch**: `001-double-entry-ledger`（spec 目录为 `006-budget-goals`；沿用既有「各 Phase 同分支、独立 spec 目录」约定，与 002/003/004/005 一致） | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-budget-goals/spec.md`

> 本计划由 `/speckit-plan` 生成。Phase 0 研究 → [research.md](./research.md)；Phase 1 设计 → [data-model.md](./data-model.md)、[contracts/api.md](./contracts/api.md)、[quickstart.md](./quickstart.md)。tasks.md 由后续 `/speckit-tasks` 生成。

## Summary

Phase 5 在 Phase 0–4 完整个人财务模型之上，引入**主动控制**层：分类预算（实时已用/剩余 + 超支预警）与储蓄目标（进度 + 预计达成时间）。产品从「事后看账」升级为「事中管控 + 未来可见」。

交付两件事（对应《AI 财富管家》Phase 5）：
1. **分类预算**：按分类（含父子子树）设周期预算（默认月度，支持周/年），实时计算已用/剩余/状态（正常/即将超支/已超支），达阈值或超支时预警；跨周期自动重置、历史可回溯、改额度不污染历史。
2. **储蓄目标**：设定目标金额 +（可选）截止日，按显式口径（手动/关联账户/总净资产）显示进度，按近 N 月平均结余估算预计达成时间；负/零结余明确「无法达成」，不产出虚假乐观。

**技术路线**：在现有 Drizzle/PostgreSQL `finance` 领域上**增量** 3 张表（`finance_budgets` / `finance_budget_periods` / `finance_goals`）+ 索引 + relations，**不改任何既有表列**（零侵入 Phase 0–4）。预算「已用」、目标「当前金额」、ETA **全部为派生值**（来自 transactions/accounts/净资产），**无物化 live 列**——单一事实源由构造保证 SC-001（不一致发生率=0）。超支预警为确定性纯函数 `BudgetAlert`（同构规则引擎 `FindingData`），目标 ETA 为明确算法（近 N 月均值 + ceil），均**可复现、可逐项追溯**；LLM 仅做个性化表达、不编造金额（SC-004）。

**关键设计取舍**（详见 [research.md](./research.md)）：① 单一事实源（读时现算）替代物化已用列，根除一致性漂移；② 已用按分类**子树**汇总（父子预算），单预算内零双计；③ 超支预警用独立 `BudgetAlert`（保留 category 维度），不套用 period 维度的 `finance_rule_findings`；④ 目标进度**显式 progressBasis**（manual/linked/net_worth）消除歧义；⑤ ETA 负/零结余→`unreachable`、无截止日不估 ETA；⑥ 历史 `finance_budget_periods` 快照锁定 `amountSnapshot`，改额度不串扰历史。

**硬前置**：Phase 0（账目平衡/分类/交易）与 Phase 1（净资产/结余口径）须已达标。Phase 5 的数值正确性完全建立在 Phase 0 账目正确之上。

## Technical Context

**Language/Version**: TypeScript 5.x · React 19.2 · Next.js 16.0.1 (App Router)
**Primary Dependencies**: Drizzle ORM 0.44.5 + drizzle-kit 0.31.4 · MUI v7 · Tailwind v4 · Zustand 5 · TanStack Query 5 · Zod 4 · Vercel AI SDK 6（月报表达层，复用 Phase 1）· **Supabase Auth**（`@supabase/ssr`，finance 全域认证；userId = Supabase user id 字符串）
**Storage**: PostgreSQL（Drizzle ORM；`@neondatabase/serverless`）
**Testing**: Vitest（`pnpm test --run --silent='passed-only' '[pattern]'`）
**Target Platform**: Web（Next.js App Router），桌面/移动浏览器
**Project Type**: web-application（Next.js 全栈，App Router + API Routes）
**Performance Goals**: 预算已用/目标进度读时现算，O(用户分类数 + 周期内支出笔数)；预警汇总 O(active 预算数)；目标 ETA O(N 月汇总)
**Constraints**: 单币种 CNY；金额 `numeric(18,2)` 禁浮点（运算经 `money.ts` 整数分）；预算已用仅计 `type='expense'`（transfer 等排除）；ETA 负/零结余→`unreachable` 无虚假日期；预算/目标按 userId 隔离；Phase 5 核心为个人维度（家庭预算延后）
**Scale/Scope**: 个人预算/目标（家庭维度 D7 延后）；预算数典型 ≤ 20；目标数典型 ≤ 10；ETA 窗口 N 默认 3（可配 3–6）

> 无 NEEDS CLARIFICATION 残留——全部 Technical Context 项已确定。11 项设计决策见 [research.md](./research.md)（D1–D11）。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**状态：N/A — 未发现可对照的原则。** `.specify/memory/constitution.md` 仍是未填写的模板（`[PRINCIPLE_1_NAME]` 等占位符），项目尚未通过 `/speckit-constitution` 建立正式宪章。因此无 gate 可违反，本检查不构成阻断（与 Phase 1/002、Phase 4/005 计划一致）。

**建议**：可运行 `/speckit-constitution` 建立宪章。本特性自然映射的候选原则——「复式平衡不可违反」「金额禁止浮点」「数据按用户隔离」「AI 数字结论必须来自规则引擎（零幻觉）」「单一事实源」——均已在设计中兑现。本计划以 Spec 的 Success Criteria（SC-001..SC-005）作为事实 gate。

**设计后复检（Phase 1 完成后）**：data-model.md 的不变量 I1（单一事实源/零物化）、I2（金额 decimal+cents）、I3（历史周期不可变）、I4（确定性结论）、I5（不产出虚假乐观 ETA）、I6（用户隔离）、I7（支出-only 计入）、I8（单预算零双计）与 contracts/api.md 的 C2（派生值来自规则层）、C3（unreachable 无假日期）、C6（改额度不回溯历史）均与上述候选原则一致，无回归。

## Project Structure

### Documentation (this feature)

```text
specs/006-budget-goals/
├── spec.md              # 功能规格
├── plan.md              # 本文件
├── research.md          # Phase 0：11 项技术决策（D1–D11）
├── data-model.md        # Phase 1：领域模型增量（3 表 + 不变量 I1–I8）
├── quickstart.md        # Phase 1：环境与端到端运行指引
├── contracts/
│   └── api.md           # Phase 1：预算/目标 API 契约
├── checklists/          # 既有
└── tasks.md             # Phase 2 输出（/speckit-tasks，本命令不生成）
```

### Source Code (repository root)

```text
src/
├── database/
│   ├── schema/finance/
│   │   ├── budgets.ts                   # 新增：finance_budgets + finance_budget_periods
│   │   ├── goals.ts                     # 新增：finance_goals
│   │   ├── relations.ts                 # 变更：增 budgets/budgetPeriods/goals 关系
│   │   └── index.ts                     # barrel 更新
│   └── migrations/                      # drizzle-kit generate 产物（增量，3 新表）
├── repositories/finance/
│   ├── budget.repository.ts             # 预算 CRUD + 历史周期快照读写 + 查重
│   └── goal.repository.ts              # 目标 CRUD
├── services/finance/
│   ├── budget.service.ts                # 周期边界 + 子树已用汇总 + BudgetAlert（纯函数 + 取数）
│   ├── goal.service.ts                  # 进度口径 + getMonthlySurplusSeries + computeGoalProgress(ETA)
│   ├── money.ts                         # 既有：toCents/fromCents/addCents（复用）
│   └── ledger.service.ts                # 变更：写交易后 best-effort 回带 budgetAlerts（D9，非阻塞）
├── app/api/finance/
│   ├── _lib/
│   │   ├── auth.ts                      # 既有：requireUserId
│   │   ├── validation.ts                # 变更：+ budget/goal schemas
│   │   └── serialize.ts                 # 变更：+ budget/goal/alert DTOs
│   ├── budgets/
│   │   ├── route.ts                     # POST 建 / GET 列表（含当前周期状态）
│   │   ├── alerts/route.ts              # GET 当前周期预警汇总
│   │   └── [id]/
│   │       ├── route.ts                 # GET 详情 / PATCH / DELETE
│   │       └── periods/route.ts         # GET 历史周期快照（可按需回填）
│   ├── goals/
│   │   ├── route.ts                     # POST 建 / GET 列表（含 ETA）
│   │   └── [id]/
│   │       ├── route.ts                 # GET 详情 / PATCH / DELETE
│   │       └── progress/route.ts        # GET 进度 + ETA 明细（surplusSeries）
│   └── transactions/route.ts            # 变更：响应可选附 budgetAlerts（D9）
└── features/budget-goals/               # UI 新增
    ├── components/                      # 预算设置/进度环/超支提示、目标卡片/ETA
    └── hooks/                           # TanStack Query hooks

tests/finance/
├── budget.service.test.ts               # 新增（I1/I2/I4/I7/I8 + SC-001/SC-004/SC-005）
└── goal.service.test.ts                 # 新增（I4/I5 + SC-003）
```

**Structure Decision**: 复用 Phase 0–4 既定分层（`database/schema/finance` → `repositories/finance` → `services/finance` → `app/api/finance` → `features/`）。Phase 5 仅在 `finance/` 子域内**增量**新增文件，**不改任何既有表列**（零侵入、可独立上线/回退）。预算/目标完全通过**只读消费**既有 transactions/accounts/净资产数据实现；写后预警回带挂在 `ledger.service` 交易写入之后、best-effort 非阻塞（D9），避免预算子系统故障污染核心账目写入。

## Complexity Tracking

> Constitution Check 无违规。记录四处「有理由的复杂度」（详见 [research.md](./research.md) 对应决策）：

| 复杂点 | 为何需要 | 为何不采用更简单方案 |
|--------|----------|----------------------|
| 预算周期历史快照表（`finance_budget_periods`，锁 `amountSnapshot`） | 历史周期需可回溯（FR-003/SC-005）；用户改额度后历史额度须定格不变（edge「预算调整：历史不变」） | 只存当前额度——改额度即污染历史，违背 SC-005；`amountHistory` jsonb——查询/索引难、与快照哲学不一 |
| 读时现算 spent（单一事实源，无物化 live 列） | SC-001「不一致发生率=0」由构造保证（无可漂移的物化已用列）；「实时」每次读即最新 | 写交易时同步物化 spent——双源一致性风险，违背 SC-001 |
| 独立 `BudgetAlert`（确定性纯函数，category 维度） | 现有 `finance_rule_findings` 是 period 维度无 category 列；预算超支须按分类表达；兑现 US3「规则引擎负责准确，LLM 负责表达」 | 扩展 `FINDING_METRICS` + 给 rule_findings 加 categoryId——改既有表/枚举、语义混杂；LLM 判断超支——违背 SC-004 |
| 目标进度显式 `progressBasis`（manual/linked/net_worth） | edge case 要求「消除歧义」；不同目标语义不同（买房首付≠总身家、抽象目标无对应账户） | 只支持 linked——强制先建账户门槛高；默认 net_worth——误导（以为存了 X% 其实含全部身家） |
