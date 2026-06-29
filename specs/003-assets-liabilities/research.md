# Research — 资产/负债完整化 (Phase 2)

> Phase 0 输出：解决 Technical Context 中的所有技术决策点。每项给出 Decision / Rationale / Alternatives。
> 大前提：Phase 2 **依赖 Phase 0 复式记账地基 + Phase 1 净资产快照/曲线已实现**（accounts/transactions/entries、`balance.service`、`ledger.service`、系统权益账户 `__income`/`__expense`、`net_worth_snapshots`、`net-worth.service`）。资产/负债估值、还款正确性、曲线平滑全部建立在 Phase 0/1 之上。
> 模型真相源：当前**实际 schema** 用 `uuid('id').defaultRandom()`、`text('user_id')`（不加 FK，沿用 mealRecords 约定）、`numeric(18,2)`、`jsonb` 分项——本计划据此设计，不沿用早期 data-model 文档里「text 前缀主键」的设想描述。

## R1. 资产/负债的建模：账户（复式锚点）+ 1:1 明细表

**Decision**：沿用 Phase 0「账户 = 钱存放的位置 = 复式分录腿的唯一锚点」模型。资产/负债**就是账户**：
- **资产账户**：`cash`/`savings`/`investment`/`real_asset`（Phase 0 已有，借方正常余额）。新增 `finance_asset_details`（1:1 挂账户）承载 `costBasis`、`valuationSource`、`estimateConfidence`、`valuationDate`、`valuationHistory(jsonb)`。**当前价值 = 账户 `balance`**（真相源，由分录维护），明细表不冗余存当前价值，只存「估值元数据 + 历史」。
- **负债账户**：`credit`（Phase 0 已有）+ Phase 2 新增 `mortgage`/`car_loan`/`consumer_loan`/`borrowing`（均为贷方正常余额，`balance` 正值 = 欠款）。新增 `finance_liability_details`（1:1）承载 `kind`、`principal`、`interestRate`、`monthlyPayment`、`dueDate`、`paidAmount`、`statementDay`/`repaymentDay`。**剩余本金/当前欠款 = 账户 `balance`**（真相源），明细表不冗余存「剩余本金」，避免双写漂移。

**Rationale**：
- 复式不变式要求 `balance` 只能由 `entries` 维护（Phase 0 `balance.service`）。把当前价值/欠款继续用 `balance` 表达，天然复用 `ledger.service` 的记账/余额/快照刷新全套机制，零重复。
- 元数据（成本/利率/月供/置信度）字段多且类型相关，单独明细表与账户余额职责分离，账户表不臃肿（避免把 `creditLimit` 模式扩展到 10+ 列）。
- 符合设计 P3「领域模型是真相源」、§3.1/§3.5 的领域模型划分。

**Alternatives**：
- 全部加列到 `finance_accounts`——表臃肿、空列多、违反单一职责。拒绝。
- 独立 `assets`/`liabilities` 表不挂账户——破坏复式锚点，当前价值/欠款须双写（账户 balance + 表 value），必然漂移。拒绝。
- 早期 002 data-model 设想的「text 前缀主键（snap_/fnd_…）」——**实际实现用的是 `uuid().defaultRandom()`**，本计划以实际为准。

## R2. 估值置信度：枚举 + 曲线标记 + 流动性视图

**Decision**：
- `estimateConfidence` 为枚举 `high`/`medium`/`low`（高/中/低），存于 `finance_asset_details`，默认 `medium`。现金/储蓄类不计置信度（无明细表）；`real_asset`/`investment` 必填。
- **流动性视图（设计 D2/P6、FR-003）**：净资产曲线支持「仅高流动性资产」(`high`) vs「全部资产」(`all`) 切换：
  - 高流动性 = 资产类型 ∈ {`cash`,`savings`,`investment`} 且 `includeInNetWorth=true`。
  - 低流动性「估值点」= `real_asset`（及其它非现金估值资产），在曲线上单独标记/着色，`high` 视图过滤之。
  - `low` 置信度估值在资产卡片与曲线点上加视觉标记（如虚线/灰点），不静默混入主曲线。
- **从现有快照派生**：`net_worth_snapshots.breakdown` 已按账户类型存分项，因此「高流动性净资产」= `(breakdown.cash+savings+investment) − totalLiabilities` 可即时算出，**快照表无需新增列**。`net-worth` / `net-worth/snapshots` 路由加 `?view=high|all` 参数即时派生。

**Rationale**：
- 兑现 P6「诚实估值」与 D2「估值不计入主曲线、单独标记、可切换」，避免房产估值污染主曲线。
- 复用 Phase 1 快照 `breakdown`，零额外物化成本；置信度是「当前估值」的属性（资产卡片/今日点标记），历史曲线点按类型标记估值段即可。

