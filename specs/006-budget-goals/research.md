# Research: 预算与目标 (Phase 5)

**Feature**: 006-budget-goals · **Date**: 2026-06-29 · **Spec**: [spec.md](./spec.md)

> Phase 0 产出。本文解决 Phase 5 的全部技术决策（决策 D1–D11），作为 data-model.md / contracts/api.md 的依据。每项给出 **Decision / Rationale / Alternatives considered**。所有结论**沿用 finance 域既有约定**（见 005-family-finance/research.md 与代码事实核查）。

---

## 0. 既有事实核查（结论，非新设计）

| 事实 | 证据 | 对 Phase 5 的影响 |
|------|------|-------------------|
| `finance_categories.parentId`（self-ref，nullable）存在 | `src/database/schema/finance/categories.ts` | 父子分类预算可做：预算挂在父类，按子树汇总支出 |
| `finance_transactions.categoryId`（nullable，**无 FK 约束**）、`amount decimal(18,2)`、`occurredAt timestamp`、`type`（含 transfer/repayment/revaluation/disposal） | `transactions.ts` | 预算已用 = 该周期内 `type='expense'` 且 `categoryId∈子树` 的 `amount` 之和；**transfer 等不计入** |
| 规则引擎：findings 由**纯函数** `computeFindingsFromData(PeriodMetrics): FindingData[]` 现算；`FindingData={metric,value,verdict,riskLevel}`；`finance_rule_findings` 仅 period 维度（无 category 列） | `rules-engine.service.ts`、`rule-findings.ts` | 预算超支结论走**同构**的确定性纯函数（`BudgetAlert`），不套用 period 维度的 findings 表 |
| 结余 = income − expense，在 rules-engine 内 `sumAmountByType` 计算；**无「近 N 月平均结余」helper** | `rules-engine.service.ts` | 目标 ETA 需新增 `getMonthlySurplusSeries` + 纯函数 ETA |
| 金额运算统一 `money.ts`：`toCents/fromCents/addCents`（整数分） | `src/services/finance/money.ts` | 所有预算/目标金额运算必经 cents，禁浮点（I2） |
| 净资产：`computeNetWorthLive(userId)`、`deriveViewNetWorth(nw,'high'\|'all')`；`finance_accounts.balance` 为物化余额、`includeInNetWorth` 控制是否计入 | `net-worth.service.ts`、`accounts.ts` | 目标进度可按 linked 账号余额 / 总净资产 / 高流动净资产 三种口径 |
| 约定：UUID `defaultRandom` PK、表名 `finance_<entity>`、`FinanceRepository` 基类 + `xxxRepository(userId)` 工厂、响应 `{resourceName}`、错误码 `UNAUTHORIZED/BAD_BODY/VALIDATION/INVARIANT/NOT_FOUND/INTERNAL` | 全 finance 域 | 新表/新服务/新路由**完全沿用**，不引入新结构 |
| 006 在 finance 域内**全 greenfield**（`budget`/`goal` finance 命中为 0；`health_goals` 为营养表，无关） | grep | 全部新建 |

---

## D1 — 预算周期模型：周期类型 + 当前窗口现算

**Decision**：预算是**按周期复发的设置**（`periodType ∈ {month, week, year}`，默认 `month`）。每个预算存「额度 + 周期类型」；「本期已用」**按当前周期窗口实时从 transactions 汇总**，**不物化 live 已用列**。周期边界由 `periodType` + 参考日期（今天）算出 `[periodStart, periodEnd)`：
- month：当月 1 日 → 次月 1 日
- week：本周一 → 下周一（ISO 周）
- year：当年 1/1 → 次年 1/1

**Rationale**：① 单一事实源（transactions）→ SC-001「不一致发生率=0」由**构造**保证（没有会漂移的物化已用列）；② 复发预算是用户心智（「每月餐饮 2000」），而非每周期重建；③ 与「实时已用/剩余」（FR-002）天然契合——每次读都是最新。

**Alternatives**：
- 每周期生成独立 budget 行（如 `2026-06` 一行）：行数膨胀、跨周期查询复杂、调整额度需批量改 → 否决。
- 物化 `spent` 列、写交易时同步更新：引入双源一致性风险，违背 SC-001 → 否决（见 D9）。

---

## D2 — 已用汇总：按分类子树，单预算内零双计（FR-004）

