# Research: AI 财富顾问深化 (Phase 6)

> 本文件由 `/speckit-plan` 的 Phase 0 产出。目标：在进入数据模型设计前，**解决 spec 标注的所有 NEEDS CLARIFICATION / 远期细节**，锁定「怎么做/为什么/可信边界」。结论以代码勘察为依据；凡设计文档声称「复用既有」但代码中**不存在**的能力，本文件显式标注并给出从零构建方案。
>
> Spec 自述为「远期、前瞻性规划」，阈值/准确率口径**不预先固化**（临近实施结合真实数据标定）。因此本 Phase 锁定的是**结构与可信红线**，数值常量以 `MIN_HISTORY_MONTHS`、`FORECAST_HORIZON_MONTHS` 等具名常量集中定义、便于标定。

## 现状基线（来自代码勘察）

勘察 `src/services/finance`、`src/database/schema/finance`、`src/app/api/finance`、`src/features/finance`、`docs/product-design/ai-wealth-manager.md` 后，Phase 0–5 资产与 007 的「复用 vs 从零」对照如下：

| 能力 | 现状 | 007 复用方式 |
|------|------|--------------|
| 规则引擎 `rules-engine.service.ts` | ✅ 纯函数，产出 `FindingData[]`（`{metric,value,verdict,riskLevel}`）+ `HealthScore`（5 维加权）+ `ConcentrationAlert` | **直接复用**为事实层；扩展趋势规则 + 健康分补全 |
| AI Pipeline（Vercel AI SDK，`report.service.ts`） | ✅ `createOpenAI` + `generateText`/`streamText`，env 配置，系统 prompt 红线完备 | **直接复用**表达层；顾问 prompt 克隆报告红线 |
| 报告系统 `finance_ai_reports` + `finance_rule_findings` | ✅ 多期可枚举（`listReports` 按期带 score；findings 按 period 唯一覆盖） | **直接复用**为趋势对比的时序来源 |
| 净资产时序 `net-worth.service.ts` `snapshotRange` | ✅ 每日快照，可回算 | **复用**为预测的历史输入 |
| 收支聚合 `sumAmountByType` / `getPeriodMetrics` | ✅ 已过滤转账 | **复用**为现金流月度序列 |
| 多模态/对话骨架 `chat` schema | ⚠️ 结构可用但 `visitorId` 键控、非 finance 作用域 | **不复用**，新建 finance 作用域会话表 |
| **审批管道** | ❌ **不存在**（spec 与设计 §5.2 称「复用 042/043 既有」，本仓库无 042/043，仅 001–008；`ai-reports.approved_by` 是无人读写的保留列） | **从零构建**（见决策 4） |
| **预警/通知系统** | ❌ **不存在**（无 `alerts` 表/服务/调度；仅 `computeConcentrationAlert` 内存返回） | **从零构建**（见决策 9） |
| 现金流预测 | ❌ 不存在（聚合输入齐备） | **从零构建**（见决策 2） |
| 顾问会话/可追溯引用 | ❌ 不存在 | **从零构建**（见决策 7） |
| 健康分 `investmentRate` 维度 | ⚠️ 硬桩 `reason:'await_phase3'`；`cashflow` 维度仅二元 `surplus≥0?100:30` | **补全**（见决策 12） |
| Phase 5 预算/目标 | ❌ 仅有 spec（`006-budget-goals`），schema/代码未建 | **不阻塞** 007（见决策 15） |

**结论**：007 落在 Phase 0–4（已建且达标）之上即可实现；审批/预警/预测/顾问四件核心能力为**新建**，但都建立在既有规则引擎（事实层）与 AI SDK（表达层）之上——与设计 §5「双层架构」完全一致。

---

## 决策 1 — 双层可信架构（产品北极星与红线）

**Decision**：007 严格沿用设计 §5 的双层模型——
- **事实层（deterministic）= 规则引擎**：所有涉及具体金额、风险评级、比率、预测点的**数值结论**必须由规则引擎（纯函数）产出，可复现、可追溯。
- **表达层（LLM）= 自然语言**：LLM 只负责把规则结论组织成个性化、易读的对话/报告文本；**严禁**自行计算、推测或捏造数字。
- **降级**：LLM 失败时，所有结论退化为规则结论的**模板文本**（沿用 Phase 1 红线），关键结论不丢失。
- **审批闭环**：高风险动作（标记异常交易、建议调仓、改写财务结论）**绝不**由 LLM 直接落库，必须走 `LLM 提议 → 规则校验 → 用户审批 → 才落库`。

