# Research: 高级分析 (Phase 7)

**Feature**: 008-advanced-analytics · **Date**: 2026-06-29 · **Spec**: [spec.md](./spec.md)

> Phase 0 产出。本文逐一解决 `plan.md` Technical Context 中的 **NEEDS CLARIFICATION（NC1–NC8）**，并对每个关键技术决策给出 **Decision / Rationale / Alternatives**。所有结论直接驱动 `data-model.md` 与 `contracts/api.md`。
>
> ⚠️ 本阶段为最远期规划。**规则口径类决策（NC1/NC3）只锁定「引擎形状 + 决策框架 + 取值来源」**，具体数值留待临近实施时按当时法规/真实数据回填——这与 spec「锁定做什么/为什么/可信边界，不预固化易变口径」一致。

---

## 现状基线（来自代码勘察）

设计前已确认的既有事实（Phase 7 的扩展锚点）：

1. **双层架构已固化**：`rules-engine.service.ts` 是确定性纯函数引擎范本——`computeFindingsFromData(m)`/`computeHealthScore(findings)`/`computeConcentrationAlert(positions)` 均为**导出的纯函数**（导出供单测），service 层 `computeFindings(userId, period)` 负责取数后调用。注释明写「确定性纯函数，可审计、零幻觉」。Phase 7 四类分析**完全复用此范式**。
2. **Finding 落表范式**：`finance_rule_findings`（`rule-findings.ts`）——`numeric(18,4)` value、`verdict` text、`riskLevel` 枚举、`(userId, periodStart, periodEnd, metric)` UNIQUE、被 `aiReports` 引用时回填 `reportId`。Phase 7 的「可追溯结论」复用此形状。
3. **净资产真相源**：`computeNetWorthAtDate(userId, date)` → `{ totalAssets, totalLiabilities, breakdown:{cash,savings,...} }`；`breakdown.cash + breakdown.savings` 即应急金口径（见 `getPeriodMetrics`）。Phase 7 what-if/退休投影以此为基础。
4. **应急金口径已定义**：`emergency_months = cashAssets / expenseTotal`（单月口径，见 `computeFindingsFromData`）。what-if 沿用同口径以保证「与基线一致」。
5. **集中度预警已存在**：`computeConcentrationAlert(positions, threshold=0.6)` ——Phase 7 组合优化方向是它的**自然扩展**（从单一持仓集中度 → 资产类别配置偏离）。
6. **money 工具**：`money.ts` 的 `toCents/fromCents/addCents` —— 全域金额以 cents（整数）运算，避免浮点误差。Phase 7 引擎**必须用 cents**。
7. **Phase 6 目标投影基础**：`006-budget-goals` 的 Goal「预计达成时间」基于「近 N 月平均结余」的明确算法（SC-003：可复现；结余 ≤ 0 提示无法达成）。Phase 7 what-if 的「目标影响」**直接复用同一投影算法**，叠加情景 delta。
8. **家庭维度（Phase 4）**：`requireFamilyMembership(familyId)` 提供 403 路径；`memberId` 为归属锚点。Phase 7 家庭视角分析复用此鉴权。
9. **API/DTO 约定**：响应 `{ data }` / 错误 `{ error, code, details? }`；金额一律 string；`userId` 来自会话；`requireUserId()`。

---

## NC1 — 中国个税规则口径与版本

**Decision**：实现一个**确定性个税纯函数引擎** `tax.engine.ts`，**参数化规则表**而非硬编码到逻辑里。引擎形状（锁定）：

- **综合所得（工资薪金等）**：七级超额累进 + 速算扣除，按「累计预扣预缴」与「年度汇算」两种口径计算；输入 = 月度/年度收入、五险一金（扣除）、专项附加扣除、基本减除费用（5000/月）。
- **全年一次性奖金（年终奖）**：支持两种计税方式对比——
  - `separate`：单独计税（奖金 ÷12 定档 → 奖金 × 税率 − 速算扣除）。
  - `merged`：并入综合所得。
  - 引擎同时输出两者，并标注差额与「较优方向」（规则化，非建议）。
