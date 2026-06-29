# Implementation Plan: AI 财富顾问深化 (Phase 6)

**Branch**: `001-double-entry-ledger`（spec 目录为 `007-ai-wealth-advisor`；沿用既有「各 Phase 同分支、独立 spec 目录」约定，与 002/003/004/005 一致） | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-ai-wealth-advisor/spec.md`

> 本计划由 `/speckit-plan` 生成。Phase 0 研究 → [research.md](./research.md)；Phase 1 设计 → [data-model.md](./data-model.md)、[contracts/api.md](./contracts/api.md)、[quickstart.md](./quickstart.md)。tasks.md 由后续 `/speckit-tasks` 生成。

## Summary

Phase 6 在 Phase 0–4 完整个人财务模型与规则引擎之上，把顾问从「事后报告」升级为「事前预警 + 个性化对话」，是产品北极星「未来会怎样」的核心兑现。交付六件事（对应《AI 财富管家》Phase 6 + §5/§6/§8/§9）：

1. **现金流预测**：基于历史收支 + 透明回归模型预测未来数月结余/现金资产，标注不确定性区间；定位应急金不足时点；历史不足明确降级（不编造）。
2. **智能预警**：规则触发的提前预警（应急金/储蓄率下降/负债过高/趋势恶化），依据可追溯到规则结论，幂等不疲劳，可静默。
3. **个性化顾问对话**：自然语言问答，回答中的数字/结论**来自规则引擎**（不编造），LLM 只做表达；LLM 失败降级模板。
4. **审批闭环**：高风险动作（标记异常/建议调仓/改写结论/补录记账）走 `LLM 提议 → 规则校验 → 用户审批 → 才落库`；未审批**绝不**落库，apply 幂等且再校验。
5. **多期趋势对比**：储蓄率/负债率/健康分随时间的时序与方向，显著恶化提示（与各期报告结论一致）。
6. **健康分完善**：补全 `investmentRate`（接 Phase 3 持仓）与现金流稳定性（方差）两维。

**技术路线**：严格沿用设计 §5 双层架构——**事实层 = 规则引擎（纯函数，可复现可追溯）**，**表达层 = LLM（复用 Vercel AI SDK，克隆报告红线 prompt）**；在既有 `finance` 领域**增量 6 张表**（预测/预警/预警偏好/顾问会话/顾问消息/审批），**不改既有表结构**（健康分完善为代码层，趋势指标复用 `finance_rule_findings` 既有形状）。所有改账目动作仍走既有 `ledger.service` 平衡校验，不另起旁路。

**关键设计取舍**（详见 research.md）：
- **审批管道从零构建**——spec 与设计称「复用既有审批管道」，但代码勘察证实**不存在**（本仓库无 042/043）；如实标注，建通用 `finance_approvals` + 白名单 kind + 状态机。
- **预测用透明回归而非黑盒 ML**——SC-002 要求预测点可回溯到历史输入与公式，黑盒不可解释；与规则引擎同为纯函数，便于回测。
- **顾问会话不复用 visitorId `chat` 表**——新建 finance 作用域（auth `userId`）会话表，消息带 `citedFindings` 结构化可追溯锚点。
- **数值引用用 jsonb 快照而非 FK**——findings 同期会被覆盖重算，引用存快照保证「结论当时的依据」不可变。
- 阈值/准确率**不预先固化**（spec 远期规划）——以 `MIN_HISTORY_MONTHS` 等具名常量集中，临近实施按真实数据标定。

**硬前置**：Phase 0–4 必须已达标（账目平衡、净资产快照、规则引擎、AI 报告、资产/负债、投资持仓）。Phase 6 的事实层完全建立在 Phase 0 账目正确与 Phase 1 规则结论之上。**Phase 5（预算/目标）未建但不阻塞**——007 的 FR 均不依赖预算表（详见 research.md 决策 15）。

## Technical Context

**Language/Version**: TypeScript 5.x · React 19.2 · Next.js 16.0.1 (App Router)
**Primary Dependencies**: Drizzle ORM 0.44.5 + drizzle-kit 0.31.4 · MUI v7 · Tailwind v4 · Zustand 5 · TanStack Query 5 · Zod 4 · **Vercel AI SDK 6**（`ai`/`@ai-sdk/openai`，顾问/报告表达层，复用 Phase 1）· **Supabase Auth**（`@supabase/ssr`，finance 全域认证；userId = Supabase user id 字符串）
**Storage**: PostgreSQL（Drizzle ORM；`@neondatabase/serverless`）
**Testing**: Vitest（`pnpm test --run --silent='passed-only' '[pattern]'`）
**Target Platform**: Web（Next.js App Router），桌面/移动浏览器
**Project Type**: web-application（Next.js 全栈，App Router + API Routes）
**Performance Goals**: 预测/趋势为纯函数 + 缓存表；顾问对话流式；预警在报告刷新钩子上 best-effort 物化（幂等）
**Constraints**: 单币种 CNY；金额 `decimal(18,4)` 禁浮点；**零幻觉红线**（数值结论只来自规则引擎）；LLM 失败须降级模板；高风险动作 100% 走审批；数据按用户隔离；所有建议/预测标注「非投资建议」
**Scale/Scope**: 个人（+ 家庭成员作用域隔离）；预测/预警准确率阈值临近实施标定，本计划不固化

> 无 NEEDS CLARIFICATION 残留——全部远期细节已落到结构与可信红线。15 项设计决策见 [research.md](./research.md)。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**状态：N/A — 未发现可对照的原则。** `.specify/memory/constitution.md` 仍是未填写的模板（`[PRINCIPLE_1_NAME]` 等占位符），项目尚未通过 `/speckit-constitution` 建立正式宪章。因此无 gate 可违反，本检查不构成阻断（与 Phase 1/002、Phase 4/005 计划一致）。

**建议**：可运行 `/speckit-constitution` 建立宪章。本特性自然映射的候选原则——「复式平衡不可违反」「金额禁止浮点」「数据按用户隔离」「AI 数字结论必须来自规则引擎（零幻觉）」「高风险动作必走审批」——均已在设计中兑现。本计划以 Spec 的 Success Criteria（SC-001..SC-005）作为事实 gate。

**设计后复检（Phase 1 完成后）**：data-model.md 的不变量 I1（数值可追溯）、I2/I8（审批不越权 + 幂等 + 走 ledger 平衡校验）、I3（预测纯函数）、I4（金额 decimal）、I5（用户隔离）、I7（LLM 降级）与 contracts/api.md 的 §7 契约不变量（sourceRefs/disclaimer/降级不报 5xx/高风险不自动落库/幂等 apply/越权 404）均与上述候选原则一致，无回归。

## Project Structure

### Documentation (this feature)

```text
specs/007-ai-wealth-advisor/
├── spec.md              # 功能规格
├── plan.md              # 本文件
├── research.md          # Phase 0：15 项技术决策（含「复用 vs 从零」对照）
├── data-model.md        # Phase 1：领域模型增量（6 表 + 不变量 I1–I8 + 状态机）
├── quickstart.md        # Phase 1：环境与端到端运行指引
├── contracts/
│   └── api.md           # Phase 1：API 契约（预测/预警/顾问/审批/趋势/健康分）
└── tasks.md             # Phase 2 输出（/speckit-tasks，本命令不生成）
```

### Source Code (repository root)

```text
src/
├── database/
│   ├── schema/finance/
│   │   ├── cash-flow-forecasts.ts     # 新增：finance_cash_flow_forecasts
│   │   ├── smart-alerts.ts            # 新增：finance_smart_alerts + finance_alert_preferences
│   │   ├── advisor.ts                 # 新增：finance_advisor_sessions + finance_advisor_messages
│   │   ├── approvals.ts               # 新增：finance_approvals
│   │   ├── transactions.ts            # 变更（可能）：+ anomaly_flag（实现期按既有列决定，优先复用）
│   │   ├── relations.ts               # 变更：增 session/message/approval 关系
│   │   └── index.ts                   # barrel 更新
│   └── migrations/                    # drizzle-kit generate 产物（增量）
├── repositories/finance/
│   ├── forecast.repository.ts         # 预测缓存读写
│   ├── alert.repository.ts            # 预警 + 偏好读写（含幂等 upsert）
│   ├── advisor.repository.ts          # 会话/消息读写
│   └── approval.repository.ts         # 审批 CRUD + 状态机约束
├── services/finance/
│   ├── forecast.service.ts            # 预测：纯函数（透明回归）+ 缓存 + 降级（决策 2/3）
│   ├── alert.service.ts               # 预警生成（规则触发，幂等）+ 偏好过滤
│   ├── approval.service.ts            # 审批状态机 + 双校验 + 幂等 apply（决策 4/5/6）
│   ├── advisor.service.ts             # 双层调用（事实层→LLM 表达层）+ 降级 + 提议串联（决策 7/8）
│   ├── trend.service.ts               # 多期趋势纯函数聚合（决策 13）
│   ├── rules-engine.service.ts        # 变更：+趋势规则 + 补 investmentRate/cashflow 维度（决策 10/12）
│   └── money.ts                       # 既有：cents/decimal 工具（复用）
├── app/api/finance/
│   ├── _lib/
│   │   ├── auth.ts                    # 既有：requireUserId（401）
│   │   ├── validation.ts              # 变更：+ forecast/alert/advisor/approval schemas
│   │   └── serialize.ts               # 变更：+ 各 DTO + DisclaimerEnvelope + SourceRef
│   ├── forecasts/
│   │   └── route.ts                   # GET 预测 / POST 重算（§1）
│   ├── alerts/
│   │   ├── route.ts                   # GET 列表（§2.1）
│   │   ├── [id]/route.ts              # PATCH 已读/静默（§2.2）
│   │   └── preferences/route.ts       # GET/PATCH 偏好（§2.3）
│   ├── advisor/
│   │   └── sessions/
│   │       ├── route.ts               # POST 建 / GET 列表（§3.1/3.2）
│   │       └── [id]/
│   │           └── messages/route.ts  # GET 历史 / POST 发问（§3.3/3.4）
│   ├── approvals/
│   │   ├── route.ts                   # GET 待审/历史（§4.1）
│   │   └── [id]/
│   │       ├── route.ts               # GET 详情 / PATCH 批准·拒绝（§4.3）
│   │       └── apply/route.ts         # POST 落库（幂等）（§4.4）
│   ├── trends/route.ts                # GET 多期趋势（§6.1）
│   └── health-score/route.ts          # 既有：返回完善后健康分（§5，代码层变化）
└── features/finance/
    ├── api.ts                         # 变更：+ forecast/alert/advisor/approval/trend DTO 与方法
    ├── hooks/use-finance.ts           # 变更：+ 各资源 TanStack Query hooks
    └── components/
        ├── ForecastPanel.tsx          # 现金流预测（带不确定性区间）
        ├── AlertsPanel.tsx            # 智能预警 + 静默
        ├── AdvisorChat.tsx            # 顾问对话（含提议→审批入口）
        ├── ApprovalCenter.tsx         # 审批中心（待审/批准/落库）
        └── TrendComparison.tsx        # 多期趋势对比

