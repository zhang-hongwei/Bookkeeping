# Implementation Plan: 投资管理 (Phase 3)

**Branch**: `001-double-entry-ledger`（spec 目录为 `004-investment-management`；沿用 Phase 1/2「直接写、不分新分支」既有约定，计划文档与 Phase 0/1/2 同分支） | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-investment-management/spec.md`

## Summary

Phase 3 在 Phase 0 复式记账地基 + Phase 1 净资产快照 + Phase 2 资产/负债（含 `investment` 账户与 `finance_asset_details`）之上，把「投资」从「一笔简单估值」升级为**持仓 / 市值 / 收益 / 收益率 / 定投 IRR / 资产配置**的完整闭环。交付五件事：

1. **持仓与投资交易（复式正确性试金石）**：投资持仓 = `investment` 账户（复式锚点，`balance`=当前市值）+ 1:1 `finance_positions`（品种/数量/成本价/现价）。「现金买入持仓」复用 `transfer` 2 腿（现金 −金额、持仓 +成本、**净资产不变**）；卖出经 `disposal` 3 腿如实记录盈亏、净资产如实反映。
2. **行情现价 → 市值/盈亏/收益率**：接入第三方行情现价（A 股/公募基金/黄金），盈亏 = 市值 − 成本、盈亏率 = 盈亏 / 成本；现价变动经 `revaluation` 2 腿同步刷新持仓市值与净资产快照（FR-008）。
3. **行情降级（诚实估值）**：行情不可用/陈旧时降级为用户手动输入现价，并标注行情时间/来源，不展示虚假最新价（FR-004）。
4. **基金定投 + IRR**：记录多笔不同时点买入，汇总累计投入/当前市值，用考虑资金时间价值的 **XIRR** 计算年化收益，结果与主流基金 IRR 计算器一致（SC-002）。
5. **资产配置 + 集中度预警（分析走规则引擎）**：按股/债/金/现金等维度汇总投资占比并可视化；单一品种占比超阈值时经规则引擎给出集中度预警（仅提示，不代为操作）。

技术路线：在现有 Drizzle/PostgreSQL `finance` 领域上**增量**——新增 `finance_positions`（持仓 1:1）、`finance_instruments`（品种目录 + 行情缓存）、`finance_investment_trades`（投资交易语义层，1:N 挂持仓）、可选 `finance_dca_plans`（定投计划）；新增行情服务 `market-data.service`（可插拔 provider，默认免费 HTTP 行情源，失败降级手动）；新增纯函数 `irr.ts`（XIRR，bisection/Newton）；复用 `ledger.service`（事务 + 余额 + `refreshSnapshots`）、`net-worth.service`（投资类资产按市值计入，FR-008）、`rules-engine.service`（集中度预警，FR-007）。

**⚠️ 关键前置（硬依赖）**：Phase 2（003）**schema 已落库**（`investment` 账户类型、`revaluation`/`disposal` 交易类型、`principal_amount`/`interest_amount`、`finance_asset_details`、`__revaluation` 权益桶均已定义），但 **Phase 2 的服务/路由/UI 尚未实现**：`ledger.service.buildEntries` 仍只处理 `income/expense/transfer`（对 `revaluation`/`disposal` 抛错）、`ensureSystemEquityAccounts` 未创建 `__revaluation`、无 `asset.service`/`liability.service`、`_lib/validation.ts` 枚举未含 Phase 2 类型。Phase 3 的核心操作（卖出 `disposal`、现价同步 `revaluation`）**正是这两个原语的首要消费者**，因此本计划**承接 003 research R4/R5 的设计**，把 `revaluation`/`disposal` 的过账逻辑作为 Phase 3 必做项落地（详见 research.md R8）。Phase 0（账目平衡、转账不改净资产）与 Phase 1（净资产快照/曲线）必须已实现并达标。

## Technical Context

**Language/Version**: TypeScript 5.x · React 19.2 · Next.js 16.0.1 (App Router)
**Primary Dependencies**: Drizzle ORM 0.44.5 + drizzle-kit 0.31.4 · MUI v7 · Tailwind v4 · Zustand 5 · TanStack Query 5 · Zod 4 · recharts（配置饼图/趋势）· Supabase Auth（`@supabase/ssr` 会话 cookie）· **第三方行情 HTTP 源（NEEDS CLARIFICATION → research R3 定 provider/降级/缓存）**
**Storage**: PostgreSQL（Drizzle ORM；`pg` ^8.16 + `@neondatabase/serverless`）
**Testing**: Vitest（`pnpm test --run --silent='passed-only' '[file-pattern]'`）；纯函数（XIRR、盈亏/收益率、加权成本、复式拆分）单测优先；XIRR 用主流基金计算器做 known-answer 验收（SC-002）
**Target Platform**: Web（Next.js App Router），桌面/移动浏览器
**Project Type**: web-application（Next.js 全栈，App Router + API Routes）
**Performance Goals**: 持仓/总览首屏读账户 `balance` + 缓存现价（O(1)，不实时聚合）；现价更新后 `revaluation` 单事务 + `refreshSnapshots` 即时反映；XIRR 仅在请求时按持仓现金流计算（单持仓量级，毫秒级）
**Constraints**: 单币种 CNY（本阶段聚焦 A 股/公募基金/黄金，跨币种 QDII/港美股/外币 crypto 不在范围）；金额 `numeric(18,2)` 禁止浮点（统一走「分」整数，份额/净值另用足够精度的数值列）；账目平衡不变式不可违反；**现价必须带来源/时间戳，行情缺失不得展示虚假价**（设计 D3/P6）；数据按用户隔离；集中度预警仅提示、不代为交易（设计 §9 合规免责）
**Scale/Scope**: 持仓覆盖股票/基金/债券/黄金/ETF/REITs/数字货币（本阶段仅 CNY 标的估值，交易语义可录）；定投为多笔买入的聚合 + IRR；家庭多成员属 Phase 4、预算目标属 Phase 5

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**状态：N/A — 未发现可对照的原则。** `.specify/memory/constitution.md` 仍是未填写的模板（`[PRINCIPLE_1_NAME]` 等占位符），项目尚未通过 `/speckit-constitution` 建立正式宪章。因此无 gate 可违反，本检查不构成阻断。与 Phase 1/2 plan.md 结论一致。

**建议**：可运行 `/speckit-constitution` 建立宪章（候选原则已在 Phase 2 列出：复式平衡不可违反、金额禁止浮点、数据按用户隔离、低流动性估值须标注置信度；Phase 3 可追加「分析结论走规则引擎」「现价须带来源/时间戳」）。本计划以 Spec 的 Success Criteria（SC-001..SC-005）作为事实 gate。

**设计后复检（Phase 1 完成后）**：data-model.md 的复式平衡不变式（买入 transfer / 卖出 disposal / 现价 revaluation）、金额 `numeric(18,2)`、`user_id` 隔离、现价带 `priceSource`/`lastPriceAt`、XIRR/盈亏走确定性纯函数五项设计均与上述候选原则一致，无回归。

## Project Structure

### Documentation (this feature)

```text
specs/004-investment-management/
├── spec.md              # 功能规格
├── plan.md              # 本文件
├── research.md          # Phase 0：技术决策与研究（行情源/IRR/持仓建模/降级）
├── data-model.md        # Phase 1：领域模型（增量 schema 设计）
├── quickstart.md        # Phase 1：环境与运行指引
├── contracts/
│   └── api.md           # Phase 1：API 契约
└── tasks.md             # Phase 2 输出（/speckit-tasks，本命令不生成）
```

### Source Code (repository root)

```text
src/
├── database/
│   ├── schema/finance/
│   │   ├── accounts.ts          # 不变（investment 已在 ACCOUNT_TYPES/ASSET_ACCOUNT_TYPES）
│   │   ├── transactions.ts      # 不变（revaluation/disposal/principal/interest Phase 2 已加列）
│   │   ├── asset-details.ts     # 不变（investment 账户改由 positions 承载持仓细节）
│   │   ├── positions.ts         # 新增：持仓 1:1（instrument/quantity/costPrice/currentPrice缓存/来源/时间）
│   │   ├── instruments.ts       # 新增：品种目录 + 行情缓存（code/type/latestPrice/source/updatedAt/stale）
│   │   ├── investment-trades.ts # 新增：投资交易语义层 1:N 挂持仓（action/shares/price/fee/tax/transactionId/dcaPlanId）
│   │   ├── dca-plans.ts         # 新增（可选）：定投计划（instrument/amount/frequency/dayOfMonth/cashAccount/active）
│   │   ├── relations.ts         # 变更：accounts↔positions(1:1)、positions↔investment_trades(1:N)、instruments↔positions
│   │   └── index.ts             # barrel 更新
│   └── migrations/              # drizzle-kit generate 产物
├── repositories/finance/
│   ├── position.repository.ts        # 新增：持仓 CRUD（scoped，含按 instrumentType 聚合）
│   ├── instrument.repository.ts      # 新增：品种/行情缓存 upsert + 查（按 code）
│   └── investment-trade.repository.ts# 新增：投资交易 CRUD（scoped，按 positionId/时间范围）
├── services/finance/
│   ├── ledger.service.ts       # 变更：buildEntries 支持 revaluation/disposal（承接 003 R4/R5）；ensureSystemEquityAccounts +__revaluation
│   ├── balance.service.ts      # 不变（signedDeltaCents/assertBalanced 天然兼容）
│   ├── investment.service.ts   # 新增：registerPosition/buy/sell/dividend/reinvest（均复式 + 更新持仓 + refreshSnapshots）
│   ├── market-data.service.ts  # 新增：行情 provider 接口 + 默认 HTTP 源 + 缓存 + 降级（FR-004）
│   ├── irr.ts                  # 新增：纯函数 XIRR（bisection/Newton，按持仓现金流）
│   ├── pnl.ts                  # 新增：纯函数 盈亏/盈亏率/加权平均成本/资产配置占比
│   ├── net-worth.service.ts    # 不变（investment 已计入；revaluation 后 refreshSnapshots 自动反映市值）
│   └── rules-engine.service.ts # 变更：+ 集中度预警规则（单一品种占比超阈值 → rule_finding，FR-007）
├── app/api/finance/
│   ├── positions/route.ts            # 新增：GET/POST 建持仓（建 investment 账户 + positions）
│   ├── positions/[id]/route.ts       # 新增：GET/PATCH 持仓（改名称/置信度，不改 balance/数量）
│   ├── positions/[id]/buy/route.ts   # 新增：买入（transfer 2 腿 + 持仓数量/加权成本，US1-AC1）
│   ├── positions/[id]/sell/route.ts  # 新增：卖出（disposal 3 腿 + 持仓数量/已实现盈亏，US1-AC2）
│   ├── positions/[id]/dividend/route.ts # 新增：分红/派息/送股（现金分红 income / 送股 reinvest）
│   ├── positions/[id]/revalue/route.ts  # 新增：现价/估值更新（revaluation 2 腿 + 刷快照，FR-008）
│   ├── positions/[id]/performance/route.ts # 新增：持仓市值/成本/盈亏/盈亏率 + 定投 IRR（US2/US3）
│   ├── instruments/route.ts          # 新增：GET 品种目录 / POST 手动录入现价（FR-004 降级）
│   ├── instruments/[code]/quote/route.ts # 新增：拉取/刷新行情现价（market-data.service，D3）
│   ├── allocation/route.ts           # 新增：资产配置占比 + 集中度预警（FR-007，读 rule_finding）
│   ├── assets/route.ts ...           # （Phase 2 资产路由，若 003 未实现则一并补齐以支撑 investment 账户）
│   └── _lib/validation.ts      # 变更：+ 持仓/买入/卖出/分红/估值/行情/品种 Zod schema；投资交易 action 枚举
└── features/finance/              # UI 扩展
    ├── components/
    │   ├── PositionManager.tsx     # 新增：持仓登记/列表（数量/成本价/现价/市值/盈亏/盈亏率/来源标记）
    │   ├── TradeForm.tsx           # 新增：买入/卖出/分红表单（含手续费/印花税）
    │   ├── DcaOverview.tsx         # 新增：定投累计投入/市值/IRR（SC-002 对标天天基金）
    │   └── AllocationDashboard.tsx # 新增：资产配置饼图 + 集中度预警卡片
    ├── hooks/use-finance.ts        # 变更：+ 持仓/交易/行情/配置/IRR hooks
    └── api.ts                      # 变更：+ 持仓/交易/行情/配置 DTO 与客户端方法