- **专项附加扣除**：目录化（子女教育、继续教育、大病医疗、住房贷款利息、住房租金、赡养老人、3 岁以下婴幼儿照护），每项定额——**取值由 `taxRuleConfig`（版本化 JSON）注入**，不写进代码分支。
- **规则版本号** `ruleVintage`（如 `"PRC-IIT-2026"`）随每次估算落表，明确「基于该版本规则估算」。

**Rationale**：
- 参数化规则表 → 法规变更只改配置不改代码，满足 spec「需以当期法规为准」。
- 同时输出两种年终奖计税 → 直接满足 US2 验收「对比差异并提示较优方向」。
- `ruleVintage` 落表 → 可追溯（SC-002/SC-004），审计时可知按哪年规则算。

**Alternatives**：
- *硬编码七级表到函数体*：拒绝。法规变更需改代码 + 重新发版，违反「可追溯/可改规则」。
- *接外部税务 SaaS*：拒绝。本阶段承诺确定性、可复现、可离线复算；外部 API 不可复现且引入隐私/合规风险。
- *只算综合所得、不算年终奖*：拒绝。年终奖单独/合并是中国高收入人群核心节税点（US2 P2）。

**取值来源（临近实施时回填）**：当时有效的《个人所得税法》及实施条例、国家税务总局公告的税率表与专项附加扣除暂行办法。`research.md` 届时更新 `taxRuleConfig` 的具体数值，**本文不预填**。

---

## NC2 — What-if 投影模型

**Decision**：实现**确定性投影纯函数引擎** `projection.engine.ts`，分两层：

- **基线投影** `projectBaseline(snapshot, horizonMonths, surplusProfile)`：从当前净资产快照 + 历史结余画像出发，逐月推演「净资产曲线 + 应急金月数」。`surplusProfile` 取近 N 月平均结余（**与 Phase 6 Goal 同口径、同窗口**），结余 ≤ 0 则基线即持平/下行并标注。
- **情景叠加** `projectScenario(baseline, scenarioAssumptions)`：在基线之上叠加确定性 delta——
  - `incomeDeltaPct`（降薪 −30%）+ `durationMonths`（持续 6 个月）：在该区间内把月结余按比例下调。
  - `rateDeltaPct`（房贷利率上调）：对负债中标记为房贷的部分，按新利率重算月供增量，计入支出。
  - `lumpExpense`（大额支出，一次性）：在指定月扣除。
  - 输出 = 情景曲线 + 与基线的**逐点 diff**（净资产差、应急金月数差、目标达成时点位移）。

**确定性保证**：同一 `(snapshot, surplusProfile, scenarioAssumptions)` → 同一曲线，**逐月内存循环、零随机性、零 LLM**。LLM 仅在解读层把 diff 翻译成自然语言（NC5）。

**与 Phase 6 同口径**：目标「预计达成时间」复用 `006` 的结余均值算法；what-if 的「目标影响」= 在情景结余下重算达成时点 − 基线达成时点。保证 SC-001「与基线一致、可复现」。

**Rationale**：
- 基线/情景分离 → 任何情景都可与基线逐点 diff，天然「可解释、与基线一致」（US1 验收 2）。
- 复用 Phase 6 结余算法 → 不发明新口径，跨阶段一致。
- 参数化假设 → US1 验收 3「调整参数，结果正确变化」自动满足。

**Alternatives**：
- *蒙特卡洛随机模拟*：拒绝。what-if 要求**确定性、可复现**（spec 红线：不允许 LLM/随机编故事）；蒙特卡洛留给「不确定性展示」的**叠加层**（仅用于退休的区间提示，见 NC3），不作为主结果。
- *逐月查库重算*：拒绝。性能差且与历史快照耦合；改为纯内存循环（NC8）。

---

## NC3 — 退休模拟假设

**Decision**：退休模拟 = `projection.engine.ts` 的**长期基线投影** + **假设束** + **不确定性标注层**：

- **假设束**（`assumptions`，全部可调、全部落表溯源）：`currentAge`、`retirementAge`、`monthlyContribution`（储蓄/投资节奏）、`realReturnRatePct`（实际回报率，默认保守值，来源见下）、`inflationPct`、`postRetirementMonthlySpend`、`withdrawalRatePct`（安全提取率）。
- **结果**：退休时点预估资产（corpus）+ 「能否维持退休后支出」的可持续性判断（corpus × 提取率 vs 月支出，或资产耗尽年限）。
- **不确定性标注**（强制，SC-003）：对回报率/通胀做**确定性敏感性扫描**（如回报率 ±2% 的三个点），输出**区间**（乐观/中性/悲观），而非单一确定值。结果显著标注「长期模拟含强假设，区间仅供方向参考，非确定预测」。