**Alternatives**：
- 给快照表加 `confidence` 维度并逐日物化——过度物化，置信度随估值更新频繁、历史回溯意义不大。
- 只支持单一视图（要么全计要么全不计）——无法满足「登记全部家底 + 一键切换高流动性」双重诉求（US1 vs D2）。

**默认视图的张力处理**：US1 要「仪表盘反映全部家底」，D2 要「估值默认不计入主曲线」。本计划取：仪表盘默认 `all`（反映家底），曲线提供显著开关切到 `high`；`real_asset` 默认 `includeInNetWorth=true`（是家底的一部分），由 `view` 参数而非 `includeInNetWorth` 控制是否进「高流动性」视图。两者通过「视图切换 + 置信度标记」同时满足。

## R3. 贷款还款：repayment 交易类型 + 本金/利息 3 腿拆分

**Decision**：新增 `repayment` 交易类型（设计 §3.2 列举 `loan/repay`）。`ledger.service.recordRepayment({ userId, liabilityAccountId, cashAccountId, principal, interest, occurredAt, note })` 在单事务内：
1. 构造 3 腿分录（金额一律「分」整数，落库前 `assertBalanced`）：
   - `debit` 负债账户 `principal`（减少欠款，负债为贷方正常，借方减少）；
   - `debit` `__expense` `interest`（利息计入支出）；
   - `credit` 现金账户 `principal+interest`（现金减少合计）。
   - 校验：`Σdebit(principal+interest) == Σcredit(principal+interest)` ✓，账目平衡。
2. 写 `transactions(type=repayment, amount=principal+interest, principalAmount=principal, interestAmount=interest)` + 3 条 `entries` + 原子更新负债账户与现金账户 `balance`（沿用 `computeDeltas`/`signedDeltaCents`）。
3. 更新 `finance_liability_details.paidAmount += principal`（已还本金累计）。
4. 事务提交后 `refreshSnapshots(userId, occurredAt)`。

**结果（SC-001）**：剩余负债 `−principal`、现金 `−(principal+interest)`、净资产 `−interest`（仅利息部分改变净资产，本金对冲不扭曲）、资产端不变——错账发生率 = 0。

**Rationale**：
- 还款是「复式记账在负债场景正确性的试金石」（Spec US2），必须本金/利息严格拆分、3 腿平衡。设计 §3.2 已把 `repay` 列为交易类型。
- `principalAmount`/`interestAmount` 落在 `transactions` 上（nullable，仅 repayment 填），便于「利息支出」报表与拆分追溯；利息腿同时走 `__expense`，保证支出统计自然包含利息。

**Alternatives**：
- 套用 `transfer`——无法表达本金/利息拆分，利息无法计入支出。拒绝。
- 让 LLM 或前端拆分——金额结论必须确定性（红线 P5），拆分由服务层确定性完成。拒绝。
- 把本金/利息存 jsonb——查询/聚合不便，`numeric` 列更可审计。

**提前还款（Edge Case）**：`recordRepayment` 支持传入「提前还款」标记时，额外重算 `liability_details.dueDate`（按剩余本金/月供/利率重算到期）或仅更新 `paidAmount`，由调用方语义决定；本阶段先支持「常规还款 + paidAmount 累计」，提前还款重算到期作为可选增强在 data-model 标注。

## R4. 资产估值更新：revaluation 交易类型 + __revaluation 系统权益账户

**Decision**：资产估值更新必须经分录才能改 `balance`（Phase 0 不变式）。新增：
- 系统权益账户 `__revaluation`（未实现损益桶），加入 `EQUITY_ACCOUNT_NAMES`、由 `ensureSystemEquityAccounts` 幂等创建（`user_id='__system__'`，`includeInNetWorth=false`，不计净资产）。
- `revaluation` 交易类型 + `asset.service.revalueAsset({ userId, assetAccountId, newValue, confidence?, source?, occurredAt })`：
  1. 读当前 `balance`，算 `delta = newValue − balance`（可正可负）。
  2. 若 `delta>0`：`debit` 资产 `delta`、`credit` `__revaluation` `delta`（资产升值，未实现收益入权益）。
  3. 若 `delta<0`：`debit` `__revaluation` `|delta|`、`credit` 资产 `|delta|`（资产贬值）。
  4. 单事务：写 `transactions(type=revaluation)` + 2 腿 `entries` + 更新资产 `balance` + 更新 `asset_details.valuationDate/confidence/source` + 追加 `valuationHistory`（`{date,value,confidence,source}`）。
  5. `refreshSnapshots(userId, occurredAt)`（FR-008）。