tests/finance/
├── forecast.service.test.ts           # 新增（I3/SC-001/降级）
├── alert.service.test.ts              # 新增（I1/I6/偏好）
├── approval.service.test.ts           # 新增（I2/I8/状态机/走 ledger）
├── advisor.service.test.ts            # 新增（I1/I7/降级/提议串联）
├── trend.service.test.ts              # 新增（SC-004/趋势规则）
└── rules-engine.service.test.ts       # 变更：补趋势规则 + 健康分两维
```

**Structure Decision**: 复用 Phase 0–4 既定分层（`database/schema/finance` → `repositories/finance` → `services/finance` → `app/api/finance` → `features/`）。Phase 6 仅在 `finance/` 子域内**增量**新增文件 + 既有 `rules-engine.service.ts`/`_lib/*` 的代码层扩展，不引入新的顶层结构。事实层（规则引擎）为既有纯函数的**扩展**；表达层（LLM）复用 Phase 1 AI SDK 与红线 prompt；审批落库**复用**既有 `ledger.service`，绝不另起写账目旁路——保证 Phase 0 复式平衡不变量不被破坏。

## Complexity Tracking

> Constitution Check 无违规。记录五处「有理由的复杂度」（详见 research.md 对应决策）：

| 复杂点 | 为何需要 | 为何不采用更简单方案 |
|--------|----------|----------------------|
| 审批管道从零构建（`finance_approvals` + 状态机 + 白名单 kind + 双校验 + 幂等 apply） | spec/设计称「复用既有」但代码中**不存在**；SC-003（高风险 100% 走审批、未审批绝不落库）是硬约束，唯一兑现方式 | 复用 422/不变量路径——语义不符（不变量≠待审批），误导客户端；开放任意 payload——风险/审计不可控 |
| 透明回归预测模型（趋势 + 季节均值 + 残差区间）+ 缓存表 | SC-002 要求预测点可回溯到历史输入与公式；个人月度小样本，简单模型方差足够且可回测（SC-001） | 黑盒 ML（ARIMA/Prophet/NN）——不可解释、与零幻觉红线冲突、需大量数据 |
| 顾问会话/消息新表 + `citedFindings` jsonb 锚点 | FR-007 要求每条建议可追溯依据；user 作用域保证 FR-010 隔离；`proposalId` 串联审批 | 复用 visitorId `chat`——无法按用户隔离、无可追溯字段；引用放正文字符串——不可机读易丢失 |
| 数值引用用 jsonb 快照（`ruleFindingRefs`/`citedFindings`/`ruleValidation`）而非 FK 指向 findings | findings 同期会被覆盖重算，快照保证「结论当时的依据」不可变、可回看（SC-002） | FK 指向 findings——重算后引用悬空或被悄悄改写，破坏可追溯 |
| 预警幂等唯一约束 `(userId,kind,period)` + 偏好/静默表 | Edge Case「预警疲劳」+ FR-008 可静默；幂等防重复打扰、保留历史可回看 | 实时算不持久化——无法已读/静默/历史；删除已读——丢失可追溯 |
