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

## Phase 6 增量（007 AI 财富顾问：预测 / 预警 / 顾问 / 审批 / 趋势）

在 Phase 0–4 完整个人财务模型与规则引擎之上，把顾问从「事后报告」升级为「事前预警 + 个性化对话」。
严格沿用设计 §5 双层架构：**事实层 = 规则引擎（纯函数，可复现可追溯）**，**表达层 = LLM（只表达、禁算数字）**。
设计依据 `specs/007-ai-wealth-advisor/`（plan/research/data-model/contracts/quickstart）。

新增 6 张表（`finance_` 前缀、`userId` 隔离、`onDelete:cascade`、金额 `decimal`）：
`finance_cash_flow_forecasts`、`finance_smart_alerts` + `finance_alert_preferences`、
`finance_advisor_sessions` + `finance_advisor_messages`、`finance_approvals`。不改既有表结构
（健康分完善、趋势指标均为代码层；`transactions.anomaly_flag` 为最小向后兼容增量）。

### 能力

- **现金流预测**（`forecast.service`，FR-001）：透明回归（线性趋势 + 月度季节 + 残差 σ 区间）纯函数；
  历史不足 `< MIN_HISTORY_MONTHS` → `insufficientHistory=true`、空 points（SC-005）；前向推演定位应急金不足月。
- **智能预警**（`alert.service`，FR-002/FR-008）：规则触发的提前预警（应急金/储蓄率下降/负债过高/趋势恶化），
  依据可追溯（`ruleFindingRefs`），`(userId,kind,period)` 幂等不疲劳，可按 kind 静默。
- **个性化顾问对话**（`advisor.service`，FR-003/FR-007）：自然语言问答，回答中的数字**来自规则引擎**（零幻觉），
  `citedFindings` 为结构化可追溯锚点；LLM 失败/未配置 → 降级模板（`degraded=true`，SC-005）。
- **审批闭环**（`approval.service`，FR-004/SC-003）：高风险动作（标记异常/调仓建议/改写结论/补录记账）走
  `提议 → 规则校验 → 用户审批 → 才落库`；未审批**绝不**落库，apply 幂等（I8）；改账目动作复用 `ledger.service`
  平衡校验（不破坏 Phase 0 不变量，I2）。kind 白名单 + 状态机 + 双校验（propose 门控 + apply 防御）。
- **多期趋势对比**（`trend.service`，FR-005/SC-004）：纯函数聚合 `listReports` + 各期 findings →
  时序 + 方向（↑/↓/平稳）+ 显著恶化标记；值与各期报告结论一致。
- **健康分完善**（`rules-engine.service`，FR-006）：`investmentRate` 接 Phase 3 持仓、`cashflow` 改方差稳定性评分。

### 两条红线（FR-007 / FR-009 / FR-010）

1. **零幻觉**：所有数值结论只来自规则引擎（纯函数）；LLM 只做表达，失败降级模板；不存储 LLM 捏造的数字为权威结论。
2. **高风险必走审批**：`proposalId` 仅创建 `proposed` 提议，落库只经显式审批 + apply 再校验，apply 幂等。
3. **可追溯 + 合规**：预测/预警/顾问/趋势/健康分响应统一经 `DisclaimerEnvelope`（`disclaimer` 非投资建议 + `sourceRefs` 来源锚点）；
   所有路由按 `userId` 隔离，越权访问 → **404**（不泄露存在性）。

### API / UI

`/forecasts`、`/alerts[[/id]|/preferences}`、`/advisor/sessions[[/id]/messages]`、
`/approvals[[/id][/apply]}`、`/trends`、`/health-score`；UI 组件 `ForecastPanel` / `AlertsPanel` /
`AdvisorChat` / `ApprovalCenter` / `TrendComparison`（均带免责 + 「为什么是这个数」来源展开）。

### 测试

```bash
# 007 纯单元（无需 DB，默认运行）
pnpm test --run --silent='passed-only' 'tests/finance/forecast'
pnpm test --run --silent='passed-only' 'tests/finance/alert'
pnpm test --run --silent='passed-only' 'tests/finance/approval'
pnpm test --run --silent='passed-only' 'tests/finance/advisor'
pnpm test --run --silent='passed-only' 'tests/finance/trend'
pnpm test --run --silent='passed-only' 'tests/finance/rules-engine'
```

覆盖不变量 I1–I8：预测纯函数可复现（I3）、预警幂等（I6）、审批状态机 + 走 ledger 平衡（I2/I8）、
顾问降级（I7）、`citedFindings`/`ruleFindingRefs` 可追溯（I1）、金额 decimal（I4）。

