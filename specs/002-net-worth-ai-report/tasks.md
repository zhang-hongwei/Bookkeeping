---

description: "Task list for feature implementation"
---

# Tasks: 净资产闭环 + 首份 AI 报告 (Phase 1)

**Input**: Design documents from `/specs/002-net-worth-ai-report/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: 本特性的验收标准（SC-001..SC-007）均为「误差 = 0 / 零幻觉 / 确定性可复现」等可测不变式，且项目 CLAUDE.md 强制测试文化——故为每个用户故事包含**关键正确性测试任务**（先写测试、确保失败、再实现）。

**Organization**: 任务按用户故事分组（US1 净资产仪表盘 / US2 截图OCR / US3 月度AI报告 / US4 健康分），使各故事可独立实现与测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、不依赖未完成任务）
- **[Story]**: 所属用户故事（US1/US2/US3/US4）
- 描述含确切文件路径

## Path Conventions

- 单一 Next.js 全栈项目：`src/database/schemas/finance/`、`src/repositories/finance/`、`src/services/finance/`、`src/app/api/finance/`、`src/features/finance/`
- 测试：与源码同目录 `*.test.ts`（Vitest，`pnpm test --run --silent='passed-only' '<pattern>'`）

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 确认前置条件与环境

- [ ] T001 ⚠️ **硬前置**：确认 Phase 0 复式记账核心已实现并达标——`src/database/schemas/finance/`（accounts/categories/transactions+entries/bill_imports）、`services/finance/balance.service.ts`（`assertBalanced`/`recomputeBalance`）、系统权益账户 `__income`/`__expense` 已 seed；且 Phase 0 退出标准（账目平衡、转账不改净资产、导入去重）测试通过。**未达标则本特性无法交付。**
- [ ] T002 [P] 环境变量：在 `.env.local` 确认/补齐 `OPENAI_API_KEY`（月报 LLM + 多模态 OCR）及相关配置（见 quickstart.md §2）
- [ ] T003 [P] 依赖确认：`ai`/`@ai-sdk/openai`/`drizzle-orm`/`drizzle-zod`/`zod`/`vitest` 已安装（`package.json`），缺则补装
- [ ] T004 [P] 多模态能力确认：确认项目多模态 AI 对话能力（009 分支）可用于 OCR；若未就绪，定义降级方案（OCR 作为可独立裁剪子能力，先交付净资产/规则/报告闭环，见 research.md R7）

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Phase 1 全部用户故事共享的 schema 地基

**⚠️ CRITICAL**: 任何用户故事实现前必须完成本阶段（schema 是 US1/US3/US4 的共同前置）

- [ ] T005 [P] [US1] 新增 `net_worth_snapshots` schema（每用户每日一行；`UNIQUE(user_id, date)`；金额 numeric(18,2)；字段见 data-model.md §1）于 `src/database/schemas/finance/net-worth-snapshots.ts`
- [ ] T006 [P] [US3] 新增 `rule_findings` schema（metric enum / value / verdict / risk_level / report_id；同周期 metric 唯一）于 `src/database/schemas/finance/rule-findings.ts`
- [ ] T007 [P] [US3] 新增 `ai_reports` schema（type/score/dimensions/status/source_data_hash/content_ref）于 `src/database/schemas/finance/ai-reports.ts`
- [ ] T008 [P] [US2] 扩展 `transactions.source` enum 追加 `ocr`（Phase 0 为 manual/import/nl；若 Phase 0 迁移未生成则直接改 enum 定义，否则生成 ALTER）于 `src/database/schemas/finance/transactions.ts`
- [ ] T009 更新 `src/database/schemas/finance/index.ts`（barrel 导出 3 新表）与 `relations.ts`（users↔snapshots/findings/reports、findings↔reports 关系），运行 `pnpm db:generate` + `pnpm db:migrate`（依赖 T005–T008）

**Checkpoint**: schema 地基就绪，用户故事实现可开始

---

## Phase 3: User Story 1 - 净资产仪表盘 + 曲线 (Priority: P1) 🎯 MVP

**Goal**: 用户一眼看到总资产/总负债/净资产与净资产曲线；任意交易后曲线与账目一致、转账不改净资产。

**Independent Test**: 连续录入收支/转账后，任意日期 `net_worth_snapshots.net_worth` == 由账户余额推导的净值（总资产−总负债）；任意转账后净资产不变、曲线无虚假波动。

### Tests for User Story 1

- [ ] T010 [P] [US1] 单元测试：净资产推导口径（资产=Σ资产类 balance、负债=Σcredit 类欠款、净值=差）于 `src/services/finance/net-worth.service.test.ts`
- [ ] T011 [P] [US1] 测试：快照一致（写后净值=推导值）、交易编辑/删除后受影响日期区间重算、首次启用历史回填、`verifySnapshots` 自愈——同 `net-worth.service.test.ts`

### Implementation for User Story 1

- [ ] T012 [P] [US1] `net-worth.repository.ts`：快照 upsert / 区间查询 / 单日查询 于 `src/repositories/finance/net-worth.repository.ts`
- [ ] T013 [US1] `net-worth.service.ts`：`computeNetWorth(userId, date)` 由 `accounts.balance` 严格推导总资产/总负债/净资产（research R1，依赖 T005）于 `src/services/finance/net-worth.service.ts`
- [ ] T014 [US1] `net-worth.service.ts`：`snapshotToday` / `snapshotRange(from,to)` / `backfillHistory`（research R2，依赖 T012/T013）
- [ ] T015 [US1] `net-worth.service.ts`：`verifySnapshots(userId)`——快照净值 vs 余额推导净值校验 + 不一致自愈告警（research R10，对应 SC-001）
- [ ] T016 [US1] 将快照维护挂入 Phase 0 `ledger.service`：记账/改/删事务后，重算 `[occurred_at 当日 .. today]` 区间快照（同事务或紧随），保证曲线实时一致（依赖 Phase 0 ledger.service）
- [ ] T017 [P] [US1] API `GET /api/finance/net-worth`（仪表盘：总资产/总负债/净资产 + 今日变化）于 `src/app/api/finance/net-worth/route.ts`（Clerk 认证、金额字符串、按 userId 隔离）
- [ ] T018 [P] [US1] API `GET /api/finance/net-worth/snapshots?from=&to=`（曲线区间数据，缺口懒回填）于 `src/app/api/finance/net-worth/snapshots/route.ts`
- [ ] T019 [US1] UI：净资产仪表盘（总资产/总负债/净资产 + 今日变化）与净资产曲线组件 于 `src/features/finance/components/`（MUI v7，复用 design system）
- [ ] T020 [P] [US1] TanStack Query hooks（net-worth / snapshots）于 `src/features/finance/hooks/`

**Checkpoint**: User Story 1 独立可用——净资产仪表盘 + 曲线与账目一致，转账不改净资产

---

## Phase 4: User Story 2 - 截图 OCR 记账 (Priority: P2)

**Goal**: 拍/上传支付截图 → 多模态识别为候选交易 → 用户确认后落库（source=ocr）。

**Independent Test**: 一张支付截图识别出候选交易（金额/时间/对方/分类/账户），确认后正确落库、账目平衡、source=ocr；低置信度强制人工确认。

### Tests for User Story 2

- [ ] T021 [P] [US2] 测试：OCR structured output（金额/时间核心字段）+ confidence + 多笔/低置信走人工确认 + 解析失败进入手动补全 于 `src/services/finance/ocr-record.service.test.ts`

### Implementation for User Story 2

- [ ] T022 [US2] `ocr-record.service.ts`：多模态 AI（`@ai-sdk/openai`）+ Zod structured output 将图片识别为候选交易 `{ type, amount, occurredAt?, counterparty?, categoryId?, accountId?, note? }` + `confidence`，**不直接落库**（research R7）
- [ ] T023 [US2] `ocr-record.service.ts`：多笔拆分（逐笔候选）/ 低置信 `requireManualConfirm` / 无法识别 `reason` 降级路径（对应 SC-005 与 FR-006）
- [ ] T024 [P] [US2] API `POST /api/finance/ocr-record`（multipart `image`）返回候选 + confidence 于 `src/app/api/finance/ocr-record/route.ts`
- [ ] T025 [US2] 确认落库：复用 Phase 0 `POST /api/finance/transactions`，`source: "ocr"`（依赖 T008 枚举 + Phase 0 ledger.service）
- [ ] T026 [US2] UI：截图记账入口（上传/拍照）+ 候选确认/手动补全界面 于 `src/features/finance/components/`

**Checkpoint**: User Story 2 独立可用——拍照即可记账

---

## Phase 5: User Story 3 - 月度 AI 报告 (Priority: P3)

**Goal**: 月报跑通「真相源 → 规则结论 → LLM 表达」流水线，数字结论零幻觉，LLM 失败降级模板，数据变化可检测。

**Independent Test**: 生成月报，所有数字结论（收支总额/储蓄率/负债率/应急金）来自 `rule_findings`、可逐项追溯；模拟 LLM 异常 → 降级模板仍呈现数字；底层数据变化 → 报告标 stale。

> **依赖**：US3 含规则引擎核心（`computeFindings`），是 US4（健康分）的前置。

### Tests for User Story 3

- [ ] T027 [P] [US3] 单元测试：规则引擎 `computeFindings` 确定性可复现 + 公式正确（savings_rate=surplus/income、debt_ratio、emergency_months；转账不计收支）于 `src/services/finance/rules-engine.service.test.ts`
- [ ] T028 [P] [US3] 测试：报告零幻觉（数字仅来自 findings）+ LLM 失败模板降级（status=degraded）+ sourceDataHash 变更标 stale 于 `src/services/finance/report.service.test.ts`

### Implementation for User Story 3

- [ ] T029 [P] [US3] `finding.repository.ts`：findings 写入/读取（同周期 metric 唯一、重算覆盖）于 `src/repositories/finance/finding.repository.ts`（依赖 T006）
- [ ] T030 [P] [US3] `report.repository.ts`：ai_reports 读写 于 `src/repositories/finance/report.repository.ts`（依赖 T007）
- [ ] T031 [US3] `rules-engine.service.ts`：`computeFindings(userId, period)` 纯函数 → `RuleFinding[]`（income/expense/surplus/savings_rate/debt_ratio/emergency_months，research R3，依赖 T029）
- [ ] T032 [US3] `report.service.ts`：`generateMonthly(userId, period)`——findings 作为只读事实喂 LLM 表达（prompt：引用给定结论、禁止自行计算数字）→ 文档/Block 正文 + 写 `ai_reports`（research R4，依赖 T031/T030）
- [ ] T033 [US3] `report.service.ts`：LLM 失败/超时/不合规 → 降级为 findings 模板文本，status=`degraded`，数字结论仍呈现（research R5，对应 SC-004）
- [ ] T034 [US3] `report.service.ts`：`source_data_hash`（周期数据指纹）计算 + 查看时比对置 `stale`（research R6，对应 FR-010）
- [ ] T035 [P] [US3] API：`POST /api/finance/reports/monthly`、`GET /api/finance/reports[?period]`、`GET /api/finance/reports/:id`（stale 检测）、`POST /api/finance/reports/:id/regenerate` 于 `src/app/api/finance/reports/`
- [ ] T036 [P] [US3] API `GET /api/finance/findings?periodStart=&periodEnd=`（即时确定性计算）于 `src/app/api/finance/findings/route.ts`
- [ ] T037 [US3] UI：月报视图（数字来自 findings、重新生成、stale 提示、degraded 标注）于 `src/features/finance/components/`

**Checkpoint**: User Story 3 独立可用——零幻觉月度 AI 报告

---

## Phase 6: User Story 4 - 财务健康分 (Priority: P4)

**Goal**: 0–100 健康分 + 各维度雷达图，确定性可复现，缺失维度降权不编造。

**Independent Test**: 给定账目数据，健康分按维度（储蓄率/负债率/应急金/投资率/现金流）加权计算，相同输入得分一致；投资率等缺失维度降权并标注、不编造。

> **依赖**：复用 US3 的规则引擎（`computeFindings`），新增 `computeHealthScore`。

### Tests for User Story 4

- [ ] T038 [P] [US4] 单元测试：`computeHealthScore` 加权（设计 §6 权重）+ 缺失维度降权重分配 + 确定性可复现（投资率 Phase 1 缺失）于 `src/services/finance/rules-engine.service.test.ts`

### Implementation for User Story 4

- [ ] T039 [US4] `rules-engine.service.ts`：`computeHealthScore(findings)` → 0–100 总分 + dimensions（储蓄率25%/负债率25%/应急金20%/投资率15%/现金流15%；缺失维度降权重分配、标注 reason）于 `src/services/finance/rules-engine.service.ts`（依赖 T031）
- [ ] T040 [P] [US4] API `GET /api/finance/health-score?periodStart=&periodEnd=`（含缺失维度 reason）于 `src/app/api/finance/health-score/route.ts`
- [ ] T041 [US4] UI：健康分 0–100 + 各维度雷达图（缺失维度标注）于 `src/features/finance/components/`

**Checkpoint**: 全部用户故事独立可用

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 跨故事改进与质量门

- [ ] T042 [P] 安全：核对所有新 repository/API 的用户隔离（按 userId 过滤、越权 → 404，不泄露存在性）
- [ ] T043 [P] 类型与质量门：`pnpm type-check`（tsc --noEmit）+ `pnpm check`（type-check + lint）全绿
- [ ] T044 质量门：运行 `pnpm test --run --silent='passed-only' 'finance'`，验证 SC-001..SC-007（净资产自洽/转账不改净资产/零幻觉/LLM降级/OCR准确率/健康分可复现/快照一致）
- [ ] T045 [P] 文档：更新相关文档（如有），核对 data-model/contracts 与实现一致
- [ ] T046 性能：仪表盘首屏读 `net_worth_snapshots`（非全量聚合）确保在可接受等待内呈现核心数字

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，立即开始；**T001（Phase 0 达标）是整个特性的硬前置**
- **Foundational (Phase 2)**: 依赖 Setup；**阻塞所有用户故事**
- **User Stories (Phase 3+)**: 均依赖 Foundational 完成
  - US1、US2 可在 Foundational 后并行（US2 仅依赖 Phase 0 ledger）
  - **US3 含规则引擎核心；US4 依赖 US3**（顺序 US3 → US4）
- **Polish (Phase 7)**: 依赖所期望的用户故事完成

### User Story Dependencies

- **US1 (P1)**: Foundational 后即可开始，不依赖其他故事 🎯 MVP
- **US2 (P2)**: Foundational 后即可开始（仅需 T008 枚举 + Phase 0 ledger），可与 US1 并行
- **US3 (P3)**: Foundational 后开始；含规则引擎核心
- **US4 (P4)**: **依赖 US3**（复用 `computeFindings`），须在 US3 后

### Within Each User Story

- 测试先写并确保失败 → 再实现
- repository → service → API → UI
- 核心实现先于集成
- 单故事完成并通过独立测试后再进下一优先级

### Parallel Opportunities

- Setup 中 T002/T003/T004 可并行
- Foundational 中 T005/T006/T007/T008（不同文件）可并行；T009 收尾（barrel + 迁移）
- Foundational 完成后：US1 与 US2 可由不同人并行；US3 内 T029/T030 repository、T035/T036 API 可并行
- 单故事内测试 [P] 可并行、不同 repository [P] 可并行

---

## Parallel Example: User Story 1

```bash
# 并行写 US1 测试：
Task: "净资产推导口径单测 in src/services/finance/net-worth.service.test.ts"
Task: "快照一致/重算/回填/自愈测试 in src/services/finance/net-worth.service.test.ts"