**Rationale**：Spec 的 SC-002（数值 100% 可追溯、不编造）、SC-003（高风险 100% 走审批）、SC-005（LLM 失败降级）是硬约束；双层架构是兑现它们的唯一结构。

**Alternatives**：①让 LLM 端到端生成结论——直接违反 SC-002，否决；②为每类结论写专用 LLM——爆炸式重复，否决。

---

## 决策 2 — 现金流预测模型选型（FR-001）

**Decision**：采用**透明可解释模型**——线性趋势（最小二乘）+ 月度季节均值，**纯函数**实现：
- 输入：最近 `LOOKBACK_MONTHS`（默认 6，标定项）的月度结余序列（`sumAmountByType('income') − sumAmountByType('expense')`，已过滤转账），以及应急金现状。
- 预测：对未来 `FORECAST_HORIZON_MONTHS`（默认 3–6）个月，输出 `forecastPoint = 趋势分量 + 该月历史均值季节分量`。
- 不确定性：基于历史结余对拟合的**残差标准差**给出区间（不是伪造的百分比），并在结果上标注置信/不确定性。
- 应急金耗尽点：在预测曲线上前向推演现金资产 `cashAssets − Σ 期间净流出`，定位首个 `< 0` 或 `< MIN_EMERGENCY_MONTHS×月支出` 的月份——这就是 User Story 1 的「N 月后应急金不足」。

**Rationale**：①可追溯（SC-002）要求预测点必须能回溯到历史输入与公式——黑盒 ML 无法解释「为什么是这个数」；②与既有规则引擎同为纯函数，确定性可复现，便于单元测试与历史回测（SC-001）；③数据规模小（个人月度），简单模型方差足够。

**Alternatives**：①ARIMA/Prophet/神经网络——不可解释、需大量数据、与红线冲突，否决；②纯外推上月值——忽略趋势，回测差，否决。

---

## 决策 3 — 历史不足 / 不确定性的降级口径（Edge Case）

**Decision**：所有预测/画像路径带**显式数据门槛**：
- 当历史月数 `< MIN_HISTORY_MONTHS`（默认 3，标定）→ 不产出数值预测，返回结构化降级标记 `insufficientHistory: true` + 文案「数据不足以可靠预测，建议积累 N 个月后再看」。
- 即便数据足够，预测结果也**必须**携带不确定性区间，**不**呈现为确定性事实（Edge Case「预测不确定性」）。
- 降级路径同样产出**规则结论模板文本**（SC-005），保证关键结论不丢。

**Rationale**：兑现 Edge Case「预测不确定性 / 历史数据不足」与 FR-001 的「历史不足时明确提示降级」。门槛值集中为常量，便于临近实施按真实数据标定。

---

## 决策 4 — 审批闭环从零构建（FR-004 / 关键缺口）

**Decision**：设计 §5.2 与 spec 均称「复用项目既有审批管道」，但代码勘察证实**该管道不存在**（本仓库无 042/043，无 approvals/proposal 表/服务/路由/状态机；`ai-reports.approved_by` 是从未被读写的保留列）。故 007 **从零构建通用审批/提议管道**：

- 新表 `finance_approvals`（见 data-model.md）：`kind`（动作种类）、`payload`（jsonb，提议的具体变更）、`ruleValidation`（jsonb，规则校验结论与依据）、`status`（状态机）、`proposedBy`（来源会话）、`approvedAt`/`appliedAt`/`expiresAt`。
- 通用状态机：`proposed → pending（规则校验通过，待用户）→ approved → applied（落库）`，及 `rejected / expired` 终态。
- **kind 驱动**的校验器与 apply 函数：每种 `kind` 注册一个纯函数校验器（按当前账目 + 规则校验 payload 合法性）与一个 apply（复用既有服务落库）。

**Rationale**：这是 SC-003（高风险动作 100% 走审批、未审批绝不落库）的唯一兑现方式。「复用既有」是设计意图而非既有代码——如实标注，不假装复用。

