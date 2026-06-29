# Research — 投资管理 (Phase 3)

> Phase 0 输出：解决 Technical Context 中的所有技术决策点。每项给出 Decision / Rationale / Alternatives。
> 大前提：Phase 3 **依赖 Phase 0 复式记账 + Phase 1 净资产快照 + Phase 2 资产/负债（`investment` 账户 + `finance_asset_details` + `revaluation`/`disposal` 交易类型 schema）**。模型真相源：当前**实际 schema** 用 `uuid('id').defaultRandom()`、`text('user_id')`（不加 FK）、`numeric(18,2)`、`jsonb` 分项——本计划据此设计。
> **现实校准（关键）**：经代码核查，Phase 2（003）**仅 schema 落库**，服务/路由/UI **尚未实现**——`ledger.service.buildEntries` 仍只处理 `income/expense/transfer`、`ensureSystemEquityAccounts` 未创建 `__revaluation`、无 `asset.service`。Phase 3 的卖出（`disposal`）与现价同步（`revaluation`）正是这两个原语的首要消费者，故 Phase 3 **承接 003 R4/R5 设计**落地过账逻辑（见 R8）。

## R1. 持仓建模：每个持仓 = 一个 `investment` 账户 + 1:1 `finance_positions`

**Decision**：沿用 Phase 0/2「账户 = 钱存放的位置 = 复式分录腿的唯一锚点」模型。**一个持仓 = 一个 `investment` 账户**：
- 账户 `finance_accounts.type='investment'`，`balance` = **当前市值**（真相源，由分录维护——买入/分红/现价同步都经分录改 `balance`）。
- **新增 `finance_positions`（1:1 挂账户，`account_id UNIQUE`）**：`instrumentCode`、`instrumentType`（stock/fund/bond/gold/etf/reits/crypto）、`quantity`（份额/股数）、`costPrice`（加权平均成本价）、`currentPrice`（缓存现价，来自行情/手动）、`priceSource`、`lastPriceAt`、`currency`（默认 CNY）、`estimateConfidence`（行情陈旧/手动时降级标注）。
- **派生（不入库）**：`成本 = quantity × costPrice`、`市值 = 账户 balance`、`盈亏 = 市值 − 成本`、`盈亏率 = 盈亏 / 成本`（FR-003）。

**Rationale**：
- 复式不变式要求 `balance` 只能由 `entries` 维护。把「当前市值」继续用 `balance` 表达，天然复用 `ledger.service` 的记账/余额/快照刷新全套机制；现价变动 = 一笔 `revaluation` 交易改 `balance`，净资产快照自动反映（FR-008）。
- 「1 持仓 : 1 账户」使 `revaluation`（按账户）= 按持仓刷市值，语义干净；多品种只需多个 investment 账户，符合 Phase 2「账户即锚点」既定模式。
- `finance_asset_details`（Phase 2）只存成本/置信度/估值历史，**无份额/单价/品种维度**；投资语义另起 `finance_positions`，与实物资产（`real_asset`）的明细表职责分离，互不污染（设计 P3 领域模型）。

**Alternatives**：
- 一个 investment 账户挂多持仓（positions.accountId N:1）——`balance` 是多持仓市值之和，无法按单个品种 `revaluation`，盈亏/现价同步粒度错乱。拒绝。
- 把份额/单价加列到 `finance_accounts`——账户表臃肿、空列多、破坏余额职责单一。拒绝。
- 复用 `finance_asset_details` 扩展——污染实物资产语义、字段含义混杂。拒绝。

## R2. 投资交易语义层：`finance_investment_trades` 挂在 `finance_transactions` 之上

