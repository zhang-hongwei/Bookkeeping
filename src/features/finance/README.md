# Finance — 复式记账核心地基 (Phase 0)

永远平衡的复式账本：账户管理、收支/转账记账、账单批量导入、自然语言记账。
核心硬约束：任何交易后 `Σdebit == Σcredit`，转账不改净资产（SC-001 / SC-002）。

## 架构分层

```
src/database/schema/finance/   Drizzle schema（accounts/categories/transactions+entries/bill-imports/relations）
src/repositories/finance/      数据访问（base + account/category/transaction），强制 userId 作用域
src/services/finance/          领域服务
  balance.service.ts           余额维护 + assertBalanced + recomputeBalance + verifyAll（不变式引擎）
  ledger.service.ts            记账/改/删（事务内原子写 entries + 更新 balance）
  account.service.ts           归档/恢复/带守卫删除（US2）
  import.service.ts            账单导入：解析→去重→preview→confirm（US3）
  nl-record.service.ts         自然语言→候选交易（AI SDK structured output，US4）
  import/parsers.ts            CSV 解析器注册表（Alipay/WeChat/Generic + 表头自动识别）
  money.ts                     金额「分」整数运算（禁浮点）
src/app/api/finance/           Route Handlers（全部 Supabase 认证，userId 取自会话）
src/features/finance/          UI（components / hooks / api 客户端）
```

## 复式记账模型

- 每笔交易展开为 ≥2 条 entries；不变式：同 transaction 内 `Σ(debit) == Σ(credit)`，每条 amount>0。
- 收入/支出的对腿写入**系统权益账户** `__income` / `__expense`（`type=equity`, `userId='__system__'`, `systemKey` 标记），
  使全套账目恒等式成立。系统账户不归属任何真实用户，用户不可见/不可写（userId 过滤天然排除）。
- 账户 `balance` 为物化列，在写 entries 的同一数据库事务内 `balance += signedDelta` 原子维护；
  `recomputeBalance(accountId)` 由 entries 重算用于校验与自愈（SC-007）。
- 资产类（cash/savings/investment/real_asset）借方正常余额；信用类 credit 贷方正常余额（余额体现为欠款）。

## 金额

一律 PostgreSQL `numeric(18,2)`，前端/API 用字符串收发；运算走 `toCents/fromCents` 整数「分」转换，禁浮点。

## 测试

```bash
# 纯单元（无需 DB，默认运行）
pnpm test --run finance

# 集成测试（需 PostgreSQL，finance_* 表已建）
FINANCE_INTEGRATION_TEST=1 pnpm test --run finance
# 测试库建表：node --env-file=.env scripts/init-finance.mjs（指向测试 DATABASE_URL）
```

覆盖：balance 不变式数学（SC-001/002/007）、CSV 解析（SC-004）、NL 候选映射（SC-005）、
导入去重（SC-006）、记账/改/删/账户管理集成。

## 数据库迁移

仓库 drizzle-kit journal 与现有 schema 不一致（`db:generate` 触发交互式 rename），
故 finance 表沿用幂等 `CREATE TABLE IF NOT EXISTS` 范式：

```bash
node --env-file=.env scripts/init-finance.mjs   # 建 finance_* 表 + 种子权益账户
```

## 与设计文档的偏差（实现记录）

- **ID**：用 `uuid().defaultRandom()`（沿用项目既有 `mealRecords` 约定），而非风格指南的 text 前缀。
  tasks T002 已记录此决策。
- **系统权益账户 userId**：data-model 原述 `user_id=NULL`；实现用 `userId='__system__'` 哨兵值，
  因 schema 中 `user_id` 为 `NOT NULL`。语义等价（全局共享、用户不可写），userId 过滤天然排除。
- **opening_balance**：作为账户起始值列（balance = opening + Σentries），不作为分录入账，
  与 balance.service.computeBalanceCents 一致。

## 接入注意

- finance API 使用 **Supabase Auth** 取会话（`requireUserId` → `createSupabaseServerClient` + `auth.getUser()`）。
  `src/middleware.ts` 已用 `updateSession` 刷新会话 cookie，并将 `/finance` 列入受保护路径（未登录跳 `/signin`）。
- 自然语言记账依赖 `OPENAI_BASE_URL` / `OPENAI_AUTH_TOKEN` / `OPENAI_MODEL`；未配置时返回 `candidate:null` + reason。


## Phase 1 增量（002 净资产闭环 + 首份 AI 报告）