**Alternatives**：①复用 `LedgerInvariantError`/422 路径表达审批——语义不符（不变量≠待审批），误导客户端，否决；②Postgres RLS——本域零 RLS，单点引入割裂且无法表达「提议待审」语义，否决。

---

## 决策 5 — 审批状态机、规则校验与幂等（FR-004 / SC-003）

**Decision**：
- **双校验**：提议时校验一次（gate，决定能否进入 `pending`）；**apply 时再校验一次**（defensive，防止「提议后账目已变」导致违规落库）。任一失败 → `rejected` + 明确原因。
- **幂等**：`applied` 为终态；对已 `applied` 的提议再次 apply 为 no-op；状态转换受 DB 约束与行锁保护。
- **TTL**：`pending` 超 `PROPOSAL_TTL`（默认 7 天，标定）→ `expired`，不自动落库。
- **可追溯**：`ruleValidation` 记录引用的 `FindingData`，apply 成功后记录实际落库的主键，保证「审批了什么→依据→结果」链完整。

**Rationale**：SC-003 要求「绝不」自动生效；双校验防止「提议→账目变化→仍强行落库」的越权窗口；幂等防止用户重复点击或重试导致双计。

**Alternatives**：仅提议时校验——存在 TOCTOU 越权窗口，否决；无 TTL——待审提议永久滞留，否决。

---

## 决策 6 — 高风险动作种类与落库点（FR-004 / Key Entities）

**Decision**：首版 `kind` 收敛为**有限白名单**（不开放任意动作），每个 kind 的 apply 复用既有服务，不新增落库旁路：

| `kind` | 含义 | apply 落库点（复用） | 是否写账目 |
|--------|------|----------------------|-----------|
| `flag_transaction_anomaly` | 标记某交易为异常 | 更新 `transactions` 的标记/备注字段 | 否（不改金额） |
| `rebalance_suggestion` | 建议调仓（记录为建议备注，**不**自动交易） | 写入持仓/组合的「建议」备注 | 否（仅记录） |
| `amend_finding_override` | 用户覆写某条规则结论口径 | 写结论覆写记录（不影响账目） | 否 |
| `create_transaction`（受限） | 由顾问提议的记账（如建议补录） | 复用 `ledger.service` 写复式分录 | **是**（走既有平衡校验） |

**Rationale**：白名单收敛风险面；**所有改账目动作必走既有复式平衡服务**（`ledger.service`），不另起旁路，保证 Phase 0 不变量不被破坏。调仓只记录建议、不代为交易——兑现设计「仅提示，不代为操作」（沿用 Phase 3 `ConcentrationAlert` 语义）。

**Alternatives**：开放任意 payload——风险与审计不可控，否决；调仓直接生成交易——违反「不代为操作」，否决。

---

## 决策 7 — 顾问会话数据模型（FR-003 / FR-007）

**Decision**：**不复用** `chat` schema（visitorId 键控、非 finance 作用域、无可追溯引用）。新建 finance 作用域会话表 `finance_advisor_sessions` + `finance_advisor_messages`：
- `sessions`：`userId`（auth，非 visitor）、标题/摘要、创建时间；按用户隔离。
- `messages`：`role`（user/assistant）、`content`、**`citedFindings`（jsonb，本条回答所依据的 `FindingData`/预测点引用）**、`degraded`（是否降级模板）、`proposalId`（若本条携带高风险提议，指向 `finance_approvals`）。
- 上下文裁剪复用既有 `chat-context-trimmer.ts`（token 预算）。

**Rationale**：FR-007（数值可追溯）要求每条建议能回溯依据——`citedFindings` 是结构化锚点；user 作用域保证 FR-010 隔离；`proposalId` 把「顾问提议」与「审批闭环」结构化串联（FR-004）。

**Alternatives**：复用 visitorId chat——无法按用户隔离、无可追溯字段，否决；把引用放正文字符串——不可机读、易丢失，否决。

---

## 决策 8 — 顾问 LLM 双层调用（FR-003 / SC-002）

