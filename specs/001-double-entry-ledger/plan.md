# Implementation Plan: 复式记账核心地基 (Phase 0)

**Branch**: `001-double-entry-ledger` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-double-entry-ledger/spec.md`

## Summary

Phase 0 交付一个**永远平衡的复式账本**：用户可管理资金账户（现金/储蓄/信用）、记录收支与转账、批量导入支付宝/微信账单、用自然语言记账。核心是不可妥协的复式不变式——任何交易后 `Σdebit == Σcredit`，转账不改净资产。本阶段不交付净资产仪表盘/资产/投资（留给 Phase 1+），只把"账目数据正确"的地基打牢。

技术路线：在现有 Drizzle/PostgreSQL 领域上新增 `finance` 子领域（accounts / categories / transactions + entries / bill-imports），余额由 entries 汇总并在同一数据库事务内原子维护一个物化 `balance` 列，导入与自然语言走 AI SDK + 预览确认。

## Technical Context

**Language/Version**: TypeScript 5.x · React 19.2.0 · Next.js 16.0.1 (App Router)
**Primary Dependencies**: Drizzle ORM 0.44.5 + drizzle-kit 0.31.4 · MUI v7 · Tailwind v4 · Zustand 5 · TanStack Query 5 · react-hook-form + Zod 4 · Vercel AI SDK 6 (`ai`, `@ai-sdk/openai`) · Clerk（认证）
**Storage**: PostgreSQL（Drizzle ORM；驱动 `pg` ^8.16 + `@neondatabase/serverless`）
**Testing**: Vitest（项目 `pnpm test` 为 Vitest 风格 `--run --silent`）— *实现前确认 vitest 已安装；若缺失则补装*
**Target Platform**: Web（Next.js App Router），桌面/移动浏览器
**Project Type**: web-application（Next.js 全栈，App Router + API Routes）
**Performance Goals**: 单笔手动记账 ≤ 15s；CSV 导入解析准确率 ≥ 95%；账目不平衡发生率 = 0
**Constraints**: 单币种 CNY（Phase 0）；复式平衡不变式为硬约束；数据按用户隔离；金额禁止浮点
**Scale/Scope**: Phase 0 仅账本核心（账户/分类/交易+分录/账单导入/自然语言记账），不含净资产仪表盘、资产负债明细、投资与实物资产

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**状态：N/A — 未发现可对照的原则。** `.specify/memory/constitution.md` 目前仍是未填写的模板（`[PRINCIPLE_1_NAME]` 等占位符），项目尚未通过 `/speckit-constitution` 建立正式宪章。因此无 gate 可违反，本检查不构成阻断。

**建议**：若希望后续阶段有正式质量 gate，可运行 `/speckit-constitution` 建立宪章（候选原则：「复式平衡不可违反」「金额禁止浮点」「数据按用户隔离」）。本计划以 Spec 的 Success Criteria（SC-001..SC-007）作为事实 gate。

**设计后复检（Phase 1 完成后）**：data-model.md 的复式约束、金额 `numeric`、`user_id` 隔离三项设计均与上述候选原则一致，无回归。

## Project Structure

### Documentation (this feature)

```text
specs/001-double-entry-ledger/
├── spec.md              # 功能规格
├── plan.md              # 本文件
├── research.md          # Phase 0：技术决策与研究
├── data-model.md        # Phase 1：领域模型（Drizzle schema 设计）
├── quickstart.md        # Phase 1：环境与运行指引
├── contracts/
│   └── api.md           # Phase 1：API 契约
└── tasks.md             # Phase 2 输出（/speckit-tasks，本命令不生成）
```

### Source Code (repository root)

```text
src/
├── database/
│   ├── schemas/
│   │   └── finance/                 # 新增：财务领域 schema
│   │       ├── accounts.ts          # accounts（现金/储蓄/信用）
│   │       ├── categories.ts        # categories（收支分类 + 自动归类规则）
│   │       ├── transactions.ts      # transactions + entries（复式分录）
│   │       ├── bill-imports.ts      # bill_imports + bill_import_rows（导入批次/去重）
│   │       ├── relations.ts         # 集中关系定义
│   │       └── index.ts             # barrel 导出
│   └── migrations/                  # drizzle-kit generate 产物
├── repositories/
│   └── finance/                     # 数据访问（account/category/transaction/import repo）
├── services/
│   └── finance/
│       ├── ledger.service.ts        # 记账/改/删（原子 + 平衡校验）
│       ├── balance.service.ts       # 余额维护 + 不变式校验/重算
│       ├── import.service.ts        # CSV 解析 + 去重 + 预览
│       └── nl-record.service.ts     # 自然语言 → 候选交易
├── app/
│   └── api/finance/
│       ├── accounts/route.ts
│       ├── categories/route.ts
│       ├── transactions/route.ts
│       └── import/route.ts
└── features/
    └── finance/                     # UI 特性模块
        ├── components/              # 账户/记账/导入/明细组件
        ├── hooks/                   # TanStack Query hooks
        └── store/                   # 局部 Zustand（记账草稿等）
```

**Structure Decision**: 复用项目既有分层（`database/schemas` → `repositories` → `services` → `app/api` → `features`）。财务领域独立收敛到各层下的 `finance/` 子目录，避免与现有 `mealRecords`/`chat` 等混杂；schema 走 barrel `index.ts` 并接入 `src/database/schema/index.ts`。

## Complexity Tracking

> Constitution Check 无违规，原则上无需填写。仅记录一处"有理由的复杂度"：

| 复杂点 | 为何需要 | 为何不采用更简单方案 |
|--------|----------|----------------------|
| 引入系统权益账户（`__income`/`__expense`）以满足复式平衡 | 让收入/支出也产生平衡分录，使恒等式 `Σ资产 = Σ负债 + Σ权益` 成立、净资产可由分录严格推导 | 单边记账（只记流水）无法保证转账不改净资产、无法做可审计的平衡校验——正是"伪记账"根因 |
