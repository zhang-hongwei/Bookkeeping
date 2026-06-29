# Research — 净资产闭环 + 首份 AI 报告 (Phase 1)

> Phase 0 输出：解决 Technical Context 中的所有技术决策点。每项给出 Decision / Rationale / Alternatives。
> 大前提：Phase 1 **依赖 Phase 0 复式记账地基已实现**（accounts/categories/transactions/entries、`balance.service`、系统权益账户 `__income`/`__expense`）。净资产、规则结论、健康分全部由 Phase 0 的分录与余额严格推导。

## R1. 净资产的推导口径

**Decision**：净资产完全由 Phase 0 的 `accounts.balance`（物化余额）推导，不另立账本：
- **总资产** = `Σ balance` over `type ∈ {cash, savings, investment, real_asset} AND include_in_net_worth = true`（资产类余额方向 = 借−贷）。
- **总负债** = `Σ balance` over `type = credit`（负债类余额方向 = 贷−借，显示为欠款；取正值计入负债）。
- **净资产** = 总资产 − 总负债。
- Phase 1 实际只有 `cash`/`savings`/`credit` 有数据（investment/real_asset 属 Phase 2/3），但公式对未来类型天然兼容。

**Rationale**：复式记账已保证「转账不改净资产」（资产账户借此贷彼相消）、收支如实改变净资产。直接复用物化余额即可得到严格自洽的净资产，零额外校验负担。

**Alternatives**：从 `entries` 实时聚合净资产——可行但读放大（明细多时慢），且与 Phase 0 物化余额重复。改为读 `balance`（R2 再做日级快照）。

## R2. 净资产快照：物化日表 + 变更重算 + 历史回填

**Decision**：新增 `net_worth_snapshots`（每用户每日一行：`date, total_assets, total_liabilities, net_worth, breakdown jsonb`）。
- **触发**：(a) 每日定时（cron / 首次访问懒计算当日）；(b) **任何交易增/改/删**后，重算受影响日期区间 `[occurredAt 当日 .. 今天]` 的快照（沿用 Phase 0 `ledger.service` 事务边界，追加快照维护）。
- **历史回填**：首次启用净资产功能时，按已有 `entries` 倒算历史每日快照，曲线不从启用当天才开始（Spec Edge Case「曲线历史回填」）。
- **曲线读取**：仪表盘与曲线**只读** `net_worth_snapshots`，不实时聚合全量历史。

**Rationale**：与 Phase 0 物化 `balance` 同构（写时维护、读时 O(1)）；快照避免曲线随明细增长而变慢，并支持「今日变化」(today vs yesterday) 与历史回填。变更重算保证曲线与账目始终一致（SC-001）。

**Alternatives**：纯实时聚合做曲线——明细增多后曲线查询变慢，且「今日变化」需每次扫全表；物化视图（PG MV）——刷新时机难与事务对齐、调试复杂（与 Phase 0 R3 结论一致）。

## R3. 规则引擎：确定性纯函数、可审计

**Decision**：`rules-engine.service` 以**纯函数**计算结构化结论 `RuleFinding { metric, value, verdict, riskLevel }`，零 LLM、零外部 IO，输入为给定周期的账目汇总（取自 transactions/entries/snapshots）。核心指标（按 Spec FR-007 / 设计 §6）：
- `income_total` / `expense_total` / `surplus`（月收入/支出/结余，由 `type` 聚合，转账不计）。
- `savings_rate` = surplus / income_total。
- `debt_ratio` = 总负债 / 总资产（取周期末快照）。
- `emergency_months` = 现金类资产 / 月均支出。

**Rationale**：满足红线「规则引擎负责准确」——结论可测试、可审计、零幻觉（SC-003 可逐项追溯）。纯函数使其在相同输入下稳定可复现，便于单元测试与回归。

**Alternatives**：让 LLM 直接算这些数字——破坏 SC-003（幻觉红线）、不可测试。明确拒绝。

## R4. 月报：规则结论→LLM 表达（零幻觉流水线）

**Decision**：月报生成走两段式：
1. **事实层**：`rules-engine` 先产出该周期全部 `RuleFinding`（数字结论）。
2. **表达层**：仅把 `RuleFinding[]` 作为**只读事实**喂给 LLM（Vercel AI SDK），令其生成自然语言解读与个性化建议；prompt 明确「数字必须引用给定结论、不得自行计算或捏造」。
- 报告正文产物落到现有**文档/Block** 体系（复用 product-agent + AI Pipeline），`ai_reports` 表只存元数据（period/type/score/sourceDataHash/status 等）。

**Rationale**：实现「报告中所有具体数字结论来自规则引擎、LLM 只解释」（SC-003）。把真相源（领域数据）与报告层（文档/Block）分离，符合设计 P3「领域模型是真相源、文档是报告层」。

**Alternatives**：让 LLM 端到端生成报告——幻觉不可控；纯模板报告——无个性化、差异化不足。两段式是「准确 + 表达」的平衡。

## R5. LLM 失败降级（模板回退）