**Decision**：复式分录（`finance_transactions` + `finance_entries`）只认「账户 + debit/credit + 金额」，承载**钱的移动**；投资交易的**语义**（份额、单价、手续费、印花税、动作类型、定投归属）单独存 `finance_investment_trades`（1:N 挂持仓），并 `transactionId` 关联到对应的复式交易：
- 字段：`positionId`、`action`（buy/sell/dividend_cash/dividend_reinvest/split）、`shares`、`price`、`fee`（手续费）、`tax`（印花税，卖出）、`transactionId`（关联 finance_transactions.id）、`dcaPlanId?`（可选）、`occurredAt`、`note`。
- **买入**：复式侧 = `transfer` 2 腿（debit investment 账户 `amount`、credit 现金账户 `amount`，`amount = shares×price + fee`）；语义侧记 shares/price/fee。持仓 `quantity += shares`，`costPrice` 重算为加权平均。
- **卖出**：复式侧 = `disposal` 3 腿（见 R5）；语义侧记 shares/price/fee/tax。持仓 `quantity -= shares`（数量减少，`costPrice` 不变——成本价不随卖出改变）。

**Rationale**：
- IRR（R6）需「每笔买入的实际投入时点 + 金额」；加权成本需每笔买入的 shares/price；卖出盈亏需每笔卖出的 shares/proceeds。这些都须**持久化每笔交易语义**，无法仅靠当前 `balance` 反推。
- 钱在分录（复式真相源、可审计、账目恒等），语义在 trades（投资视角）。两者经 `transactionId` 关联，职责清晰，不污染通用 `finance_transactions`。

**Alternatives**：
- 把 shares/price/fee 加列到 `finance_transactions`——污染通用交易表（非投资交易无此字段，且分录是多腿、语义是单笔）。拒绝。
- 不持久化、仅凭分录聚合算——卖出后无法回溯单价/费用，IRR/加权成本无据。拒绝。
- 独立投资账本（脱离 finance_transactions）——破坏复式真相源统一性、双写漂移。拒绝。

## R3. 行情数据源：可插拔 provider + 默认免费 HTTP 源 + 缓存 + 手动降级（FR-004）

**Decision**（解决 NEEDS CLARIFICATION）：行情接入采用**provider 接口 + 默认实现 + 降级**三段式：
- **`market-data.service`** 暴露 `getQuote(instrumentCode, type)`，内部按 type 路由到 `MarketDataProvider`：
  - 默认 `HttpQuoteProvider`：A 股/ETF/基金/黄金走免费免授权的公开行情 HTTP 接口（候选：新浪 `hq.sinajs.cn`、腾讯 `qt.gtimg.cn`、东方财富 `push2.eastmoney.com`——均为 GET 返回文本/JSON 现价，无需 API Key）。
  - **provider 可插拔**（接口 `fetchPrice(code, type): { price, source, fetchedAt } | null`），便于换源/接付费源（如 tushare/akshare 服务端代理）。
- **缓存**：拉到的现价 upsert 进 `finance_instruments`（`latestPrice`/`priceSource`/`priceUpdatedAt`/`isStale`），带 TTL（如盘中分钟级、盘后当日）。持仓 `currentPrice` 读缓存，不每请求实时拉。
- **降级（FR-004）**：provider 返回 null / 超时 / 标的未覆盖 → **不展示虚假价**，持仓标注「行情缺失」并允许用户手动输入现价（写 `priceSource='manual'`、`lastPriceAt=输入时间`）；陈旧行情（超 TTL）标注「行情陈旧 + 时间」，不冒充最新。
- **运行位置**：行情拉取走 **Node runtime** Route Handler（`export const runtime = 'nodejs'`，需 `fetch` 外网 + 解析），不走 Edge。

**Rationale**：
- 设计 D3「第三方行情 API，失败降级为用户手动输入」、可行性 ★★★（不稳）→ 必须可换源、可降级、可缓存，单点写死必崩。
- 公开行情接口（新浪/腾讯/东财）覆盖 A 股/ETF/基金/黄金且免费，是个人开发者在大陆能拿到的最稳通道（与设计 §4 数据接入策略一致）；接口形态（返回文本）需各自 parser，provider 接口隔离差异。
- 缓存 + TTL 降低被限流风险、提升首屏性能；`isStale` + 来源/时间戳兑现「诚实估值」（P6），不展示虚假最新价（SC-004）。