# 并行建 repository 与 API（不同文件）：
Task: "net-worth.repository.ts in src/repositories/finance/"
Task: "GET /api/finance/net-worth in src/app/api/finance/net-worth/route.ts"
Task: "GET /api/finance/net-worth/snapshots in src/app/api/finance/net-worth/snapshots/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup（**T001 确认 Phase 0 达标**）
2. Phase 2 Foundational（schema 地基，CRITICAL）
3. Phase 3 User Story 1（净资产仪表盘 + 曲线）
4. **STOP 验证**：独立测试 US1（净资产自洽、转账不改净资产）
5. 可演示/部署 MVP

### Incremental Delivery

1. Setup + Foundational → 地基就绪
2. + US1 → 独立测试 → 演示（MVP！净资产闭环）
3. + US2 → 独立测试 → 演示（拍照记账）
4. + US3 → 独立测试 → 演示（零幻觉月报）
5. + US4 → 独立测试 → 演示（健康分）
6. 每个故事增量交付，不破坏前序故事

### Parallel Team Strategy

多开发者：
1. 团队共同完成 Setup + Foundational
2. Foundational 完成后：
   - 开发者 A：US1（净资产仪表盘）
   - 开发者 B：US2（OCR 记账）
   - 开发者 C：US3（规则引擎 + 月报）→ 完成后承接 US4（健康分）

---

## Notes

- [P] = 不同文件、无未完成依赖
- [Story] 标签将任务映射到具体用户故事以便追溯
- **T001（Phase 0 达标）是不可绕过的硬前置**——Phase 1 净资产/结论正确性完全建立在 Phase 0 账目正确之上
- **零幻觉红线**贯穿 US3/US4：数字结论只来自规则引擎，LLM 只表达、失败降级模板
- 提交按任务或逻辑分组（gitmoji 前缀，分支命名见 CLAUDE.md）
- 可在任意 Checkpoint 停下独立验证单故事