> 迁移：`pnpm drizzle-kit generate`（增量 6 表 + `anomaly_flag`）。注意 drizzle-kit 交互式 rename
> 需真实 TTY，沙箱内无法运行——schema 已就绪，需在真实终端生成（见 tasks T010/T027）。

## Phase 5 增量（006 预算与目标）

在 Phase 0–4 之上引入**主动控制**层：分类预算（实时已用/剩余 + 超支预警）与储蓄目标（进度 + 预计达成时间）。
**零侵入**——仅增量 3 张表（`finance_budgets` / `finance_budget_periods` / `finance_goals`），不改任何既有表列。
设计依据 `specs/006-budget-goals/`（plan/research/data-model/contracts/quickstart）。

### 核心铁律（单一事实源，I1/SC-001）

预算「已用」、目标「当前金额」、ETA **全部派生**自 transactions/accounts/净资产，**无物化 live 列**——
每次读时现算，不一致发生率 = 0 由构造保证（无同步漂移面）。

### 能力

- **分类预算**（`budget.service`，FR-001/002/003/004）：按分类**子树**（含父子后代）设周期预算
  （month/week/year），实时计算已用/剩余/状态（normal/warning/overrun，D3 确定性纯函数 `BudgetAlert`）；
  达阈值（默认 0.80，可配 D10）或超支时预警；跨周期自动重置；历史周期快照不可变（`amountSnapshot` 锁定，I3/SC-005）。
- **储蓄目标**（`goal.service`，FR-005/006/007）：三口径进度（`manual`/`linked`/`net_worth`，D4 消歧）；
  ETA = 近 N 月平均结余 + ceil（D5，可复现）；负/零结余 → `unreachable` 无虚假日期（I5/SC-003）；
  无截止日开放式目标仅显进度不估 ETA。
- **规则驱动信任**（`budget-goal-facts`，US3/FR-008/SC-004）：预算/目标数值结论为确定性纯函数产出，
  作为结构化事实喂给 AI 月报；LLM 仅表达，**不得**编造金额。

### 关键约定

- **子树汇总 + 单预算零双计**（I8）：一笔交易对一个预算至多一次；父类与子类预算各自追踪、重叠为正确。
- **仅 expense 计入预算**（I7）：transfer/repayment/revaluation/disposal 排除。
- **写后回带**（D9）：`POST/PATCH /transactions` 响应可选附 `budgetAlerts`（best-effort、非阻塞，
  在路由层计算，保持 `ledger.service` 复式核心不耦合预算模块）。
- **隔离**（I6/C7）：所有预算/目标路由经 `requireUserId`；跨用户访问 → **404**（不泄漏存在性）；
  重复建预算 / linked 账号不属用户 → 422 INVARIANT。

### API / UI

`/budgets[[/id]|/alerts|/id/periods]`、`/goals[[/id]|/id/progress]`；UI 组件 `BudgetForm` /
`BudgetProgressRing` / `BudgetAlertsBanner` / `BudgetHistoryChart` / `GoalForm` / `GoalCard` / `GoalProgressDetail`。

### 测试

```bash
pnpm test --run --silent='passed-only' 'tests/finance/budget'
pnpm test --run --silent='passed-only' 'tests/finance/goal'
```

纯函数测试始终运行（周期边界 / 子树汇总 I7/I8 / BudgetAlert D3 / ETA D5 + unreachable I5）；
集成测试由 `FINANCE_INTEGRATION_TEST=1` 门控（已用实时一致 I1、超事事中预警 SC-002、历史不可变 I3）。

> 迁移：`pnpm db:generate`（增量 3 表 + 索引）。注意 drizzle-kit 交互式 rename 需真实 TTY，
> 沙箱内无法运行——schema 已就绪，需在真实终端生成（见 tasks T005）。

## Phase 7 增量（008 高级分析：what-if / 个税 / 退休 / 组合）

在 Phase 0–6 完整财务模型之上新增**四类高级分析**，全部沿用全域红线——
**确定性纯函数引擎负责一切数字结论，LLM 仅解读、零编造**（research.md NC5）。
设计依据 `specs/008-advanced-analytics/`（plan/research/data-model/contracts/quickstart）。

### 双层架构（脊柱，NC5/NC7）

每个分析 = **一个确定性纯函数引擎**（导出供单测、零幻觉、可复现）+ **服务层取数 → 引擎 → 落表** +
**可选 LLM `/interpret` 解读层**（仅消费引擎结构化结果、过零编造校验）。
引擎结果带溯源四元组 `engineVersion` + `assumptions` + `disclaimers` (+ `ruleVintage` / `targetBandsVersion`)，
落表可追溯、可复现（SC-004）。前端始终渲染引擎数字，解读文本仅旁注。

