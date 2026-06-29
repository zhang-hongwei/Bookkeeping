# Implementation Plan: 高级分析 (Phase 7)

**Branch**: `008-advanced-analytics` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-advanced-analytics/spec.md`

> ⚠️ **最远期阶段**：本计划锁定「做什么 / 为什么 / 可信边界 / 架构」，**不预先固化易变口径**（中国个税/社保/房产规则、长期模拟假设参数）。具体口径在临近实施时（结合当时法规与真实数据）于 `research.md` 细化，本计划仅给出**确定性引擎的形状**与**决策框架**。

## Summary

Phase 7 在 Phase 0–6 的完整财务模型（复式账目、净资产、资产/负债、投资持仓、规则引擎、家庭维度、预算/目标）之上，新增**四类高级分析**，全部遵循全域红线——**确定性引擎/规则负责一切数字结论，LLM 仅做解读与表达**：

1. **What-if 情景模拟**（P1）：失业/降薪/加息/大额支出等假设下，对净资产曲线、应急金月数、目标达成的确定性推演；结果与基线同口径、可复现。
2. **中国个税估算**（P2）：按当期个税规则估算应纳税额，支持年终奖单独/合并计税对比，给出规则化节税方向（显著标注免责）。
3. **退休模拟**（P3）：按储蓄/投资节奏与退休假设推演退休资产与可持续性，显著标注关键假设与不确定性。
4. **组合优化方向**（P4）：在 Phase 3 资产配置/集中度预警之上，识别配置偏离并给方向性建议（非具体买卖指令）。

**技术路线**（沿用 001–006 既定架构）：每个分析 = **一个确定性纯函数引擎**（导出供单测，零幻觉、可复现）+ **服务层取数** + **可选 LLM 解读层**（消费引擎产出的结构化结果，禁止编造数字）。引擎结果带 `engineVersion` + `assumptions` + `disclaimers` 溯源，落表可追溯。

## Technical Context

**Language/Version**: TypeScript 5.x（Next.js 16 全栈）
**Primary Dependencies**: Next.js 16、React 19、MUI v7、Tailwind、Drizzle ORM、PostgreSQL（Supabase）、Zod、react-hook-form、TanStack Query、Zustand、dayjs
**Storage**: PostgreSQL（Supabase）via Drizzle —— `src/database/schema/finance/` 增量新表
**Testing**: Vitest（`pnpm test --run --silent='passed-only' '<pattern>'`）；纯函数引擎首选单测（确定性、可复现）
**Target Platform**: Web（Next.js App Router，SSR/CSR 混合）
**Project Type**: web-app（单仓 Next.js，`finance` 领域增量）
**Performance Goals**: 退休模拟最长 40 年 × 12 月 = 480 点投影，**纯内存循环**完成（< 50ms），不逐月查库；其余分析即时计算（< 200ms）
**Constraints**: 所有数字结论 100% 来自确定性引擎/规则，可追溯、可复现；LLM 不得编造数字；显著标注「非投资/税务/法律建议」+「需以当期法规为准」；数据不足明确降级；按用户（及家庭成员）隔离
**Scale/Scope**: 单用户视角；个人 +（若启用 Phase 4）家庭维度；4 个分析引擎、5 张新表、4 组 API、4 个前端面板

> **NEEDS CLARIFICATION（Phase 0 解决，见 research.md）**
>
> - **NC1 — 个税规则口径与版本**：按哪一纳税年度的规则？七级累进 + 速算扣除 + 年终奖单独/合并 + 专项附加扣除目录的具体取值。
> - **NC2 — What-if 投影模型**：如何在确定性模型上叠加情景假设（降薪/加息/大额支出）推演净资产/应急金/目标？与 Phase 6 目标预计达成算法如何同口径。
> - **NC3 — 退休模拟假设**：回报率/通胀/支出/提取率的默认值与取值来源；长期不确定性的表达方式。
> - **NC4 — 组合优化方向方法**：目标配置区间（band）方法论、资产类别分类法、偏离阈值；与 Phase 3 allocation/concentration 的关系。
> - **NC5 — LLM 解读层边界**：LLM 如何消费引擎结构化输出；prompt 契约；如何保证零编造。
> - **NC6 — 数据不足降级**：每类分析的降级触发条件与提示口径。
> - **NC7 — 可复现/可追溯**：引擎版本号、假设来源、基线快照如何落表以保证可复现。
> - **NC8 — 性能**：长期投影的循环边界与内存策略。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

> ⚠️ **现状**：`.specify/memory/constitution.md` 目前仍是**未填写的模板**（`[PRINCIPLE_1_NAME]` 等占位符），项目尚无已批准的成文宪法。因此在宪法被正式批准前，本阶段以**项目事实上的治理约束**（CLAUDE.md + 001–006 全链路确立的红线）作为有效宪法，并**不臆造**宪法条款。

**有效约束（源自 CLAUDE.md 与 001–006 既定红线）**：

| 约束 | 来源 | 本阶段符合性 |
|------|------|--------------|
| 确定性引擎负责数字结论，LLM 仅解读（零幻觉） | 001–006 specs 红线、`rules-engine.service.ts` 注释 | ✅ 四类分析均采用「纯函数引擎 + LLM 解读」双层；FR-005/SC-001/SC-004 |
| 结论可追溯、可复现 | 001–006 红线、`rule-findings` 设计 | ✅ 引擎结果带 `engineVersion`/`assumptions`/`disclaimers`，落表可追溯 |
| 显著免责标注 | 008 spec FR-006、edge cases | ✅ 全部分析强制 `disclaimers`，税务类另注「需以当期法规为准」 |
| 数据不足明确降级，不编造 | 008 spec FR-007、SC-005 | ✅ 每引擎定义降级条件，返回 `degraded` 状态而非编造 |
| 用户/家庭成员隔离 | 008 spec FR-008、005 家庭维度 | ✅ `userId` 来自会话，家庭维度复用 005 `requireFamilyMembership` |
| 单仓单项目、finance 领域增量 | 仓库结构、005 plan | ✅ 不新建项目/包；在 `finance` 域增量扩展 |

**违反项需登记到 Complexity Tracking？** 无。本阶段不引入新项目、不破坏既有双层架构、不偏离 finance 域约定，无需例外登记。

**建议（前置）**：在进入 Phase 7 实施前，用 `/speckit-constitution` 把 `.specify/memory/constitution.md` 从模板落实为成文宪法（至少含「确定性引擎 vs LLM 解读」「可追溯/可复现」「免责标注」「数据隔离」四条），使后续 gate 有据可依。

## Project Structure

### Documentation (this feature)

```text
specs/008-advanced-analytics/
├── plan.md              # This file (/speckit-plan output)
├── research.md          # Phase 0 output (/speckit-plan)
├── data-model.md        # Phase 1 output (/speckit-plan)
├── quickstart.md        # Phase 1 output (/speckit-plan)
├── contracts/
│   └── api.md           # Phase 1 output (/speckit-plan)
└── tasks.md             # Phase 2 output (/speckit-tasks - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
# 单项目 Next.js（沿用 001–006 既定 finance 领域布局，增量扩展）
src/
├── database/schema/finance/
│   ├── scenarios.ts              # 新增：what-if 情景定义 + 基线快照
│   ├── scenario-projections.ts   # 新增：确定性投影点（净资产/应急金/目标影响）
│   ├── tax-estimates.ts          # 新增：个税估算（含计税方式对比 + 规则版本）
│   ├── retirement-simulations.ts # 新增：退休模拟（假设束 + 结果 + 不确定性）
│   ├── portfolio-hints.ts        # 新增：组合优化方向（确定性、可追溯）
│   ├── index.ts                  # 改：barrel 追加 5 个导出
│   └── relations.ts              # 改：追加新表关系
├── repositories/finance/
│   ├── scenario.repository.ts
│   ├── tax-estimate.repository.ts
│   ├── retirement.repository.ts
│   └── portfolio-hint.repository.ts
├── services/finance/
│   ├── projection.engine.ts      # 新增：确定性投影纯函数引擎（what-if + 退休共用）
│   ├── tax.engine.ts             # 新增：中国个税确定性纯函数引擎
│   ├── portfolio-hint.engine.ts  # 新增：组合优化方向纯函数引擎（扩 computeConcentrationAlert）
│   ├── scenario.service.ts       # 取数 → 引擎 → 落表
│   ├── tax.service.ts
│   ├── retirement.service.ts
│   └── portfolio-hint.service.ts
├── app/api/finance/
│   ├── scenarios/                # what-if：POST 计算 / GET 列表 / GET[id]
│   ├── tax-estimates/            # POST 估算（支持 method 对比）
│   ├── retirement/               # POST 模拟
│   └── portfolio-hints/          # GET 当前持仓的方向建议
└── features/finance/
    ├── api.ts                    # 改：追加 4 组 endpoint 客户端
    ├── hooks/use-finance.ts      # 改：追加 4 组 hooks
    └── components/
        ├── ScenarioSimulator.tsx     # what-if 面板（参数 → 曲线/影响）
        ├── TaxEstimator.tsx          # 个税估算面板（含计税方式对比）
        ├── RetirementSimulator.tsx   # 退休模拟面板（假设滑杆 + 不确定性标注）
        └── PortfolioOptimization.tsx # 组合优化方向面板

tests/finance/
├── projection.engine.test.ts     # 纯函数：基线/情景/退休投影可复现
├── tax.engine.test.ts            # 纯函数：与权威计算器一致（末位差）
├── portfolio-hint.engine.test.ts # 纯函数：偏离识别 + 方向建议
└── *.service.test.ts             # 服务层取数 + 引擎集成
```

**Structure Decision**: 沿用单项目 Next.js 结构（005 同款）。所有改动是 `finance` 领域的**增量**：5 张新表、4 个纯函数引擎、4 组 API、4 个前端面板。**不新建项目/包**，符合 finance 域既定布局。

## Complexity Tracking

> 无宪法违反项需登记。本阶段在既有双层架构与 finance 域约定内增量扩展，不引入需例外辩护的复杂度。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| — | — | — |