在 Phase 0 复式账本之上跑通「数据进 → 净资产 → AI 报告」核心闭环：

- **`net_worth_snapshots`**：每用户每日净资产快照（曲线数据源，`UNIQUE(user_id,date)`）。
  净资产由 `accounts.balance` 严格推导（资产 − 信用欠款）；记账/改/删后重算 `[occurredAt..today]`
  区间（挂 `ledger.service`），首次启用历史回填；`verifySnapshots` 自愈（SC-001）。
- **规则引擎 `rules-engine.service`**（纯函数、零幻觉）：
  - `computeFindings`：income/expense/surplus/savings_rate/debt_ratio/emergency_months（转账不计收支）。
  - `computeHealthScore`：储蓄25/负债25/应急20/投资15/现金流15 加权 0–100；投资率 Phase1 缺失降权重分配、不编造。
- **月报 `report.service`**：findings（事实层）→ LLM 表达（禁算数字）→ markdown 正文；
  LLM 失败/未配置 → 降级 findings 模板（`status=degraded`，数字仍来自 findings，SC-004）；
  `sourceDataHash` 周期数据指纹，查看时比对 → `stale`（FR-010）。
- **OCR 记账 `ocr-record.service`**：多模态识别支付截图 → 候选（多笔/低置信 `requireManualConfirm`），
  确认落库 `source=ocr`（SC-005）。
- **API/UI**：`/net-worth`、`/net-worth/snapshots`、`/findings`、`/health-score`、`/reports[/monthly|/:id/regenerate]`、`/ocr-record`；
  UI 含净资产仪表盘+曲线、健康分雷达、月报视图、截图记账。

**零幻觉红线**：报告中所有具体数字结论只来自规则引擎 findings，LLM 仅表达、失败降级模板。
**性能（T046）**：仪表盘首屏读 `computeNetWorthLive`（balance 推导，O(1)）+ 物化快照曲线，非全量聚合。

## Phase 2 增量（003 资产/负债完整化）

把全部家底（房产/车辆/房贷/车贷/信用卡/借款）登记进来，净资产如实反映，复式不变式贯穿资产生命周期：

- **资产/负债明细**（1:1 挂账户）：`asset_details`（成本/估值来源/置信度/估值历史/已处置）、
  `liability_details`（本金/利率/月供/到期/已还/账单日/还款日）。当前价值/剩余本金 = 账户 `balance`（真相源）。
- **资产登记/列表**（`asset.service`）：`real_asset`/`investment` 账户 + 明细；当前价值=balance、置信度持久、`includeInNetWorth` 生效。
- **资产生命周期**（复式，SC-001）：
  - `revalueAsset`：revaluation 2 腿（资产 ↔ `__revaluation`），balance=新值 + 追加估值历史。
  - `disposeAsset`：disposal 2–3 腿（现金 +proceeds、资产清零、损益入 `__income`/`__expense`）。
- **贷款还款**（`ledger.service.recordRepayment`，SC-001）：本金/利息拆分 3 腿
  （debit 负债 principal、debit `__expense` interest、credit 现金 p+i）；结果：负债 −principal、现金 −(p+i)、
  净资产仅因利息变化（本金对冲不扭曲）、`paidAmount += principal`。
- **信用卡账单周期**（`liability.service.getCreditCardPeriod`，SC-004）：按 `[上账单日, 本账单日)` 聚合
  本期账单/已还/待还 + 还款日倒计时（`dueSoon`/`daysUntilDue`），仅 credit、不自动代扣。
- **流动性视图**：`/net-worth?view=high|all` —— `high` 过滤 `real_asset` 估值点（仅高流动性），`all` 含全部家底。
- **负债一致性巡检**（`balance.service.verifyLiabilityConsistency`，T047 防漂移）：
  对非 credit 贷款校验 `principal − paidAmount == balance`，偏差不自动修复、需人工介入；
  `POST /api/finance/verify` 同时返回账户余额自愈结果与负债偏差。

**不变式延续**：revalue/dispose/repayment 均经 `assertBalanced`，保证 `Σdebit==Σcredit`、转账与还款本金不扭曲净资产。
**隔离**：所有 `/assets`、`/liabilities`（含 `[id]/revalue|dispose|repay|billing`）路由经 `requireUserId`，
service 层 `fetchAssetAccount`/`fetchLiabilityAccount`/`recordRepayment` 全部按 `userId` 作用域，越权视为不存在。