**Decision**：顾问服务为「事实层 → 表达层」两段式，**克隆 `report.service.ts` 的红线系统 prompt**（「所有具体数字必须直接引用下面给定的结论，严禁自行计算、推测或捏造」）：
1. 取事实层：`computeFindingsFromData` + `computeHealthScore` + 决策 2 的预测点 + 多期趋势，组装为**结构化结论上下文**。
2. 表达层：`generateText`/`streamText`（复用 AI SDK），系统 prompt 强约束只引用给定结论；返回文本 + `citedFindings`。
3. 当 LLM 抛错/超时 → 降级为基于规则结论的模板文本（`degraded=true`），关键结论不丢（SC-005）。
4. 顾问若建议高风险动作 → 生成 `finance_approvals` 提议（`proposed` 态），**不**在对话里直接落库（FR-004）。

**Rationale**：与报告完全同构的红线，最小化新增风险；降级路径复用 Phase 1 既有策略。

**Alternatives**：让顾问自由回答——违反 SC-002，否决。

---

## 决策 9 — 智能预警生成与持久化（FR-002 / Edge Case）

**Decision**：从零建预警系统，但**生成逻辑复用规则引擎**：
- 新表 `finance_smart_alerts`：`kind`（`emergency_shortfall` / `savings_rate_decline` / `debt_ratio_high` / `trend_deterioration` / `concentration` 等）、`severity`（映射自 `riskLevel`）、`ruleFindingRefs`（jsonb，可追溯依据）、`period`、`status`（`active|acknowledged|silenced`）、`message`（规则结论模板）、`dismissedAt`。
- 生成：在报告/快照刷新钩子上 best-effort 跑规则引擎 → 物化预警（沿用 `computeConcentrationAlert` 模式扩展）。
- **幂等**：唯一约束 `(userId, kind, period)`，同期间重复生成覆盖而非堆积（避免预警疲劳，Edge Case）。

**Rationale**：FR-002 要求预警依据可追溯到规则结论——`ruleFindingRefs` 即锚点；幂等约束防重复打扰。

**Alternatives**：每次查询实时算不持久化——无法「静默/已读/历史」、无法支持 FR-008，否决。

---

## 决策 10 — 趋势预警（新规则，FR-005 / FR-002）

**Decision**：在规则引擎**新增趋势规则**（纯函数）：
- 输入多期 `FindingData`（按 period 排序）。
- 规则：储蓄率/健康分**连续 `TREND_DECLINE_PERIODS`（默认 3，标定）期下降** → `trend_deterioration` 预警；应急金从「充足」跨入「不足」→ `emergency_shortfall`。
- 输出与既有 `FindingData` 同形（`metric=trend_*`、`riskLevel`、`verdict`），无缝并入预警/顾问事实层。

**Rationale**：User Story 3「显著恶化（如健康分连续下降）→ 趋势预警」的直接兑现；复用 `FindingData` 形状，零适配接入预警与顾问。

**Alternatives**：单独的趋势表——与 findings 重复口径，否决。

---

## 决策 11 — 预警偏好/静默（FR-008）

**Decision**：新表 `finance_alert_preferences`：每 `userId` × `kind` 一行，字段 `muted`（bool）、`mutedUntil`（可空）、`channel`（预留）。展示层据此过滤；`kind=paused` 的不进活跃列表，但仍可历史回看。

**Rationale**：兑现 Edge Case「预警疲劳 / 可配置可静默」。`mutedUntil` 支持临时静默。

**Alternatives**：删除已读预警——丢失历史与可追溯，否决。

---

## 决策 12 — 健康分体系完善（FR-006）

**Decision**：在 `computeHealthScore` 基础上**补全两维**（不重写既有加权模型）：
- **`investmentRate`**：桩 `await_phase3` → 接 Phase 3 持仓，`投资资产 / 总资产`（复用 allocation/positions 数据）；缺数据走既有缺维降权。
- **`cashflow` 稳定性**：二元 `surplus≥0?100:30` → 改为**近 `STABILITY_WINDOW`（默认 3–6 月）结余的方差/趋势评分**（需要多期 findings，见决策 10）。
- 权重与降权逻辑沿用既有实现（`rules-engine.service.ts` 259–261）。

**Rationale**：设计 §6 明确该两维；spec FR-006「在 Phase 1 基础上完善」即指此。补全后评分仍确定性可复现（SC-002）。

**Alternatives**：新增第六维——改变既有契约与历史可比性，否决；保持桩——与 FR-006 冲突，否决。

---

## 决策 13 — 多期趋势对比的数据来源（FR-005）