**Rationale**：
- 余额只能由分录改——估值更新本质是一笔「调整资产至新估值」的复式交易，对腿用独立的 `__revaluation` 权益桶，与已实现 P&L（`__income`/`__expense`）分离，保证会计恒等式 `Σ资产 = Σ负债 + Σ权益` 成立、不虚增收入。
- `valuationHistory` 保留估值轨迹，满足 Edge Case「资产贬值…保留估值历史以便回溯」。
- `__revaluation` 不计入净资产（`includeInNetWorth=false`，系统账户），与现有 `__income`/`__expense` 处理一致。

**Alternatives**：
- 直接 `UPDATE balance`——绕过分录，破坏复式不变式与审计能力。拒绝。
- 估值变动入 `__income`/`__expense`——把未实现估值变动混入已实现收支，扭曲收支统计。拒绝。
- 单独估值历史表——jsonb 数组足够（点查为主、无需关系查询）。

## R5. 资产处置（出售）：disposal 交易类型 + 实现损益

**Decision**：新增 `disposal` 交易类型 + `asset.service.disposeAsset({ userId, assetAccountId, cashAccountId, proceeds, occurredAt })`：
1. 读资产当前 `balance`（账面价值）与 `asset_details.costBasis`（成本，用于判断真实盈亏的可选参考）。
2. 单事务构造分录（`assertBalanced`）：
   - `debit` 现金 `proceeds`（收到出售款）；
   - `credit` 资产 `balance`（资产出账、清零）；
   - 差额 `gap = proceeds − balance`：`gap>0` 实现（资本）收益 → `credit` `__income` `gap`；`gap<0` 实现损失 → `debit` `__expense` `|gap|`。
   - 校验：`Σdebit(proceeds + 损失) == Σcredit(balance + 收益)` ✓。
3. 更新资产 `balance`（清零）、`asset_details` 标记已处置（或归档账户），`refreshSnapshots`。

**Rationale**：
- Edge Case「出售资产应正确从总资产移除、现金等额增加、不产生虚假收益除非有实际盈亏」——`proceeds` vs `balance` 的差额才是真实盈亏，差额入 `__income`/`__expense`，不虚增。
- 复式平衡由「现金 + 损益腿」对冲「资产清零腿」天然保证。

**Alternatives**：
- 把处置简化为 transfer——无法表达盈亏（proceeds≠balance 时账目不平）。拒绝。
- 盈亏参考 `costBasis`——成本是「税基」概念，账面价值（balance）才是「当前净资产影响」基准；本阶段以 `balance` 判盈亏，`costBasis` 仅作展示/未来税务参考。

## R6. 信用卡账单周期：账单日/还款日 + 由分录聚合本期

**Decision**：信用卡（`credit` 账户 + `liability_details` `statementDay`/`repaymentDay` 为月内日 1–31）：
- `getCreditCardPeriod(accountId)` 由 `entries` 聚合当前账单周期：
  - **账单周期**：`[上一个 statementDay, 当前 statementDay)`（跨月自动滚动）。
  - **本期账单金额** = 该账户在周期内的消费 = `Σ credit 侧分录`（消费使欠款增加）。
  - **本期已还** = 周期内 `Σ debit 侧分录`（还款使欠款减少，即 `repayment` 交易对本账户的本金腿）。
  - **剩余待还** = 本期账单 − 本期已还。
- **还款提示（FR-006）**：临近 `repaymentDay`（如前 3 天）且剩余待还 > 0 → 接口返回 `dueSoon: true` + `daysUntilDue`；**不自动代扣、不存任何凭证**（Spec Assumptions / 设计 §9）。

**Rationale**：
- 信用卡欠款 `balance` 已是真相源；账单周期是「对已有分录按时间窗聚合」的派生视图，无需新表。`statementDay`/`repaymentDay` 是配置项，存 `liability_details`。
- 「全额还款」= 一笔 `repayment`（principal=剩余待还, interest=0 或按分期），还款后欠款归零、本期账单标记已还清（US3-AC3）。

**Alternatives**：
- 单独 `credit_statements` 表物化每期账单——本期账单可由分录实时聚合，物化徒增一致性维护负担；未来若需「历史账单回看」可再物化。本阶段聚合即可。

## R7. 负债类型扩展与 net-worth.service 关键改造

