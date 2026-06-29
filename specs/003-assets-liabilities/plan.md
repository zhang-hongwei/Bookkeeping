# Implementation Plan: 资产/负债完整化 (Phase 2)

**Branch**: `001-double-entry-ledger`（spec 目录为 `003-assets-liabilities`；沿用 Phase 1「直接写、不分新分支」既有约定，计划文档与 Phase 0/1 同分支） | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-assets-liabilities/spec.md`

## Summary

Phase 2 在 Phase 0 复式记账地基 + Phase 1 净资产快照/曲线之上，把「总资产 − 总负债 = 净资产」做全——让净资产真正反映一个中国家庭的「全部家底」（房产/车辆/贷款/信用卡/借款），而不只是现金。交付五件事：

1. **完整资产明细**：在现有 `real_asset` / `investment` 账户上挂「资产明细表」（成本、估值来源、**估值置信度高/中/低**、估值历史），实物资产估值带置信度、可回溯。
2. **完整负债明细 + 贷款账户类型**：新增 `mortgage/car_loan/consumer_loan/borrowing` 负债账户类型 + 「负债明细表」（本金、剩余本金、利率、月供、到期日、已还金额）；信用卡承载账单日/还款日。
3. **贷款还款（复式正确性试金石）**：新增 `repayment` 交易类型，一笔还款正确拆分本金/利息——本金减负债、本金+利息合计减现金、利息计入支出、资产端不变，账目恒等。
4. **信用卡账单周期**：账单日/还款日 + 按周期汇总本期账单/已还/待还 + 临近还款日提示（不自动代扣、不存凭证）。
5. **诚实净资产的曲线呈现**：低流动性「估值点」（房产/车辆）在曲线上单独标记，支持「仅高流动性资产」/「全部资产」视图切换；估值更新/负债变动后同步刷新快照。

技术路线：在现有 Drizzle/PostgreSQL `finance` 领域上**增量**——`ACCOUNT_TYPES` += 4 个贷款类型、`TRANSACTION_TYPES` += `repayment`/`revaluation`/`disposal`、`transactions` += 本金/利息拆分列、新增 `__revaluation` 系统权益账户、新增 `finance_asset_details` / `finance_liability_details` 两张 1:1 明细表；复用 Phase 0/1 的 `balance.service`（不变式）/`ledger.service`（事务+余额+快照刷新），**关键改造**：`net-worth.service` 的负债识别从「`type==='credit'`」扩展为 `LIABILITY_ACCOUNT_TYPES`，并支持流动性视图。

**硬前置**：Phase 0（账目平衡、转账不改净资产）与 Phase 1（净资产快照/曲线机制）必须已实现并达标。Phase 2 的资产/负债估值、还款正确性、曲线平滑全部建立在 Phase 0/1 之上。

## Technical Context

**Language/Version**: TypeScript 5.x · React 19.2 · Next.js 16.0.1 (App Router)
**Primary Dependencies**: Drizzle ORM 0.44.5 + drizzle-kit 0.31.4 · MUI v7 · Tailwind v4 · Zustand 5 · TanStack Query 5 · Zod 4 · recharts（净资产曲线）· Supabase Auth（认证，`@supabase/ssr` 会话 cookie）
**Storage**: PostgreSQL（Drizzle ORM；`pg` ^8.16 + `@neondatabase/serverless`）
**Testing**: Vitest（`pnpm test --run --silent='passed-only' '[file-pattern]'`）；纯函数（金额/分录拆分/账单周期聚合）单测优先
**Target Platform**: Web（Next.js App Router），桌面/移动浏览器
**Project Type**: web-application（Next.js 全栈，App Router + API Routes）
**Performance Goals**: 仪表盘/曲线首屏读快照（O(1)，不实时聚合）；流动性视图从 `breakdown` 即时派生，无额外查询
**Constraints**: 单币种 CNY；金额 `numeric(18,2)` 禁止浮点（统一走「分」整数运算）；账目平衡不变式不可违反；估值必须带置信度、低流动性估值不污染主曲线（设计 D2/P6）；数据按用户隔离；信用卡不存凭证、不自动代扣
**Scale/Scope**: 资产含现金/存款/投资(简单估值)/房产/车辆/数字货币；负债含房贷/车贷/信用卡/消费贷/借款；投资持仓细节属 Phase 3、家庭属 Phase 4、预算目标属 Phase 5

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**状态：N/A — 未发现可对照的原则。** `.specify/memory/constitution.md` 仍是未填写的模板（`[PRINCIPLE_1_NAME]` 等占位符），项目尚未通过 `/speckit-constitution` 建立正式宪章。因此无 gate 可违反，本检查不构成阻断。与 Phase 1 plan.md 结论一致。

**建议**：可运行 `/speckit-constitution` 建立宪章（候选原则：「复式平衡不可违反」「金额禁止浮点」「数据按用户隔离」「低流动性估值须标注置信度」）。本计划以 Spec 的 Success Criteria（SC-001..SC-005）作为事实 gate。

**设计后复检（Phase 1 完成后）**：data-model.md 的复式平衡不变式（还款 3 腿拆分）、金额 `numeric(18,2)`、`user_id` 隔离、估值置信度四项设计均与上述候选原则一致，无回归。

## Project Structure

### Documentation (this feature)

```text
specs/003-assets-liabilities/
├── spec.md              # 功能规格
├── plan.md              # 本文件
├── research.md          # Phase 0：技术决策与研究
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
│   │   ├── accounts.ts            # 变更：ACCOUNT_TYPES += mortgage/car_loan/consumer_loan/borrowing；+ LIABILITY_ACCOUNT_TYPES
│   │   ├── transactions.ts        # 变更：TRANSACTION_TYPES += repayment/revaluation/disposal；+ principalAmount/interestAmount
│   │   ├── asset-details.ts       # 新增：资产明细（成本/估值来源/置信度/估值历史）1:1
│   │   ├── liability-details.ts   # 新增：负债明细（本金/剩余本金/利率/月供/到期/已还/账单周期）1:1
│   │   ├── relations.ts           # 变更：accounts ↔ asset/liability details
│   │   └── index.ts               # barrel 更新
│   └── migrations/                # drizzle-kit generate 产物
├── repositories/finance/
│   ├── account.repository.ts      # 变更：list 支持负债类型过滤（默认沿用）
│   ├── asset-detail.repository.ts # 新增：资产明细 CRUD（scoped）
│   └── liability-detail.repository.ts # 新增：负债明细 CRUD（scoped）
├── services/finance/
│   ├── ledger.service.ts          # 变更：+ recordRepayment（本金/利息拆分 3 腿 + 更新 paidAmount + refreshSnapshots）
│   ├── asset.service.ts           # 新增：登记/更新资产、revalueAsset、disposeAsset（均复式 + 刷新快照）
│   ├── liability.service.ts       # 新增：登记/更新负债、getCreditCardPeriod（账单聚合）、还款提示
│   └── net-worth.service.ts       # 变更：负债识别改 LIABILITY_ACCOUNT_TYPES；+ 流动性视图派生
├── app/api/finance/
│   ├── assets/route.ts            # 新增：GET/POST 资产登记
│   ├── assets/[id]/route.ts       # 新增：PATCH 资产更新
│   ├── assets/[id]/revalue/route.ts  # 新增：估值更新（FR-008）
│   ├── assets/[id]/dispose/route.ts  # 新增：资产处置（Edge Case）
│   ├── liabilities/route.ts       # 新增：GET/POST 负债登记
│   ├── liabilities/[id]/route.ts  # 新增：PATCH 负债更新
│   ├── liabilities/[id]/repay/route.ts  # 新增：还款（FR-004，本金/利息拆分）
│   ├── liabilities/[id]/billing/route.ts # 新增：信用卡账单周期（FR-006）
│   ├── net-worth/route.ts         # 变更：+ ?view=high|all 流动性视图（FR-003）
│   ├── net-worth/snapshots/route.ts # 变更：+ ?view=high|all
│   └── _lib/validation.ts         # 变更：+ 资产/负债/还款/估值/账单 Zod schema；账户/交易类型枚举扩展
└── features/finance/              # UI 扩展
    ├── components/
    │   ├── AssetManager.tsx       # 新增：资产登记/列表（含估值置信度标记）
    │   ├── LiabilityManager.tsx   # 新增：负债登记/列表（含贷款明细 + 信用卡账单）
    │   └── NetWorthDashboard.tsx  # 变更：+ 流动性视图切换 + 估值点标记
    ├── hooks/use-finance.ts       # 变更：+ 资产/负债/还款/账单 hooks
    └── api.ts                     # 变更：+ 资产/负债/还款/账单 DTO 与客户端方法