**Alternatives**：
- 写死单一源——源挂了/改格式则全功能不可用。拒绝。
- 每请求实时拉取——慢、易被限流。拒绝。
- 行情缺失时用旧价顶替——违反诚实估值、展示虚假价（SC-004）。拒绝。
- 接付费源（tushare pro 等）——授权/token 与稳定性需实现期评估；先以免费公开源为默认，付费源作为可插拔 provider 预留（实现期澄清点，见 checklist）。

> ⚠️ **实现期澄清点（非本计划阻断）**：具体 provider 端点格式、字段、限流策略需在实现阶段实测确认；若公开源对某类标的（如 REITs/数字货币）覆盖不足，降级为手动输入即可，不阻断 Phase 3 交付（FR-004 已要求降级能力）。

## R4. 现价 → 市值：`revaluation` 2 腿 + `__revaluation` 权益桶（承接 003 R4，FR-008）

**Decision**：现价变动改变持仓市值，必须经分录才能改 `balance`（Phase 0 不变式）。新增现价同步：
- 系统权益账户 `__revaluation`（未实现损益桶），由 `ensureSystemEquityAccounts()` 幂等创建（`user_id='__system__'`，`type='equity'`，`systemKey='revaluation'`，`includeInNetWorth=false`）——**Phase 3 落地此项（003 未实现）**。
- `revaluation` 交易类型过账（`ledger.service.buildEntries` 新增分支，承接 003 R4）：设持仓现价新市值 `newValue`（= `quantity × currentPrice`）、当前 `balance`，`delta = newValue − balance`：
  - `delta>0`（升值）：`debit` investment 账户 `delta`、`credit` `__revaluation` `delta`。
  - `delta<0`（贬值）：`debit` `__revaluation` `|delta|`、`credit` investment 账户 `|delta|`。
- 单事务：写 `transactions(type=revaluation)` + 2 腿 `entries`（`assertBalanced`）+ 更新 investment 账户 `balance=newValue` + 更新 `positions.currentPrice/priceSource/lastPriceAt` + `refreshSnapshots`。

**结果（FR-008 / SC-003）**：持仓 `balance`=新市值、`__revaluation` 承载未实现损益、净资产快照即时反映新市值、曲线不留旧值。

**Rationale**：
- 余额只能由分录改——现价同步本质是一笔「调整持仓至新市值」的复式交易，对腿用独立 `__revaluation` 桶，与已实现 P&L（`__income`/`__expense`）分离，保证会计恒等式 `Σ资产 = Σ负债 + Σ权益` 成立、不虚增收入。
- `__revaluation` 不计入净资产（系统账户、`includeInNetWorth=false`），与 `__income`/`__expense` 一致；净资产变动完全由 investment 账户 `balance`（资产端）体现。

**Alternatives**：
- 直接 `UPDATE balance`——绕过分录，破坏复式不变式与审计能力。拒绝。
- 估值变动入 `__income`/`__expense`——把未实现浮动盈亏混入已实现收支，扭曲收支统计。拒绝。

## R5. 卖出 / 分红 / 送股：`disposal` 3 腿 + 分红模式（承接 003 R5）

**Decision**：
- **卖出（disposal 3 腿，承接 003 R5）**：设 `proceeds = shares×price − fee − tax`（净到账）、当前 `balance`、按比例账面价值 `bookValue = balance × (shares/quantity)`、`gap = proceeds − bookValue`：
  - `debit` 现金账户 `proceeds`（收到净款）；
  - `credit` investment 账户 `bookValue`（持仓按比例出账）；
  - `gap>0` 实现（资本）收益 → `credit` `__income` `gap`；`gap<0` 实现损失 → `debit` `__expense` `|gap|`。
  - 校验：`Σdebit(proceeds + 损失) == Σcredit(bookValue + 收益)` ✓。
  - 持仓 `quantity -= shares`、`costPrice` 不变（成本价不随卖出改）；`balance` 经分录按比例减少；全部卖出则 `quantity=0`（持仓清零/退出，Edge Case）。