**Decision**：
- `ACCOUNT_TYPES` 追加 `mortgage`/`car_loan`/`consumer_loan`/`borrowing`；新增导出 `LIABILITY_ACCOUNT_TYPES = ['credit','mortgage','car_loan','consumer_loan','borrowing']`。
- `ASSET_ACCOUNT_TYPES` 不变（仍借方正常）；`normalBalanceIsDebit` 天然正确（非资产非 equity 即贷方正常）——**无需改动**。
- **`net-worth.service` 改造**：`computeNetWorthFromAccounts` / `computeNetWorthAtDatePure` 中负债识别从 `a.type === 'credit'` 改为 `LIABILITY_ACCOUNT_TYPES.includes(a.type)`；`breakdown` 按类型聚合天然覆盖新类型。
- `validation.ts` 的 `createAccountSchema.type` 枚举追加 4 个贷款类型；`createTransactionSchema.type` 追加 `repayment`/`revaluation`/`disposal`。

**Rationale**：
- Phase 0/1 硬编码 `credit` 为唯一负债，Phase 2 必须扩展，否则房贷/车贷不计负债、净资产虚高，直接违反 SC-003。
- 用常量数组集中表达「哪些是负债」，避免散落 if；`netWorthCents`/`signedDeltaCents` 等纯函数天然兼容。

**Alternatives**：
- 维持单 `credit` + 一个 `kind` 字段区分贷款——`kind` 在 `liability_details` 已有，但账户 `type` 也需区分（影响借/贷正常余额方向判定与流动性视图），分开类型更清晰、与 Phase 0 枚举风格一致。

## R8. 余额真相源与「剩余本金/已还」的关系（防漂移）

**Decision**：明确单一真相源，避免双写：
- **贷款剩余本金 / 信用卡当前欠款 = 账户 `balance`**（由分录维护，权威）。
- `finance_liability_details` 存：`principal`（原始本金，建账时定，不变）、`paidAmount`（已还本金累计，由 `recordRepayment` 单调递增）、`interestRate`/`monthlyPayment`/`dueDate`（贷款参数）。
- 「剩余本金」查询 = `balance`；「累计已还本金」= `paidAmount`；「原始本金」= `principal`。三者各司其职，无冗余同义字段。

**Rationale**：Spec FR-002/FR-005 要求追踪「剩余本金/已还金额」，但若再冗余存一份「剩余本金」会与 `balance` 漂移。以 `balance` 为唯一真相源，`paidAmount` 仅记累计还款（不可由 balance 反推原始本金，故需独立存），关系清晰、可校验（`principal − paidAmount` 应近似 `balance`，偏差即数据异常，可作巡检项）。

**Alternatives**：把「剩余本金」也存明细表——双写必然漂移，校验复杂。拒绝。

## R9. 对 Phase 0/1 的依赖与 schema 增量清单

**Decision**：Phase 2 不重做账本/快照，仅在 Phase 0/1 schema 上**增量**：
- `accounts.ts`：`ACCOUNT_TYPES` += 4 贷款类型；+ `LIABILITY_ACCOUNT_TYPES` 导出；`EQUITY_ACCOUNT_NAMES` += `revaluation`。
- `transactions.ts`：`TRANSACTION_TYPES` += `repayment`/`revaluation`/`disposal`；+ `principalAmount`/`interestAmount`（`numeric(18,2)` nullable）。
- 新增 `finance_asset_details`、`finance_liability_details`（见 data-model.md）。
- 复用 `balance.service`（不变式/余额）、`ledger.service`（事务模式 + `refreshSnapshots`）、`net-worth.service`（快照/曲线，仅改负债识别 + 流动性派生）。

**关键前置**：Phase 0/1 **必须已实现并达标**（账目平衡、转账不改净资产、净资产快照/曲线一致）。Phase 2 的估值/还款/曲线平滑正确性完全建立在 Phase 0/1 之上。**若 Phase 0/1 尚未实现，Phase 2 无法独立交付。**

**Rationale**：避免重复造账本/快照；增量 schema 降低耦合、迁移可控（drizzle-kit generate 增量迁移）。

**Alternatives**：Phase 2 自带一套资产/负债账本——重复、易与 Phase 0 账目不一致，明确拒绝。

## R10. 数据隔离与并发（沿用 Phase 0/1）

**Decision**：
- 全部明细表带 `user_id`（与 accounts 一致，不加 FK），所有 repository 经 `FinanceRepository` 基座按 `userId` 作用域（FR-009）。
- 还款/估值/处置/登记均在单个 `db.transaction` 内完成（写 transaction + entries + 更新 balance + 更新明细），事务提交后 best-effort `refreshSnapshots`（曲线刷新不阻断主操作，与 Phase 0/1 `refreshSnapshots` 策略一致）。
- 金额一律字符串入参、内部「分」整数运算（`toCents`/`fromCents`），禁止浮点。

**Rationale**：复用 Phase 0/1 既有的事务/隔离/金额纪律，保证账目平衡不变式与用户隔离不被 Phase 2 破坏。

**Alternatives**：无——沿用既定模式是唯一正确选择。
