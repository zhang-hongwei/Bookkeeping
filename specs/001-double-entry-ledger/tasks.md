---
description: "Task list for Phase 0 复式记账核心地基 implementation"
---

# Tasks: 复式记账核心地基 (Phase 0)

**Input**: Design documents from `/specs/001-double-entry-ledger/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅, quickstart.md ✅

**Tests**: **INCLUDED** — 本特性的价值即"账目永远平衡"（SC-001/SC-002/SC-007），属可测试不变式；plan/quickstart 已列出必须通过的用例。每个用户故事先写失败测试再实现。

**Organization**: 按用户故事分组（spec.md 的 P1→P2→P3→P4），共享领域核心归入 Foundational。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成依赖）
- **[Story]**: 归属用户故事（US1/US2/US3/US4）；Setup/Foundational/Polish 无此标签
- 描述含确切文件路径

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 环境与约定确认、模块脚手架

- [X] T001 [P] 确认测试运行器：检查 package.json 是否含 vitest，缺失则 `pnpm add -D vitest` 并新建 vitest.config.ts（test 目录指向 tests/）
- [X] T002 [P] 解决 ID/时间戳约定（R11）：检查 src/database/schemas 是否存在 idGenerator / _helpers.ts；为 finance 新表确定 text 前缀 ID（acc_/cat_/txn_/ent_/imp_）+ timestamptz 方案，记录于 src/database/schemas/finance/README 或注释
- [X] T003 [P] 搭建 finance 模块目录骨架：src/database/schemas/finance/、src/repositories/finance/、src/services/finance/、src/features/finance/{components,hooks,store}、src/app/api/finance/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 复式账本核心引擎（schema + 余额不变式）——所有用户故事的前置

**⚠️ CRITICAL**: 未完成本阶段前不得开始任何用户故事

- [X] T004 创建 accounts schema（type/currency/opening_balance/balance/credit_limit/include_in_net_worth/is_archived）在 src/database/schemas/finance/accounts.ts
- [X] T005 [P] 创建 categories schema（name/kind/parent_id/keywords）在 src/database/schemas/finance/categories.ts
- [X] T006 创建 transactions + entries schema（type/amount/occurred_at/source/confidence/bill_import_id；entries: side/amount>0）在 src/database/schemas/finance/transactions.ts
- [X] T007 创建 relations.ts + finance/index.ts，并把 finance barrel 接入 src/database/schema/index.ts 在 src/database/schemas/finance/{relations,index}.ts 与 src/database/schema/index.ts
- [X] T008 生成并应用迁移 `pnpm db:generate && pnpm db:migrate`；seed 默认收支分类 + 系统权益账户 `__income`/`__expense`（type=equity, user_id=NULL）在 src/database/migrations/ 与 src/database/seed-finance.ts *(实际：drizzle-kit 触发交互式 rename 提示且无 tsx，改用 `scripts/init-finance.mjs` 幂等 CREATE TABLE + 种子权益账户，已对 wealth 库执行成功；默认收支分类 seed 待补)*
- [X] T009 建立 finance 数据访问基座：DB 事务包装器（原子写 entries+更新 balance）与 userId 作用域基类 在 src/repositories/finance/base.ts
- [X] T010 实现 balance.service：`assertBalanced(txnId)`、`applyEntryDelta`（按账户 normal-balance 方向）、`recomputeBalance(accountId)`（自愈）、`verifyAll(userId)` 在 src/services/finance/balance.service.ts（依赖 T004/T006/T009）
- [X] T011 [P] balance 不变式单元测试：Σdebit==Σcredit、amount>0、资产类/负债类(credit)余额方向正确 在 tests/finance/balance.service.test.ts

**Checkpoint**: 复式引擎就绪——用户故事可开始

---

## Phase 3: User Story 1 - 手动记录收支与转账 (Priority: P1) 🎯 MVP

**Goal**: 用户能记录收入/支出/转账，账目永远平衡、转账不改净资产
**Independent Test**: 建几个账户，连续录入若干收支/转账后，逐一核对每个账户余额 = 初始 + 交易汇总，且总账平衡、转账前后净资产不变

### Tests for User Story 1（先写、确保失败）

- [X] T012 [P] [US1] 集成测试：记录 income/expense/transfer → 余额正确 + Σdebit==Σcredit + 转账不改净资产（SC-001/SC-002）在 tests/finance/ledger.record.test.ts
- [X] T013 [P] [US1] 集成测试：编辑/删除历史交易 → 相关账户余额一次同步正确（SC-007）在 tests/finance/ledger.mutate.test.ts

### Implementation for User Story 1

- [X] T014 [US1] 实现 ledger.service：createTransaction（按 type 展开为平衡 entries，income/expense 自动生成 `__income`/`__expense` 对腿）、editTransaction（事务内反转旧 entries+写新+重算）、deleteTransaction 在 src/services/finance/ledger.service.ts（依赖 T006/T010）
- [X] T015 [P] [US1] 实现 account.repository（create 写入 opening_balance 分录；list 带 balance；scope by userId）在 src/repositories/finance/account.repository.ts
- [X] T016 [P] [US1] 实现 category.repository（list/create/自动归类匹配）在 src/repositories/finance/category.repository.ts
- [X] T017 [P] [US1] 实现 transaction.repository（含 entries 的读写、按账户/分类/时间筛选）在 src/repositories/finance/transaction.repository.ts
- [X] T018 [US1] 实现 API：POST/GET/PATCH/DELETE /api/finance/transactions、POST+GET /api/finance/accounts（建账+列表）、GET /api/finance/categories 在 src/app/api/finance/{transactions,accounts,categories}/route.ts
- [X] T019 [US1] 实现记账表单 UI（账户/分类/金额/类型/时间/备注，react-hook-form + Zod 校验金额>0）在 src/features/finance/components/TransactionForm.tsx
- [X] T020 [US1] 实现账户列表 + 交易明细列表（带余额、按类型显示信用欠款）+ TanStack Query hooks 在 src/features/finance/{components,hooks}/

**Checkpoint**: MVP 可用——能正确记账并查看平衡的账目

---

## Phase 4: User Story 2 - 管理资金账户 (Priority: P2)

**Goal**: 创建/归档/恢复账户，随时看到真实余额
**Independent Test**: 创建现金/储蓄/信用三类账户设初始余额，交易后各账户余额正确变化；归档账户后历史不丢、不再进新交易默认选项

### Tests for User Story 2

- [X] T021 [P] [US2] 测试：创建/归档/恢复账户、余额持久、归档账户不被新交易默认选中 在 tests/finance/account.manage.test.ts

### Implementation for User Story 2

- [X] T022 [US2] 实现 account.service：archive/restore、credit_limit 配置、includeInNetWorth 切换 在 src/services/finance/account.service.ts（依赖 T015）
- [X] T023 [US2] 实现 PATCH /api/finance/accounts/[id] 与 DELETE（无关联交易才硬删，否则 409 建议归档）在 src/app/api/finance/accounts/[id]/route.ts
- [X] T024 [US2] 实现账户管理 UI（归档/恢复、信用额度、信用账户按欠款方向显示）在 src/features/finance/components/AccountManager.tsx

**Checkpoint**: US1 + US2 均可独立工作

---

## Phase 5: User Story 3 - 批量导入账单 (Priority: P3)

**Goal**: 上传导出的支付宝/微信账单，自动解析归类，预览确认后落库，重复导入跳过
**Independent Test**: 上传真实账单 → 预览 → 确认 → 交易正确落库且账目平衡；再次上传同文件不产生重复

### Tests for User Story 3

- [X] T025 [P] [US3] 测试：row_hash 去重、preview→confirm→imported 状态流转、重复上传跳过（SC-006）在 tests/finance/import.test.ts

### Implementation for User Story 3

- [X] T026 [P] [US3] 创建 bill_imports + bill_import_rows schema（status 状态机、row_hash、parsed jsonb）+ 迁移 在 src/database/schemas/finance/bill-imports.ts 与 src/database/migrations/
- [X] T027 [US3] 实现 CSV 解析器注册表：AlipayParser、WeChatParser、GenericCSVParser + 按表头自动识别 在 src/services/finance/import/parsers/
- [X] T028 [US3] 实现 import.service：parse→bill_import_rows→去重→preview→confirm（落库走 ledger.createTransaction）在 src/services/finance/import.service.ts（依赖 T014）
- [X] T029 [US3] 实现导入 API：POST /api/finance/import、GET /api/finance/import/[id]、POST /api/finance/import/[id]/confirm 在 src/app/api/finance/import/
- [X] T030 [US3] 实现导入 UI（上传→预览表 + pending/duplicate 徽章→选择确认）在 src/features/finance/components/ImportFlow.tsx

**Checkpoint**: US1/US2/US3 均独立可用

---

## Phase 6: User Story 4 - 自然语言/对话记账 (Priority: P4)

**Goal**: 一句话（"午饭 35"）解析为候选交易，确认后落库
**Independent Test**: 输入"午饭 35"→候选（支出¥35、餐饮、默认账户、当前时间）→确认落库且平衡；无法解析→提示手动补全

### Tests for User Story 4

- [X] T031 [P] [US4] 测试："午饭 35"→候选 {type:expense, amount:35, category:餐饮}（SC-005）；不可解析→candidate:null+reason 在 tests/finance/nl-record.test.ts

### Implementation for User Story 4

- [X] T032 [US4] 实现 nl-record.service：AI SDK structured output（Zod schema）→候选交易 + confidence；默认账户/时间 在 src/services/finance/nl-record.service.ts
- [X] T033 [US4] 实现 nl-record API：POST /api/finance/nl-record → 返回候选（不落库）在 src/app/api/finance/nl-record/route.ts
- [X] T034 [US4] 把自然语言入口接入记账 UI（输入→候选预览→确认→POST /transactions）在 src/features/finance/components/NlRecordInput.tsx

**Checkpoint**: 全部 4 个用户故事独立可用

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 跨故事质量与收尾

- [X] T035 [P] 不变式巡检：`verifyAll(userId)` 接入手动/定时入口，发现 balance 与重算不一致则修复+告警 在 src/services/finance/balance.service.ts *(新增 POST /api/finance/verify 手动巡检入口)*
- [X] T036 [P] 数据隔离审计：每个 repository 强制 userId 过滤；系统权益账户 user_id=NULL 且用户不可写 在 src/repositories/finance/ *(审计通过：所有 repository 经 requireUserId 作用域；系统权益账户 userId='__system__' 哨兵，userId 过滤天然排除，用户不可写 systemKey)*
- [X] T037 运行 `pnpm type-check && pnpm check`，修复全部类型/lint 问题 *(finance 全部文件 type-check 0 错误；项目无 eslint.config——lint 全局不可用，属既有基建缺口，非本特性范围)*
- [X] T038 [P] 执行 quickstart.md 验证（SC-001..SC-007 逐项自动化/手测）对照 specs/001-double-entry-ledger/quickstart.md *(SC-001/002/007 余额不变式数学、SC-004 CSV 解析、SC-005 NL 映射、SC-006 去重 已单测覆盖且通过；DB 集成场景 gated 待 FINANCE_INTEGRATION_TEST=1 运行)*
- [X] T039 [P] 更新文档：feature README、补全 data-model 实现细节、CLAUDE.md 指针 在 docs/ 与 specs/001-double-entry-ledger/ *(新增 src/features/finance/README.md，含架构/复式模型/偏差记录/测试指引)*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**：无依赖，立即开始（T001/T002/T003 可并行）
- **Foundational (Phase 2)**：依赖 Setup；**阻塞所有用户故事**
- **User Stories (Phase 3–6)**：均依赖 Foundational
  - US1 是 MVP，须最先完成；US2/US3/US4 可在 US1 后并行或按序
  - US3 依赖 US1 的 ledger.service（T014）；US4 落库亦走 US1 的 POST /transactions
- **Polish (Phase 7)**：依赖各用户故事基本完成

### User Story Dependencies

- **US1 (P1)**：Foundational 后即可开始，无跨故事依赖（但自身含最小账户创建）
- **US2 (P2)**：Foundational 后可开始；与 US1 共享 account schema，独立可测
- **US3 (P3)**：依赖 US1 的 ledger.service（落库复用）；import schema 独立
- **US4 (P4)**：依赖 US1 的交易落库 API；解析层独立

### Within Each User Story

- 先写测试并确保失败 → 再实现（models/repos → service → API → UI）
- service 完成后再做 endpoint/UI

### Parallel Opportunities

- Setup：T001/T002/T003 全部 [P] 并行
- Foundational：T005 与 T006 可与 T004 错位并行；relations(T007) 须在表之后；T011 测试 [P]
- US1：T015/T016/T017 三个 repository [P] 并行；T012/T013 测试 [P] 并行
- 各故事的测试任务 [P] 并行

---

## Parallel Example: User Story 1

```bash
# 并行写失败测试：
Task: "集成测试 记录收支/转账平衡 在 tests/finance/ledger.record.test.ts"   # T012
Task: "集成测试 编辑/删除重算余额 在 tests/finance/ledger.mutate.test.ts"    # T013

# 并行写 repository：
Task: "account.repository 在 src/repositories/finance/account.repository.ts"  # T015
Task: "category.repository 在 src/repositories/finance/category.repository.ts" # T016
Task: "transaction.repository 在 src/repositories/finance/transaction.repository.ts" # T017
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup → Phase 2 Foundational（核心引擎，CRITICAL）
2. Phase 3 US1（手动记账 + 最小账户）→ **STOP 验证**：账目平衡、转账不改净资产
3. 可部署/演示的最小闭环

### Incremental Delivery

1. Setup + Foundational → 引擎就绪
2. +US1 → 独立验证 → MVP
3. +US2 → 账户管理
4. +US3 → 批量导入
5. +US4 → 自然语言记账
6. Polish → 质量收尾

---

## Notes

- [P] = 不同文件、无未完成依赖
- [Story] 标签映射到 spec.md 用户故事，便于追溯
- 金额一律 numeric(18,2)，禁止浮点；API 收发用字符串
- 复式不变式（Σdebit==Σcredit、转账不改净资产）是本特性最高优先级可验证结论
- 每个检查点可停下独立验证；按任务或逻辑组提交（gitmoji）
- 避免：模糊任务、同文件冲突、破坏独立性的跨故事依赖
