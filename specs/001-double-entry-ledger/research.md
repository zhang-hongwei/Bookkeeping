# Research — 复式记账核心地基 (Phase 0)

> Phase 0 输出：解决 Technical Context 中的所有技术决策点。每项给出 Decision / Rationale / Alternatives。

## R1. 复式记账的数据模型落地

**Decision**：采用 `transactions`（业务事件）+ `entries`（复式分录腿）两张表。每笔交易产生 ≥2 条 entries；**不变式**：同一 transaction 内 `Σ(debit) == Σ(credit)`。收入/支出通过对腿写入**系统权益账户** `__income` / `__expense`（type=`equity`，系统级，用户不可见），使全套账目恒等式 `Σ资产 = Σ负债 + Σ权益` 成立。

**Rationale**：转账（资产↔资产）天然平衡、净资产不变；收入 = 借资产 + 贷 `__income`；支出 = 借 `__expense` + 贷资产。这样净资产 = `Σ(资产账户余额) − Σ(负债账户余额)` 可严格由分录推导，且全部交易都满足同一平衡不变式，可统一校验。

**Alternatives**：
- *单边流水（只记 amount + account）*：rejected——无法表达转账的双边性、无法保证"转账不改净资产"、无法做平衡审计。
- *为收支特判（不走权益账户）*：rejected——出现两类规则（转账要平衡、收支不要），校验逻辑分裂，易出 bug。

## R2. 金额存储类型

**Decision**：所有金额用 PostgreSQL `numeric(18, 2)`（Drizzle `decimal({ precision: 18, scale: 2 })`）。**禁止浮点**。CNY 2 位小数（元/角/分）足够；18 位精度覆盖极端大额。

**Rationale**：浮点累加误差会破坏 SC-001（账目平衡 = 0 误差）。`numeric` 精确十进制，是财务金额的标准选择。

**Alternatives**：`integer` 存分（×100）——可行但读写需换算、可读性差；Phase 0 用 `numeric(18,2)` 更直观，分单位留作后续优化备选。

## R3. 余额：物化 vs 实时聚合

**Decision**：账户 `balance` 为**物化列**，在每次记账/改/删的**同一数据库事务**内原子更新（`UPDATE accounts SET balance = balance + <signed delta>`）。并提供 `recomputeBalance(accountId)` 重算函数用于校验与修复。

**Rationale**：实时聚合全量 entries 在明细增多后会变慢；物化余额给 O(1) 读取，事务内更新保证一致性；重算函数提供自愈与不变式校验入口（对应 SC-007）。

**Alternatives**：纯实时聚合（view/sum）——读放大，Phase 0 单用户可接受但扩展性差；物化视图——Postgres MV 刷新复杂、与事务时机难对齐。

## R4. 复式平衡的强制执行

**Decision**：**应用层强制**为主——`ledger.service` 在一个 DB 事务内原子写入 transaction + 全部 entries，写入前校验 `Σdebit==Σcredit` 且金额>0，不平衡则整体回滚。**测试**覆盖所有路径（SC-001）。**可选纵深防御**：后续追加一个 Postgres deferred trigger 校验（跨行 CHECK 无法直接表达，需 trigger）。

**Rationale**：Postgres `CHECK` 约束无法跨行（无法在同一 SQL 约束里 sum 同组 entries），故核心强制放在事务+应用层；这是可测试、可审计的最小正确实现。

**Alternatives**：纯 trigger 强制——增加 DB 复杂度、调试困难，Phase 0 不必要（留作纵深防御）。

## R5. 账户类型与余额方向（normal balance）

**Decision**：`accounts.type` ∈ {`cash`,`savings`,`credit`,`investment`,`real_asset`}。每类有"正常余额方向"：资产类（cash/savings/investment/real_asset）借方增加；负债类（credit）贷方增加。`balance` 物化列统一存"对该账户的净影响"（资产类 = 借−贷，负债类 = 贷−借），UI 按类型展示（信用卡显示为欠款/可用额度）。

**Rationale**：标准复式记账方向；让"信用卡消费增加欠款"自然成立，无需特判。

**Alternatives**：全部按"正=钱多了"存——会让信用卡欠款与资产混在同一符号语义里，净资产计算需特判、易错。

## R6. 币种

**Decision**：Phase 0 单币种 CNY。`accounts.currency` 列存在且默认 `CNY`，但不实现汇率/换算；跨币种交易在本阶段拒绝或按 CNY 记录（标注）。

**Rationale**：Spec 假设明确单币种起步；预留 `currency` 字段避免后续迁移。

## R7. CSV 账单导入

**Decision**：可插拔解析器注册表（`AlipayParser`、`WeChatParser`、`GenericCSVParser`），按表头自动识别格式。流程：上传 → 解析为候选 `bill_import_rows` → 进入 `preview` 状态供用户预览/调整 → 确认后落库为 transactions+entries。**去重**：对每行计算归一化哈希 `hash(occurred_at + amount + counterparty + memo)`，落库前与该用户已有 rows 比对，重复则跳过并计数。

**Rationale**：支付宝/微信导出格式各异且会变，可插拔解析器便于维护；预览+确认满足"导入可控"；哈希去重满足 SC-006（重复导入不产生重复）。

**Alternatives**：硬编码单一格式——脆弱；导入即落库无预览——不可控、错误难回滚。

## R8. 自然语言记账

**Decision**：用 Vercel AI SDK 6 的 **structured output**（Zod schema）把一句话解析为候选交易：`{ amount, type, categoryId?, accountId?, occurredAt?, note? }`。默认 `occurredAt=now`、`accountId=用户默认账户`。产出**候选**交用户确认（confidence 低时强制确认），不直接落库。

**Rationale**：复用项目已有 AI 对话能力（`ai`/`@ai-sdk/openai`、009 多模态分支）；structured output 给可校验的结构化结果；确认环节满足 SC-005（解析成功率）与"不误落库"。

**Alternatives**：正则解析——覆盖差、维护痛苦；直接落库——风险高。

## R9. 并发与一致性

**Decision**：所有余额变更在单个 DB 事务内完成（写 entries + 更新 balance 原子）。单用户场景冲突概率低；后续多端/家庭场景再上 `SELECT ... FOR UPDATE` 行锁或乐观锁。

**Rationale**：Phase 0 单用户，事务原子性已足够保证 SC-001；避免过早引入锁复杂度。

## R10. 数据隔离

**Decision**：所有表带 `user_id`（text，关联 users），repository 层强制按 `userId` 过滤（与现有 `mealRecords` 一致）。系统权益账户 `user_id = NULL`（全局共享，用户不可写）。

**Rationale**：满足 FR-013（数据按用户隔离）；与现有 schema 风格一致。Postgres RLS 留作后续纵深防御。

## R11. ID 与时间戳约定

**Decision**：新表主键用 `text` + 有意义前缀生成（`acc_`/`cat_`/`txn_`/`ent_`/`imp_`），沿用 CLAUDE.md Drizzle 风格指南的 ID 前缀目的；若项目无现成 `idGenerator`，用 `nanoid` + 前缀。时间列用 `timestamptz`。若项目存在 `_helpers.ts` 的 `timestamps` 则复用，否则内联 `created_at/updated_at`。

**Rationale**：前缀 ID 便于区分实体、调试友好；与风格指南一致。**实现前确认**：项目是否已有 `idGenerator`/`_helpers.ts`（现有 `mealRecords` 用 `uuid`+`defaultRandom`，属另一风格——新表优先采用风格指南的前缀方案，并在 tasks 中标注此确认项）。