**Decision**：预算的「已用」= 周期内所有 `type='expense'` 且 `categoryId ∈ subtree(budget.categoryId)` 的 `amount` 之和（cents 求和）。`subtree` = 该分类自身 + 其全部后代（经 `categories.parentId` 闭包）。

**关于「多预算重叠」的澄清**：一笔子分类支出**自然**同时计入「父类预算」与「子类预算」——这是**不同预算各自追踪不同范围**，正确、非缺陷。FR-004「避免重复计入或漏计」指的是**单个预算内部**：一笔交易对一个预算至多贡献一次（`categoryId ∈ subtree` 判定一次），不重复求和。

**实现**：用户分类量级小（典型数十），按 userId 加载分类树、内存构建 `parent→children` 映射、为每个预算算后代集合；再按集合过滤交易求和。不引入递归 CTE（开销大且 Drizzle 表达繁琐）。

**Rationale**：父类预算覆盖子类支出符合直觉（「餐饮」预算含外卖+堂食）；内存子树计算对个人量级 O(分类) 可忽略；与去重目标一致。

**Alternatives**：
- 仅精确匹配 categoryId（不含后代）：父类预算永远 0 → 反直觉，否决。
- 递归 SQL CTE：复杂、调试难、收益低 → 否决。

---

## D3 — 超支/阈值预警：确定性 BudgetAlert（纯函数），走规则层（FR-002 / FR-008 / US3）

**Decision**：新增**确定性**的预算预警结果 `BudgetAlert`（**不是** LLM 产物），由 `budget.service.ts` 的纯函数计算，**同构于** `FindingData`（value/verdict/riskLevel 哲学）：

```ts
interface BudgetAlert {
  budgetId: string;
  categoryId: string | null;
  periodStart: string; periodEnd: string;
  budgetAmount: string;        // string, decimal
  spent: string;               // 本期已用（D2 子树汇总）
  remaining: string;
  ratio: string;               // spent / budgetAmount，4dp
  status: 'normal' | 'warning' | 'overrun';
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  verdict: string;             // 中文结论文案，如「餐饮预算已超支 ¥100」
}
```

状态阈值（`alertThreshold` 默认 0.80，可按预算覆盖，D10）：
- `ratio < alertThreshold` → `normal` / risk `none|low`
- `alertThreshold ≤ ratio < 1.0` → `warning`（即将超支）/ risk `medium`
- `ratio ≥ 1.0` → `overrun`（已超支）/ risk `high`

**Rationale**：① 现有 `finance_rule_findings` 是 **period 维度**（无 category 列），无法表达「某分类预算超支」；硬塞（如 `metric='budget_overrun:<catId>'`）破坏 metric 枚举语义、难查询 → 否决。② 独立 `BudgetAlert` 保留 category 维度，仍属**确定性规则层**（与 `computeFindingsFromData` 同性质），兑现 US3「规则引擎负责准确，LLM 负责表达」。③ LLM 月报仅消费这些事实，不自行编造金额（SC-004）。④ 默认**现算不落库**（与 `/api/finance/findings` 行为一致）；若 AI 月报引用某周期，可按需落 `finance_budget_periods` 快照（D-history）。

**Alternatives**：
- 扩展 `FINDING_METRICS` 加 `'budget_overrun'` + 给 `rule_findings` 加 `categoryId` 列：改动既有表/枚举、与「period metric」语义混杂 → 否决（除非未来统一 findings 模型）。
- 由 LLM 判断超支：直接违背 US3/SC-004 → 否决。

---

## D4 — 目标进度口径：显式 progressBasis，消除歧义（edge case）

**Decision**：目标存 `progressBasis ∈ {'manual','linked','net_worth'}`（默认 `manual`），「当前金额」按下式**派生**：

| basis | currentAmount 来源 | 复用 |
|-------|-------------------|------|
| `manual` | 目标上的 `manualAmount`（用户手动维护） | — |
| `linked` | Σ `linkedAccountIds`（jsonb `string[]`）账号的 `balance` | `finance_accounts` |
| `net_worth` | 总净资产 | `computeNetWorthLive(userId).netWorth` |

`progressRate = currentAmount / targetAmount`（targetAmount>0 时；否则 0）。

**Rationale**：edge case 明确要求「避免歧义」——用**显式字段**让用户选「这笔目标的钱算哪些」：`linked`（指定账户/基金，最精确，对应 US2「关联已有资金」）、`net_worth`（总身家视角）、`manual`（抽象目标/无对应账户）。默认 `manual` 保证最小可用（不必先建账户）。