**取值来源（临近实施时确认，本文给默认框架）**：
- `realReturnRatePct` 默认取保守的**实际回报**（如股债组合长期实际回报的历史区间下沿），不承诺高收益。
- `withdrawalRatePct` 参考「4% 规则」类经验值，但**仅作默认**，UI 显著标注其为经验假设。

**Rationale**：
- 复用 `projection.engine` 长期循环 → 不重复造轮子；与 what-if 同引擎保证口径一致。
- 敏感性扫描给区间而非单值 → 满足 SC-003「标注假设与不确定性，不呈现为确定预测」，且仍是确定性（可复现）。
- 假设束全落表 → 可追溯、可复现（US3 验收 2/3）。

**Alternatives**：
- *单点预测*：拒绝。违反「不呈现为确定预测」（SC-003）。
- *全蒙特卡洛*：保留为未来增强；本阶段用确定性三点扫描即可表达不确定性且可复现，复杂度更低。

---

## NC4 — 组合优化方向方法

**Decision**：实现 `portfolio-hint.engine.ts`，**扩展** `computeConcentrationAlert` 的范式，从「单一持仓集中度」升级到「资产类别配置偏离」：

- **资产类别分类法**：复用 Phase 3 allocation 已有的资产类别（如 现金/固收/权益/另类），不发明新分类。
- **目标配置 band**：参数化「目标区间」`targetBands: { [assetClass]: { min, max } }`（版本化 JSON，类比 NC1 的 `taxRuleConfig`）——不硬编码。
- **偏离识别**：对每个资产类别，比较当前占比与 band：低于 `min` → 「偏低」方向，高于 `max` → 「偏高」方向。
- **输出**：每类一条**方向性 hint**（`direction: under/over`、`current`、`targetBand`、`reason` 引用规则），**绝不输出具体买卖品种/数量**。
- **免责**：每条 hint 标注「非投资建议，仅方向参考」。

**Rationale**：
- 扩展而非新建 → 复用 `computeConcentrationAlert` 的纯函数 + cents 运算 + threshold 可配模式。
- 参数化 band → 不同风险偏好可配；规则变更不改代码。
- 仅方向、非指令 → 满足 US4/FR-004「非具体买卖指令」+ edge case「合规免责」。

**Alternatives**：
- *给具体调仓指令*：拒绝。违反 spec（非投资建议、非具体指令）。
- *用 LLM 生成建议*：拒绝。配置偏离是确定性事实，必须由规则判定（红线）；LLM 仅解读。

---

## NC5 — LLM 解读层边界

**Decision**：LLM 解读层**只消费引擎产出的结构化 JSON**，绝不自行产生数字。契约：

- 引擎先算 → 得到结构化结果（含所有数字、diff、假设、免责）。
- LLM 入参 = **该结构化结果 + 一个强约束 prompt**：明确「以下数字为确定性引擎结果，你的任务是用人话解读/排序/强调风险，**不得新增、修改、推断任何数字**；必须保留免责声明」。
- LLM 出参 = 自然语言解读文本；**前端同时渲染引擎的结构化数字**（图表/明细），LLM 文本仅作旁注。
- **零编造校验**：服务层可对 LLM 输出做正则/结构校验（如不得出现引擎结果之外的金额数字），不通过则降级为「仅展示结构化结果」。

**Rationale**：
- 数字始终来自引擎 → 满足 FR-005/SC-001/SC-004「LLM 不编造数字」。
- 复用 `report.service.ts` 既有 LLM 解读范式（Phase 2 月报已是「规则结论 → LLM 表达」）。
- 双通道渲染（结构化 + 解读）→ 即便 LLM 偶发偏差，用户看到的数字仍正确。

**Alternatives**：
- *LLM 直接生成全部内容*：拒绝。违反红线、不可复现、不可追溯。
- *完全不用 LLM*：可作降级态；但 spec 允许 LLM 做「解读与表达」（assumption），保留以提升可读性，仅严格约束。

---