**Decision**：**不新建时序表**，纯函数聚合既有数据：
- 输入：`listReports`（按期带 `score`）+ 各期 `finance_rule_findings`（`savings_rate`/`debt_ratio`/`emergency_months`）。
- 输出：按 period 排序的指标时序 + 趋势方向（↑/↓/平稳）+ 显著恶化标记（复用决策 10 趋势规则）。
- 与各期报告结论一致（SC-004），无独立口径。

**Rationale**：报告 + findings 已是多期事实源，新建表重复；纯函数易测、可复现。

**Alternatives**：快照式趋势表——重复且需维护一致性，否决。

---

## 决策 14 — 合规免责与可追溯（FR-009 / SC-002）

**Decision**：
- **单一免责常量** `NON_INVESTMENT_ADVICE_DISCLAIMER`（「本内容非投资建议，所有结论来自规则引擎与账目数据，投资决策请自行判断」）追加到**所有**预测/建议/顾问/预警响应与前端展示面。
- 每条数值结论携带 `sourceRefs`（引用的 findings/账目区间），前端可展开「为什么是这个数」。

**Rationale**：兑现设计 §9 与 FR-009；集中常量保证不遗漏。

---

## 决策 15 — Phase 5 未建的影响与 007 的可实现性

**Decision**：007 的 FR-001..FR-010 **均不依赖** 预算/目标表（`006-budget-goals` 仅有 spec、未建）。故 007 落在已建且达标的 Phase 0–4 上**可独立交付**。
- 设计「依赖 Phase 0–5」中 Phase 5 部分为**路线图层面的概念依赖**，非代码依赖。
- 预算目标若将来建，可作为 007 预测/预警的**额外输入**（`forecastPoint` 增加预算约束项），但非阻塞。
- **风险标注**：当前数据规模/真实回测样本不足，FR-001 预测准确率（SC-001）只能临近实施时标定——本 Phase 提供回测脚手架与可标定常量，不预先承诺阈值。

**Rationale**：避免被未建的 Phase 5 阻塞；如实区分「概念依赖」与「代码依赖」。

---

## 迁移与索引（实现阶段参照）

- 新增 5 张表：`finance_cash_flow_forecasts`、`finance_smart_alerts`、`finance_alert_preferences`、`finance_advisor_sessions` + `finance_advisor_messages`、`finance_approvals`。
- 命名/口径沿用 finance 域约定（`finance_` 前缀、snake_case 复数、`userId` 纯文本、`onDelete:cascade`、金额 `decimal(18,4)`、timestamps）。
- 关键索引：forecast 唯一 `(userId, targetMonth)`；alert 唯一 `(userId, kind, period)`；preference 唯一 `(userId, kind)`；approval `(userId, status)`；session/message `(userId, sessionId, createdAt)`。

---

## NEEDS CLARIFICATION 清单（全部已解决）

| 来源 | 待澄清项 | 解决决策 |
|------|----------|----------|
| spec FR-001 | 预测模型选型 | 决策 2：透明回归 + 季节均值，纯函数 |
| spec FR-001 / Edge Case | 不确定性/历史不足口径 | 决策 3：显式门槛 + 区间标注 + 降级 |
| spec FR-004 / Key Entities | 「复用既有审批管道」不存在 | 决策 4–6：从零构建通用审批管道 + 白名单 kind |
| spec FR-003 / FR-007 | 顾问会话与可追溯 | 决策 7–8：finance 作用域会话 + citedFindings + 双层调用 |
| spec FR-002 / Edge Case | 智能预警持久化与疲劳 | 决策 9–11：预警表 + 趋势规则 + 偏好静默 |
| spec FR-006 | 健康分完善范围 | 决策 12：补 investmentRate + 现金流稳定性 |
| spec FR-005 / SC-004 | 趋势对比数据来源 | 决策 13：纯函数聚合 reports + findings |
| spec FR-009 / §9 | 合规免责 | 决策 14：单一常量 + sourceRefs |
| spec Assumptions | 「依赖 Phase 0–5」中 Phase 5 未建 | 决策 15：007 落在 Phase 0–4，不阻塞 |
| spec SC-001 | 准确率阈值不固化 | 决策 2/15：具名常量 + 回测脚手架，临近标定 |

> 无 NEEDS CLARIFICATION 残留——全部远期细节已落到结构与可信红线。