```

**Structure Decision**: 复用 Phase 0/1 既定分层（`database/schema/finance` → `repositories/finance` → `services/finance` → `app/api/finance` → `features/finance`）。Phase 2 仅在同一 `finance/` 子领域内**增量**新增文件，不引入新的顶层结构。资产/负债沿用「账户 = 复式锚点」既有模型——账户表承载 `balance`（真相源）与类型，**新增 1:1 明细表**承载成本/利率/月供/置信度等元数据，避免账户表臃肿、保持复式不变式不被破坏。所有写操作（还款/估值/处置）仍走 `ledger.service` 的单事务 + `refreshSnapshots` 钩子。

## Complexity Tracking

> Constitution Check 无违规。记录三处「有理由的复杂度」：

| 复杂点 | 为何需要 | 为何不采用更简单方案 |
|--------|----------|----------------------|
| 新增 `repayment`/`revaluation`/`disposal` 三种交易类型 + `__revaluation` 系统权益账户 | 还款须本金/利息 3 腿拆分（复式正确性试金石）；资产估值更新须经分录才能改 `balance`（不变式）；处置须区分实现损益。三者无法套用 income/expense/transfer，必须独立语义 | 套用 transfer——无法表达本金/利息拆分与损益；直接改 balance 绕过分录——破坏复式不变式（账目不可审计） |
| 新增 `finance_asset_details` / `finance_liability_details` 1:1 明细表（而非塞进 accounts 表） | 资产需成本/估值来源/置信度/估值历史；负债需本金/利率/月供/到期/已还/账单周期，字段多且类型相关，与账户余额职责分离 | 全部加列到 `finance_accounts`——表臃肿、空列多（creditLimit 模式不可扩展到 10+ 字段）；独立 assets/liabilities 表不挂账户——破坏复式锚点、双写易漂移 |
| `net-worth.service` 负债识别从 `type==='credit'` 扩展为 `LIABILITY_ACCOUNT_TYPES` | Phase 0/1 只有 credit 一种负债，硬编码；Phase 2 新增 4 种贷款类型必须一并计入总负债，否则净资产失真 | 维持硬编码 + 各处 if——重复、易漏；保留 credit-only——贷款不计负债，违反 SC-003 |