### 5 张新表（纯增量，不改既有表）

`finance_scenarios` + `finance_scenario_projections`（what-if）、`finance_tax_estimates`（个税）、
`finance_retirement_simulations`（退休）、`finance_portfolio_hints`（组合，按 batchId 整组覆盖）。

### 四引擎 / 四能力

- **What-if 情景模拟**（`projection.engine` + `scenario.service`，US1/P1，MVP）：降薪/加息/大额支出/失业等
  假设下，确定性投影净资产曲线（baseline vs scenario）+ 应急金月数；`netWorthDelta = scenario − baseline`（I3），
  同输入可复现（SC-001）；无历史结余 → `degraded`（NC6，不编造）。
- **中国个税估算**（`tax.engine` + `tax.service`，US2/P2）：七级累进 + 速算扣除 + 年终奖单独/合并计税对比（I5），
  规则取自版本化 `taxRuleConfig`（`ruleVintage`，I7）；与权威计算器一致（末位差，SC-002）；强制「非税务建议」（I6）。
- **退休模拟**（`projection.engine` 复用 + `retirement.service`，US3/P3）：三点区间（悲观/中性/乐观，I8 单调）
  + 可持续性判定；强制「长期模拟含强假设，区间仅供方向参考，非确定预测」（SC-003/I9）；40 年×12 月纯内存循环（NC8）。
- **组合优化方向**（`portfolio-hint.engine` + `portfolio-hint.service`，US4/P4）：扩展 `computeConcentrationAlert`
  范式，按资产类别（现金/固收/权益/另类）聚合占比 vs 版本化 `targetBands`，输出方向 under/over/ok（I10）；
  **hint 仅方向、不含品种/买卖数量**（I11，FR-004）；无持仓 → 空 hints（NC6）。

### 可信边界 / 降级语义

- **易变口径走版本化配置**（NC1/NC3/NC4）：个税税率表/扣除额、组合目标区间、退休默认假设均为
  `src/services/finance/config/` 下**版本化配置**（`ruleVintage`/`targetBandsVersion`），不硬编码——法规/数据变更只改配置 + 升版本。
- **数据不足即降级，不编造**（NC6）：每引擎显式 `status='degraded'` + `missing[]`，HTTP **200**（非错误）—— SC-005。
- **共享溯源/免责工具**（`_lib/analysis-common.ts`）：`disclaimersFor(category)` 按类别注入免责（税务/退休/组合各有专属），
  `interpretStructured` + `ZERO_FABRICATION_SYSTEM` 强约束 LLM「严禁编造数字」，失败/未配置 → 空文本（LLM_UNAVAILABLE，HTTP 200）。

### API / UI

`/scenarios[[/id]|/id/interpret]`、`/tax-estimates[[/id]/interpret|?taxYear=]`、
`/retirement[/latest|/id/interpret]`、`/portfolio-hints[/interpret]`；UI 组件 `ScenarioSimulator` /
`TaxEstimator` / `RetirementSimulator` / `PortfolioOptimization`（结构化数字必渲染 + `disclaimers` 强渲染 + AI 解读旁注）。

### 测试

```bash
# 纯函数引擎（确定性、可复现 —— 始终运行、不依赖 FINANCE_INTEGRATION_TEST）
pnpm test --run --silent='passed-only' 'tests/finance/projection.engine.test.ts'
pnpm test --run --silent='passed-only' 'tests/finance/tax.engine.test.ts'
pnpm test --run --silent='passed-only' 'tests/finance/portfolio-hint.engine.test.ts'

# 服务层集成（门控 FINANCE_INTEGRATION_TEST=1，需真实 PostgreSQL）
pnpm test --run --silent='passed-only' 'tests/finance/scenario.service.test.ts'
pnpm test --run --silent='passed-only' 'tests/finance/tax.service.test.ts'
pnpm test --run --silent='passed-only' 'tests/finance/retirement.service.test.ts'
pnpm test --run --silent='passed-only' 'tests/finance/portfolio-hint.service.test.ts'
```

覆盖不变量 I3/I5/I6/I7/I8/I9/I10/I11 + SC-001/002/003/004/005：投影 diff 行内一致（I3）+ 可复现、
个税与权威一致 + 计税对比（I5/I7）、退休三点单调 + 不确定性免责（I8/I9）、组合方向正确 + 不含品种数量（I10/I11）、
降级不编造（SC-005）。

> 迁移：5 表 schema 已就绪（`src/database/schema/finance/`）。注意 drizzle-kit 交互式 rename 需真实 TTY，
> 沙箱内无法运行——需在真实终端 `pnpm db:generate` 生成迁移（见 tasks T008）。