```

**Structure Decision**: 复用 Phase 0/1/2 既定分层（`database/schema/finance` → `repositories/finance` → `services/finance` → `app/api/finance` → `features/finance`）。Phase 3 仅在同一 `finance/` 子领域内**增量**新增文件，不引入新的顶层结构。沿用「**账户 = 复式锚点**」模型——**每个持仓 = 一个 `investment` 账户**（`balance` = 当前市值，真相源，由分录维护），**新增 1:1 `finance_positions`** 承载品种/数量/成本价/现价缓存等投资语义，`finance_investment_trades` 作为「分录之上」的投资语义层（份额/单价/费用/税 + 关联 `transactionId`）记录买卖/分红/定投历史（IRR 现金流来源）。所有写操作（买入/卖出/分红/现价同步）仍走 `ledger.service` 单事务 + `refreshSnapshots`；分析结论（资产配置占比、集中度预警）走确定性纯函数 + 规则引擎（设计 P5）。

## Complexity Tracking

> Constitution Check 无违规。记录四处「有理由的复杂度」：

| 复杂点 | 为何需要 | 为何不采用更简单方案 |
|--------|----------|----------------------|
| 新增 `finance_positions` 1:1 挂 `investment` 账户（而非把份额/单价塞进 accounts 或 asset_details） | 持仓需品种代码/类型、数量、成本价、现价缓存、行情来源/时间戳，字段多且与「账户余额（市值）」职责不同；账户 `balance`=市值、positions 存「份额/成本/现价」语义，复式不变式不被破坏 | 全部加列到 `finance_accounts`——表臃肿、空列多、破坏账户职责单一；复用 `finance_asset_details`——它只存成本/置信度/估值历史，无份额/单价/品种维度，强行扩展会污染实物资产语义 |
| `finance_investment_trades` 语义层（挂在 finance_transactions 之上，而非用 transactions 直接表达） | 复式分录只认「账户 + debit/credit + 金额」，不知道份额/单价/手续费/印花税/分红类型；投资交易需这些语义才能算 IRR、加权成本、盈亏。语义层关联 `transactionId`，钱在分录、语义在 trades | 把份额/单价加列到 `finance_transactions`——污染通用交易表（非投资交易无此字段）；不记录只算——卖出后无法回溯每笔买卖，IRR 无法基于实际投入时点 |
| 行情服务 provider 接口 + 缓存 + 降级（而非直接每请求拉取或写死单一源） | 第三方行情不稳（设计 D3 ★★★），须可插拔换源、带缓存限流、失败降级为手动输入并标注来源/时间（FR-004，不展示虚假价） | 每次实时拉取——慢且易被限流/失败；写死单一源——源挂了全功能不可用；行情缺失时用旧价顶替——违反诚实估值（展示虚假最新价） |
| XIRR 纯函数（而非简单算术收益率 / 前端计算） | 定投是多笔不同时点投入，须考虑资金时间价值；简单算术平均会误导收益评估（Spec US3、SC-002 要求与主流基金计算器一致）。IRR 须确定性、可单测、可审计 | 算术收益率（总盈亏/总投入）——忽略投入时点，定投场景严重失真；交给 LLM/前端——金额结论须确定性（设计 P5 红线） |