**Alternatives**：
- 只支持 linked：强制用户先建账户，门槛高 → 否决。
- 只支持 net_worth：「买房首付」不该等于总净资产（含其他专款）→ 语义错，否决。
- 三种并存但默认 net_worth：易误导（用户以为「存了 30% 房贷」其实含全部身家）→ 否决，默认 manual 最保守。

---

## D5 — 目标 ETA 算法：近 N 月平均结余，负/零结余明确「无法达成」（FR-006 / US2 / SC-003）

**Decision**：新增纯函数 `computeGoalProgress(goal, surplusSeries): GoalProgress`：

```
remaining   = max(0, targetAmount − currentAmount)
avgSurplus  = mean(surplusSeries[−N..])        // 近 N 月（income−expense，transfers 排除），默认 N=3
if avgSurplus <= 0:
    etaStatus = 'unreachable'                   // 「按当前节奏无法达成/需调整」，无日期（SC-003）
elif remaining == 0:
    etaStatus = 'completed'
else:
    monthsToGoal = ceil(remaining / avgSurplus)
    etaDate      = today + monthsToGoal 个月（月粒度）
    etaStatus    = (goal.targetDate && etaDate > goal.targetDate) ? 'at_risk' : 'on_track'
if goal.targetDate == null:
    etaDate = null                              // 开放式目标（应急金）只显示进度，不估 ETA（edge）
```

`surplusSeries` 由新 helper `getMonthlySurplusSeries(userId, N)` 产出（按 `sumAmountByType` 同口径：`type∈{income,expense}`、按 `occurredAt` 月份分组、transfers 排除、cents 求差）。

**Rationale**：① 算法**明确可复现**（SC-003）：固定窗口、整数 cents、ceil 取整、月粒度。② 负/零结余**不产出虚假乐观日期**（SC-003 硬约束）。③ 无截止日目标（应急金）**只显进度不估 ETA**（edge）。④ N 可配（spec 允许 3–6），默认 3，实现期可调但须可解释。⑤ 复用既有结余口径，杠杆高、不重复造轮。

**Alternatives**：
- 用净资产增速推 ETA：净资产含估值波动（房产/投资），噪声大、不可解释 → 否决。
- 用最近 1 个月结余：单月波动大（年终奖/大额支出）→ 否决，取均值更稳。
- avgSurplus≤0 时返回一个保守大日期：误导，违背 SC-003 → 否决。

---

## D6 — 结余序列与服务的归属：goal.service 持有 surplusSeries

**Decision**：新增 `budget.service.ts`（预算已用 D2 汇总 + D3 BudgetAlert + 周期边界）与 `goal.service.ts`（D4 进度 + `getMonthlySurplusSeries` + D5 ETA）。`getMonthlySurplusSeries` 放 `goal.service.ts` 并 export（ETA 是其主消费者；rules-engine 现有 surplus finding 不变）。

**Rationale**：① `balance.service.ts` 严格是复式不变量引擎，不掺现金流聚合。② 预算/目标是 Phase 5 两个内聚子域，分两个 service 清晰。③ surplusSeries 与 ETA 强耦合（同源数据），放一起避免跨服务取数。

**Alternatives**：
- 新建 `cashflow.service.ts` 单放 surplusSeries：多一个文件、调用链拉长 → 否决（YAGNI）。
- 塞进 `rules-engine.service.ts`：rules-engine 是「健康度/结论文案」层，预算/目标是「规划」层，职责不同 → 否决。

---

## D7 — 家庭维度：Phase 5 核心 = 个人，家庭预算/目标延后

**Decision**：006 的预算/目标**全部 userId 维度**（个人），与 002–005 个人表一致；**不**做家庭/成员维度预算（spec 明示「核心范围以个人为主」）。但 D2 已用汇总、D4 linked 账号余额的查询接口**预留** `memberId?` 过滤参数（本期不接线），未来 Phase 4 联动时可平滑扩展。

**Rationale**：① 紧扣 spec 范围（assumption 第 5 条）。② 避免过早引入「家庭预算分配」的复杂归属问题（谁的钱花到哪个预算）。③ 接口预留不增成本。

**Alternatives**：
- 本期就做家庭预算：超 spec、且依赖家庭分配规则未定 → 否决（YAGNI）。

---

## D8 — 预算结转（rollover）：本期不做

**Decision**：**不**支持「未用额度结转下期」。周期切换 = 已用清零、按新周期重新累计（spec US1 验收 4 / FR-003）。