**Decision**：报告生成时若 LLM 调用异常/超时/输出不合规，**降级**为基于 `RuleFinding[]` 的确定性模板文本（如「本月结余 ¥{surplus}，储蓄率 {savings_rate}%，应急金 {emergency_months} 个月」），保证关键数字结论仍呈现（SC-004）。降级在 `ai_reports` 标注 `status`/降级标记。

**Rationale**：满足红线「LLM 失败时降级为规则结论模板文本」，报告可用性不依赖 LLM 可用性。

**Alternatives**：LLM 失败即报错给用户——体验差、关键财务结论丢失。明确拒绝。

## R6. 数据变化检测（sourceDataHash 失效）

**Decision**：报告生成时计算 `source_data_hash = hash(该周期相关 transactions/entries/snapshots 的归一化指纹)`，存入 `ai_reports`。再次查看报告时比对当前指纹：不一致 → 标记 `stale` 并提示「数据已变化，可重新生成」（Spec FR-010 / US3-AC4）。

**Rationale**：报告是「生成时刻的数据快照」，底层数据变化后须提示用户，避免展示过期结论误导决策。

**Alternatives**：每次查看实时重算——抹杀了「报告」的快照语义、且成本高；不检测——过期结论误导。指纹法成本低、语义清晰。

## R7. 截图 OCR 记账（复用多模态 AI）

**Decision**：复用项目既有**多模态 AI 对话能力**（009 分支、`@ai-sdk/openai` 多模态 + structured output），新增 `ocr-record.service`：图片 → 多模态模型识别 → Zod structured output 得候选交易 `{ type, amount, occurredAt?, counterparty?, categoryId?, accountId?, note? }` + `confidence`。产出**候选**交用户确认（低置信度强制确认），确认后走 Phase 0 `POST /transactions` 落库，`source` 标记为 `ocr`。多笔截图逐笔拆分候选，无法可靠拆分时降级为人工补全。

**Rationale**：复用已有 AI 能力、与自然语言记账（Phase 0 R8）共用「候选→确认」闭环；满足 SC-005（核心字段准确率）与「低置信度不静默落库」。

**Alternatives**：本地 OCR（Tesseract 等）+ 规则解析——对中文支付截图准确率差、维护重；导入即落库无确认——不可控。复用多模态 AI 是最高杠杆。

**实现前确认**：项目多模态对话能力（009 分支）的当前可用形态（是否已合并主干、图片上传通道）——若未就绪，OCR 可作为本阶段可独立降级的子能力（先交付净资产/规则/报告闭环）。

## R8. 财务健康分权重与 Phase 1 折算

**Decision**：健康分按设计 §6 的 5 维加权（储蓄率 25% / 负债率 25% / 应急金 20% / 投资率 15% / 现金流稳定性 15%），由 `rules-engine` 确定性计算，输出总分 0–100 + 各维度雷达图。**Phase 1 折算**：`investment_rate` 在本阶段无持仓数据（Phase 3 才有），按 Spec FR-012 对缺失维度**降权并把权重重分配**到其余维度（或标注「待 Phase 3」），不编造数字。维度数据不足（如新用户无现金流历史）同样降权/标注（US4-AC2）。

**Rationale**：满足「确定性可复现」（SC-006）与「缺失维度不编造」（FR-012）。权重重分配规则须在 `rules-engine` 中显式、可测。

**Alternatives**：强行估算投资率——无数据来源、必幻觉；屏蔽健康分到 Phase 3——丧失本阶段价值抓手。降权重分配是诚实的折中。

## R9. 对 Phase 0 的依赖与 schema 增量

**Decision**：Phase 1 不重做账本，仅在 Phase 0 schema 上**增量**：
- `transactions.source` enum 追加 `ocr`（Phase 0 为 `manual/import/nl`）。
- 新增 `net_worth_snapshots`、`rule_findings`、`ai_reports` 三表（见 data-model.md）。
- 复用 Phase 0 `balance.service`（余额）、`ledger.service`（记账事务）——在 ledger 事务内追加快照维护钩子。

**关键前置**：Phase 0 **必须先实现并达到其退出标准**（账目平衡、转账不改净资产、导入去重等）。Phase 1 的净资产/规则结论正确性完全建立在 Phase 0 账目正确之上。**若 Phase 0 尚未实现，Phase 1 无法独立交付。**

**Rationale**：避免重复造账本地基；增量 schema 降低耦合。

**Alternatives**：Phase 1 自带一套账本——重复、易不一致，明确拒绝。

## R10. 快照一致性（与交易编辑/删除联动）

**Decision**：净资产快照的维护挂在 Phase 0 `ledger.service` 的记账/改/删事务之后：操作完成后，按受影响 `occurred_at` 到当前日期重算 `net_worth_snapshots`（同事务或紧随其后）。`balance.service.verifyAll` 巡检扩展为同时校验「快照净值 == 当前余额推导净值」，不一致则修复+告警（沿用 SC-007 自愈思路）。

**Rationale**：保证 SC-001（曲线与账目不一致率 = 0）与 Edge Case「快照与实时聚合一致性」。

**Alternatives**：快照独立定时刷新、不与交易联动——曲线会短暂滞后/残留旧值，违反 SC-001。