## NC6 — 数据不足降级

**Decision**：每类引擎定义**显式降级条件**，触发时返回 `status: 'degraded'` + `missing[]` 说明缺什么，**不产出编造结论**：

| 分析 | 降级触发 | 降级行为 |
|------|----------|----------|
| What-if | 无任何历史结余（无法建 surplusProfile）/ 无净资产快照 | 返回 `degraded`，提示「数据不足以推演，请先记账 N 个月」 |
| 个税 | 收入/扣除输入缺失 | 按已填项计算 + 标注「未提供 X，已按 0 估算」 |
| 退休 | 无储蓄/投资节奏或年龄缺失 | 返回 `degraded`，提示「需提供储蓄节奏与退休年龄」 |
| 组合优化 | 无持仓 / 总市值 0 | 返回空 hints（同 `computeConcentrationAlert` 现状：无预警） |

**Rationale**：直接满足 FR-007/SC-005「数据不足明确降级，不编造」。降级是**确定性的事实陈述**，由引擎判定，非 LLM。

---

## NC7 — 可复现 / 可追溯

**Decision**：所有落表结果携带溯源元组：

- `engineVersion`（如 `"projection@1.0.0"`、`"tax@1.0.0"`）—— 引擎语义版本；引擎算法变更则升版。
- `assumptions jsonb` —— 本次计算的全部假设/参数（情景 delta、退休假设束、个税扣除项）。
- `baselineSnapshot jsonb`（what-if）—— 计算时的基线净资产/结余画像快照，保证日后可复算「当时的结论」。
- `ruleVintage`（个税，NC1）+ `targetBandsVersion`（组合，NC4）。
- `disclaimers text[]` —— 强制免责（面向展示层直接渲染）。

**Rationale**：同一 `engineVersion + assumptions + baselineSnapshot` → 同一结果（可复现）；全部落表 → 可追溯（SC-004）。复用 `rule-findings` 的「落表即审计」哲学。

**Alternatives**：*只存结果不存假设*：拒绝。法规/假设变更后无法解释历史结论，违反可追溯。

---

## NC8 — 性能

**Decision**：

- 投影（what-if/退休）= **纯内存逐月循环**，最长退休 40 年 × 12 = **480 点**，`O(horizon)`，< 50ms，**不逐月查库**。输入一次性取齐（净资产快照 + 结余画像 + 持仓），传给纯函数。
- 个税 = 纯算术，O(1)。
- 组合优化 = 遍历持仓求和 + 类别聚合，O(positions)。
- 所有引擎**纯函数 + cents 整数运算**，无异步、无 IO，单测可瞬时跑万次保证可复现。

**Rationale**：满足性能目标（< 200ms 即时、退休 < 50ms）+ 可测性。`for…of` 循环符合 `typescript.md` 性能规约。

**Alternatives**：*逐月调用 `computeNetWorthAtDate` 查库*：拒绝。480 次查库不可接受且耦合历史快照；改为一次性取数 + 内存循环。

---

## 决策汇总（驱动 data-model / contracts）

| # | 决策 | 影响 |
|---|------|------|
| NC1 | 个税纯函数引擎 + 参数化 `taxRuleConfig` + `ruleVintage` | `finance_tax_estimates` 表 + `tax.engine.ts` |
| NC2 | 投影引擎：基线 + 情景 diff，复用 Phase 6 结余口径 | `finance_scenarios` + `finance_scenario_projections` + `projection.engine.ts` |
| NC3 | 退休 = 长期投影 + 假设束 + 确定性三点区间 | `finance_retirement_simulations`（复用 projection.engine） |
| NC4 | 组合优化 = 扩展集中度，参数化 `targetBands` | `finance_portfolio_hints` + `portfolio-hint.engine.ts` |
| NC5 | LLM 仅解读结构化结果，零编造校验 | 解读层复用 `report.service` 范式 + 出参校验 |
| NC6 | 每引擎显式降级条件，`degraded` + `missing[]` | DTO 统一 `status` 字段 |
| NC7 | `engineVersion`/`assumptions`/`baselineSnapshot`/`disclaimers` 溯源 | 全部新表共享溯源列 |
| NC8 | 纯内存循环、cents 整数、一次性取数 | 引擎纯函数化，service 层负责取数 |