- **现金分红（dividend_cash）**：`income` 2 腿——`debit` 现金 `amount`、`credit` `__income` `amount`（现金流入、计入收入，**不改变持仓数量/成本**）。复用现有 `income` 过账。
- **送股/红利再投（dividend_reinvest / split）**：份额增加、无现金流出/流入外部——`quantity += shares`、`costPrice` 重算（总成本不变、份额增加 → 成本价摊薄），并经一笔 `revaluation` 把 `balance` 调整至 `新quantity × currentPrice`（送股本质是「零成本增份额 + 市值重估」）。

**Rationale**：
- 卖出盈亏 = 净到账 − 账面价值，差额入 `__income`/`__expense`，不虚增；手续费/印花税已从 proceeds 扣除（Edge Case「费用不可静默忽略」）。
- 现金分红是「现金流入」，走 `income` 自然、且不影响持仓；送股是「份额膨胀」，须摊薄成本价 + 市值重估，避免扭曲收益率。

**Alternatives**：
- 卖出套用 `transfer`——无法表达盈亏（proceeds≠bookValue 时账目不平）。拒绝。
- 卖出按全量 balance 出账（而非按比例）——部分卖出时清空全部市值，错误。拒绝（须按 `shares/quantity` 比例）。
- 分红一律改持仓数量——现金分红不应改份额。拒绝。

## R6. 定投 IRR：纯函数 XIRR + 主流计算器 known-answer 验收（SC-002）

**Decision**：定投是「多笔不同时点买入」，须用考虑资金时间价值的 **XIRR**（不规则现金流 IRR）：
- 新增纯函数 `services/finance/irr.ts`：`computeXirr(cashflows: {date: Date, amount: number}[]): number | null`。
  - 现金流构造：每笔买入 = 流出 `−(shares×price + fee)`（投入）、现金分红 = 流入 `+amount`、**期末市值** = 流入 `+当前市值`（用当前 `balance` 或 `quantity×currentPrice`）。
  - 算法：求 `r` 使 `Σ cf_i / (1+r)^((date_i − date_0)/365) = 0`；用 **bisection + Newton-Raphson**（牛顿为主、区间二分为兜底），区间 `[-0.999, +10]`、容差 `1e-7`、最大迭代 100。
  - **不收敛 / 多解 / 无正现金流**：返回 `null` 并由调用方标注「IRR 无法收敛/无解」（Edge Case），**不返回错误数值**。
- 年化：XIRR 直接是年化收益率；与天天基金定投收益口径一致（SC-002），用主流计算器的已知投入/市值做 known-answer 单测。

**Rationale**：
- 算术收益率（总盈亏/总投入）忽略投入时点，定投场景严重失真（早投入的钱贡献更多时间价值）。XIRR 是衡量「多笔不同时点投入」真实回报的标准方法（Spec US3）。
- 金额结论须确定性、可单测、可审计（设计 P5 红线）——纯函数 + known-answer 测试是唯一正确做法；不交给 LLM/前端。
- 份额/净值精度问题（Edge Case）通过内部统一数值精度 + 已知答案对齐解决。

**Alternatives**：
- 算术收益率——失真，拒绝。
- 简单 IRR（等间隔）——定投虽常为月度，但中断/恢复/不同金额使时点不规则，须 XIRR。
- 调用外部库——无现成依赖；自实现 XIRR（~40 行纯函数）可控、可测、零新依赖。如需可评估 `financejs`，但自实现更轻、无浮点隐患（内部仍走高精度数值）。

## R7. 手续费/印花税与份额精度

**Decision**：
- **手续费/印花税**（Edge Case）：买入 `fee` 计入成本（`amount = shares×price + fee`，costPrice 含费）；卖出 `fee`/`tax` 从 proceeds 扣除（`proceeds = shares×price − fee − tax`）。费用落在 `finance_investment_trades.fee`/`tax`，不静默忽略。
- **份额/净值精度**：金额列仍 `numeric(18,2)`；份额 `quantity`、成本价 `costPrice`、现价 `currentPrice` 用更高精度数值列（如 `numeric(18,6)`）避免累计误差导致市值与成本对不上（Edge Case「份额精度与四舍五入」）。内部金额运算仍走「分」整数。