**Rationale**：spec 未提结转；保持简单（YAGNI）；「已用清零」语义最直观。

**Alternatives**：结转需额外物化「累计结余额」、口径复杂 → 否决（未来增强项，预留 `rollover boolean default false` 列但不实现逻辑）。

---

## D9 — 「实时」的兑现：读时现算 + 写后 best-effort 回带（FR-002）

**Decision**：**Pull 为唯一事实源**——`spent` 永远读时从 transactions 现算（D1）。为兑现「事中预警」UX，在 `ledger.service` 创建/更新交易后**best-effort** 计算受影响分类的 `BudgetAlert[]`，**非阻塞地**附在交易响应里（如 `{ transaction, budgetAlerts? }`）。**不**因预算计算失败而回滚交易。

**Rationale**：① 保留单一事实源（SC-001）。② 写后回带让用户记完一笔立刻看到「餐饮已超支」，满足「事中而非仅事后」（SC-002）且无需推送基础设施。③ best-effort + 非阻塞：预算子系统故障不污染核心账目写入（稳健性）。

**Alternatives**：
- 纯 pull（无写后回带）：记完账要点开预算页才看到 → UX 弱，补充回带。
- 写时同步物化 spent：双源一致性风险 → 否决（同 D1）。
- WebSocket/SSE 推送：本期基础设施成本高 → 否决（未来增强）。

---

## D10 — 阈值可配：每预算 alertThreshold（默认 0.80）

**Decision**：每个预算存 `alertThreshold decimal(3,2) default 0.80`（如 0.80 = 80% 预警）。D3 状态机用该值与 1.0（超支硬阈值）。

**Rationale**：spec FR-002 给 80% 为例但非硬编码；不同分类容忍度不同（刚需 vs 可控），可配更灵活；默认 0.80 兑现验收。

**Alternatives**：全局单阈值：不够灵活 → 否决。

---

## D11 — 历史预算周期可回溯：budget_periods 快照表（FR-003 / edge「预算调整：历史周期不变」/ SC-005）

**Decision**：新增 `finance_budget_periods` 快照表（budgetId, periodStart, periodEnd, `amountSnapshot`, `spentSnapshot`, status, closedAt），**周期关闭时（或按需）写一条不可变快照**。历史回溯 = 读快照行；当前周期 = D1 现算。

- 关键：`amountSnapshot` 锁定**该周期生效的额度**——用户中途改预算额度（edge），当前周期立即按新额度算（D1 现算读 `finance_budgets.amount`），**已关闭的历史周期**仍读各自 `amountSnapshot`，互不串扰（SC-005）。
- `spentSnapshot` 在关闭时一次性算定（= 该周期内子树支出汇总），仅作历史展示缓存；**任何时刻**都可由 transactions 复算校验。

**Rationale**：① 与既有「净资产日快照」「家庭快照」同构（finance 域既有模式）。② SC-005「历史周期可回溯、无串扰」需物化历史额度（否则改额度即污染历史）。③ 增量、可逆、无历史数据依赖。

**Alternatives**：
- 只存当前额度、历史靠「当时额度」无法还原：违背 SC-005/edge → 否决。
- 用 `amountHistory` jsonb 数组：查询/索引难、与快照表哲学不一 → 否决。

---

## 决策汇总

| # | 决策 | 关键点 |
|---|------|--------|
| D1 | 周期模型 | 复发预算 + periodType(month/week/year) + 读时现算窗口 |
| D2 | 已用汇总 | 子树 rollup，单预算内零双计；多预算重叠为正确 |
| D3 | 超支预警 | 确定性 `BudgetAlert` 纯函数，同构 FindingData，不套用 findings 表 |
| D4 | 目标进度口径 | progressBasis = manual / linked / net_worth，显式消歧 |
| D5 | 目标 ETA | 近 N 月平均结余；负/零→unreachable；无截止日不估 ETA |
| D6 | 服务归属 | budget.service + goal.service（含 surplusSeries） |
| D7 | 家庭维度 | 本期个人为主，接口预留 memberId |
| D8 | 结转 | 不做（预留列） |
| D9 | 实时 | Pull 事实源 + 写后 best-effort 回带 alerts |
| D10 | 阈值 | 每预算 alertThreshold，默认 0.80 |
| D11 | 历史回溯 | finance_budget_periods 快照表，锁定 amountSnapshot |

> 无 NEEDS CLARIFICATION 残留。N（ETA 窗口）默认 3、实现期可调但须可解释（spec assumption 已授权）。
