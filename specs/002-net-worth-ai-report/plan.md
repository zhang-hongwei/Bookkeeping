# Implementation Plan: 净资产闭环 + 首份 AI 报告 (Phase 1)

**Branch**: `001-double-entry-ledger`（spec 目录为 `002-net-worth-ai-report`；按用户「直接写、不分新分支」的指示，计划文档与 Phase 0 同分支） | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-net-worth-ai-report/spec.md`

## Summary

Phase 1 在 Phase 0 复式记账地基之上，跑通产品核心闭环「数据进 → 净资产 → AI 报告」，验证「我变富了吗 / 数字可信赖」的核心假设。交付四件事：
1. **净资产仪表盘 + 曲线**：由账户余额严格推导总资产/总负债/净资产，每日物化快照（`net_worth_snapshots`）驱动曲线，转账不改净资产。
2. **截图 OCR 记账**：复用多模态 AI，识别支付截图为候选交易，确认后落库（`source=ocr`）。
3. **规则引擎 + 月度 AI 报告**：确定性规则结论（储蓄率/负债率/应急金）→ LLM 表达 → 文档/Block 报告，**数字结论零幻觉**，LLM 失败降级模板。
4. **财务健康分**：规则结论加权得 0–100 + 雷达图，缺失维度降权不编造。

技术路线：在现有 Drizzle/PostgreSQL `finance` 领域上增量 3 张表（snapshots/rule_findings/ai_reports）+ `transactions.source` 加 `ocr`；复用 Phase 0 `balance.service`/`ledger.service`，净资产快照维护挂在记账事务之后；规则引擎为纯函数、报告走「事实层 → LLM 表达层」两段式。

**硬前置**：Phase 0 必须先实现并达标（账目平衡、转账不改净资产）。Phase 1 净资产/结论的正确性完全建立在 Phase 0 账目正确之上。

## Technical Context

**Language/Version**: TypeScript 5.x · React 19.2 · Next.js 16.0.1 (App Router)
**Primary Dependencies**: Drizzle ORM 0.44.5 + drizzle-kit 0.31.4 · MUI v7 · Tailwind v4 · Zustand 5 · TanStack Query 5 · Zod 4 · Vercel AI SDK 6（`ai`/`@ai-sdk/openai`，月报表达层 + 多模态 OCR）· Clerk（认证）· 文档/Block 体系（product-agent + AI Pipeline，报告正文承载）
**Storage**: PostgreSQL（Drizzle ORM；`pg` ^8.16 + `@neondatabase/serverless`）
**Testing**: Vitest（`pnpm test --run --silent='passed-only'`）
**Target Platform**: Web（Next.js App Router），桌面/移动浏览器
**Project Type**: web-application（Next.js 全栈，App Router + API Routes）
**Performance Goals**: 仪表盘首屏读快照呈现净资产（非全量聚合）；OCR 核心字段准确率 ≥ 90%；规则结论确定性可复现
**Constraints**: 单币种 CNY；零幻觉红线（数字结论只来自规则引擎）；LLM 失败须降级；金额 `numeric(18,2)` 禁止浮点；数据按用户隔离
**Scale/Scope**: 净资产仅含现金/储蓄/信用（投资/实物属 Phase 2/3）；不含家庭（Phase 4）、预算目标（Phase 5）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**状态：N/A — 未发现可对照的原则。** `.specify/memory/constitution.md` 仍是未填写的模板（`[PRINCIPLE_1_NAME]` 等占位符），项目尚未通过 `/speckit-constitution` 建立正式宪章。因此无 gate 可违反，本检查不构成阻断。

**建议**：可运行 `/speckit-constitution` 建立宪章（候选原则：「复式平衡不可违反」「金额禁止浮点」「数据按用户隔离」「AI 数字结论必须来自规则引擎」）。本计划以 Spec 的 Success Criteria（SC-001..SC-007）作为事实 gate。

**设计后复检（Phase 1 完成后）**：data-model.md 的快照一致不变式、金额 `numeric`、`user_id` 隔离、规则结论零幻觉四项设计均与上述候选原则一致，无回归。

## Project Structure

### Documentation (this feature)

```text
specs/002-net-worth-ai-report/
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
│   ├── schemas/finance/
│   │   ├── net-worth-snapshots.ts   # 新增：每日净资产快照
│   │   ├── rule-findings.ts         # 新增：规则引擎确定性结论
│   │   ├── ai-reports.ts            # 新增：AI 月报元数据
│   │   ├── transactions.ts          # 变更：source enum += ocr
│   │   └── index.ts                 # barrel 更新
│   └── migrations/                  # drizzle-kit generate 产物
├── repositories/finance/
│   ├── net-worth.repository.ts      # 快照读写/区间查询
│   ├── finding.repository.ts        # findings 读写
│   └── report.repository.ts         # ai_reports 读写
├── services/finance/
│   ├── net-worth.service.ts         # 净值推导 + 快照维护/回填/校验自愈（挂 ledger 事务）
│   ├── rules-engine.service.ts      # 纯函数：findings + 健康分（加权/降权）
│   ├── report.service.ts            # findings→LLM 表达→文档/Block + sourceDataHash + 降级
│   └── ocr-record.service.ts        # 多模态 OCR → 候选交易 + confidence
├── app/api/finance/
│   ├── net-worth/route.ts           # 仪表盘 + 今日变化
│   ├── net-worth/snapshots/route.ts # 曲线（区间）
│   ├── findings/route.ts            # 规则结论
│   ├── health-score/route.ts        # 健康分 + 雷达图
│   ├── reports/route.ts             # 月报生成/列表
│   ├── reports/[id]/route.ts        # 报告详情/失效检测
│   └── ocr-record/route.ts          # 截图 OCR 候选
└── features/finance/                # UI 扩展
    ├── components/                  # 净资产仪表盘/曲线、OCR 入口、月报视图、健康雷达
    ├── hooks/                       # TanStack Query hooks
    └── store/                       # 局部 Zustand
```

**Structure Decision**: 复用 Phase 0 既定分层（`database/schemas/finance` → `repositories/finance` → `services/finance` → `app/api/finance` → `features/finance`）。Phase 1 仅在同一 `finance/` 子领域内**增量**新增文件，不引入新的顶层结构。净资产快照维护通过服务层钩子挂在 Phase 0 `ledger.service` 的事务之后，避免跨领域耦合。

## Complexity Tracking

> Constitution Check 无违规。记录两处「有理由的复杂度」：

| 复杂点 | 为何需要 | 为何不采用更简单方案 |
|--------|----------|----------------------|
| 净资产日快照物化表（`net_worth_snapshots`）+ 变更重算 + 历史回填 | 曲线随明细增长仍需 O(1) 读取；「今日变化」、历史回填、与交易编辑联动都依赖稳定的日级物化 | 实时聚合全量 entries 做曲线——明细多后变慢、今日变化需扫全表；PG 物化视图刷新时机难与事务对齐 |
| 月报两段式（事实层 findings → LLM 表达层）+ LLM 失败模板降级 + sourceDataHash 失效 | 兑现「数字结论零幻觉 + 报告可用性不依赖 LLM + 数据变化可检测」三项硬约束 | LLM 端到端生成——幻觉不可控（违反 SC-003）；纯模板——无个性化、失去差异化 |