**Rationale**：费用扭曲盈亏（Spec Edge Case）；份额/净值精度不足会导致 `quantity×price` 与 `balance` 对不上、IRR 失真。

**Alternatives**：忽略费用/统一 2 位精度——违反诚实核算，拒绝。

## R8. 承接 Phase 2 未实现的 `revaluation`/`disposal` 过账（关键依赖）

**Decision**：Phase 3 **必须**落地以下「Phase 2 已设计未实现」原语（承接 003 research R4/R5），否则卖出与现价同步无法成立：
1. `ensureSystemEquityAccounts()` 增加 `__revaluation`（`systemKey='revaluation'`，`includeInNetWorth=false`）。
2. `ledger.service.buildEntries` 增加 `revaluation`（2 腿）与 `disposal`（3 腿）分支 + `assertBalanced`。
3. `_lib/validation.ts` 的交易类型枚举补齐 `repayment`/`revaluation`/`disposal`（003 亦未补，本计划按需补 Phase 3 用到的 `revaluation`/`disposal`；`repayment` 属 003 范围，若 003 未实现则标注「非 Phase 3 阻断，但建议同批补齐」）。
- 同时为 investment 账户的「估值历史」复用 `finance_asset_details.valuationHistory`（现价变动轨迹）或直接在 `positions` 记录——本计划取 `positions.currentPrice/lastPriceAt` 为当前快照、`finance_instruments` 缓存行情；若需历史现价轨迹，按 R4 在每次 `revaluation` 追加一条到 `finance_asset_details.valuationHistory`（investment 账户挂明细）。

**Rationale**：Phase 3 卖出（disposal）与现价同步（revaluation）是这两个原语的首要消费者；003 已给出完整设计（R4/R5），Phase 3 直接承接，复式不变式不被破坏，无需重复设计。

**Alternatives**：等 003 实现后再做 003+004 分离——但 003 尚未排期、且 revaluation/disposal 的首要场景就是投资，强行等待会阻塞 Phase 3 价值交付。承接落地更高效，且与 003 设计零冲突。

## R9. 资产配置 + 集中度预警：分析走规则引擎（FR-007）

**Decision**：
- **资产配置占比**（FR-007）：纯函数 `pnl.ts` 按 `instrumentType`（股/债/金/现金等维度，可在 instrumentType 上再映射到资产大类）汇总各持仓市值占比，返回 `[{ type, marketValue, ratio }]`，前端 recharts 饼图可视化。
- **集中度预警**：单一品种（或单一 instrumentType）占比超阈值（默认 60%，可配）→ 经现有 **`rules-engine.service`** 产出 `rule_finding`（确定性结论），前端读 findings 展示预警卡片（仅提示，不代为操作，设计 §9 合规免责）。
- 复用现有 `rule_findings` 表与 rules-engine 机制（Phase 1 已有），不新建预警表。

**Rationale**：设计 P5「分析结论走规则引擎，LLM 只做表达」——配置占比、集中度是确定性数值结论，必须走规则引擎（可测、可审计、零幻觉），不交给 LLM。

**Alternatives**：LLM 直接算占比/预警——金额结论须确定性（P5 红线），拒绝。

## R10. 数据隔离 / 并发 / 金额纪律（沿用 Phase 0/1/2）

**Decision**：
- 全部新表带 `user_id`（与 accounts 一致，不加 FK），所有 repository 经 `FinanceRepository` 基座按 `userId` 作用域（FR-009）。
- 买入/卖出/分红/现价同步/手动录价均在单个 `db.transaction` 内完成（写 transaction + entries + 更新 balance + 更新 positions/trades/instruments），事务提交后 best-effort `refreshSnapshots`（与 Phase 0/1 一致）。
- 金额一律字符串入参、内部「分」整数运算（`toCents`/`fromCents`）；份额/价格用高精度数值列（R7）。

**Rationale**：复用 Phase 0/1/2 既有的事务/隔离/金额纪律，保证账目平衡不变式与用户隔离不被 Phase 3 破坏。

**Alternatives**：无——沿用既定模式是唯一正确选择。
