# Data Model — 净资产闭环 + 首份 AI 报告 (Phase 1)

> Phase 1 输出：在 Phase 0 复式记账 schema（`src/database/schemas/finance/`）上增量。金额一律 `numeric(18,2)`，禁止浮点；命名复数 snake_case；`user_id` 隔离；`timestamptz`。
> 新表与 Phase 0 同置于 `finance/` 子领域，barrel 经 `index.ts` 接入。

## 实体总览

```
Phase 0（已设计，本阶段依赖）:
  accounts ──< entries >── transactions ──< bill_import_rows
  categories；系统权益账户 __income/__expense

Phase 1 新增:
  net_worth_snapshots     每用户每日净资产物化（曲线数据源）
  rule_findings           规则引擎确定性结论（可审计、零幻觉）
  ai_reports              AI 月报元数据（正文落文档/Block，此表存指纹/状态）

Phase 1 schema 变更:
  transactions.source enum += ocr
```

**核心不变式（沿用 Phase 0 并扩展）**：
- 复式平衡：任意 transaction `Σdebit == Σcredit`（Phase 0，本阶段不触碰）。
- **快照一致**：任意日期的 `net_worth_snapshots.net_worth` == 该日期由 `accounts.balance` 推导的净值（资产类借−贷之和 − 负债类贷−借之和）。不一致 → 修复+告警。
- **零幻觉**：`rule_findings` 全部由确定性纯函数产出，`ai_reports` 的数字结论全部引用 findings，LLM 不得自行产生数字。

---

## 1. net_worth_snapshots（净资产日快照 — 曲线数据源）

| 字段 | 类型 | 说明 / 约束 |
|------|------|-------------|
| `id` | text PK | 前缀 `snap_` |
| `user_id` | text, not null | FK→users, cascade |
| `date` | date, not null | 快照日（仅日期，无时分） |
| `total_assets` | numeric(18,2) | 当日总资产（资产类账户余额之和） |
| `total_liabilities` | numeric(18,2) | 当日总负债（credit 类欠款之和，≥0） |
| `net_worth` | numeric(18,2) | `= total_assets − total_liabilities`（可负：资不抵债） |
| `breakdown` | jsonb | 按账户类型的分项明细，如 `{ cash, savings, credit, investment, real_asset }` |
| `created_at / updated_at` | timestamptz | |

**约束**：`UNIQUE(user_id, date)`（每用户每日一行）。`net_worth == total_assets − total_liabilities`。

**派生**：见 research R1：资产 = `Σ balance(type∈{cash,savings,investment,real_asset} AND include_in_net_worth=true)`；负债 = `Σ |balance(type=credit)|`。

**维护（research R2/R10）**：
- 每日定时/懒计算当日快照。
- 交易增/改/删后，重算 `[occurred_at 当日 .. today]` 区间的快照（挂 ledger.service 事务）。
- 首次启用：历史回填全部已有日期。

---

## 2. rule_findings（规则引擎确定性结论 — 可审计、零幻觉）

| 字段 | 类型 | 说明 / 约束 |
|------|------|-------------|
| `id` | text PK | 前缀 `fnd_` |
| `user_id` | text, not null | FK→users, cascade |
| `period_kind` | enum | `month`（Phase 1 仅月；预留 `quarter`/`year`） |
| `period_start` | date, not null | 周期起（含） |
| `period_end` | date, not null | 周期止（含） |
| `metric` | enum | `income_total`/`expense_total`/`surplus`/`savings_rate`/`debt_ratio`/`emergency_months`（Phase 1；预留扩展） |
| `value` | numeric(18,4) | 结论数值（比率用 4 位小数；金额 2 位） |
| `verdict` | text | 文字判定，如「良好/警戒/危险」或模板短句 |
| `risk_level` | enum | `none`/`low`/`medium`/`high` |
| `report_id` | text | FK→ai_reports，可空（被某报告引用时回填） |
| `created_at` | timestamptz | |

**约束**：同一 `(user_id, period_start, period_end, metric)` 唯一；重算覆盖旧值（保留最新确定性结论）。

**派生**：`rules-engine.service` 纯函数产出（research R3）：
- `savings_rate = surplus / income_total`（income_total=0 时 verdict 标注、value 留空）。
- `debt_ratio = total_liabilities / total_assets`（取周期末快照）。
- `emergency_months = 现金类资产 / 月均支出`。

---

## 3. ai_reports（AI 月报元数据 — 正文落文档/Block）

| 字段 | 类型 | 说明 / 约束 |
|------|------|-------------|
| `id` | text PK | 前缀 `rpt_` |
| `user_id` | text, not null | FK→users, cascade |
| `type` | enum | `monthly`（Phase 1；预留扩展） |
| `period_start` | date, not null | 报告周期起 |
| `period_end` | date, not null | 报告周期止 |
| `score` | numeric(5,2) | 财务健康分 0–100（由 findings 加权，research R8） |
| `dimensions` | jsonb | 各维度得分（储蓄率/负债率/应急金/投资率/现金流），含降权标注 |
| `status` | enum | `draft`/`published`/`stale`/`degraded`（degraded=LLM 失败已模板降级） |
| `source_data_hash` | text, not null | 周期数据指纹（research R6），用于检测数据变化 |
| `content_ref` | text | 指向文档/Block 产物（报告正文承载） |
| `approved_by` | text | 可空（Phase 1 月报自动生成；高风险动作审批属 Phase 6） |
| `generated_at` | timestamptz | 生成时间 |
| `created_at / updated_at` | timestamptz | |

**约束**：查看时比对当前周期数据指纹与 `source_data_hash`，不一致 → 置 `stale` 并提示重新生成（FR-010）。

**生成（research R4/R5）**：事实层 findings → LLM 表达 → 文档/Block 正文；LLM 失败 → `degraded` + 模板文本（数字仍来自 findings）。

---

## 4. Phase 0 schema 变更：transactions.source += ocr

```diff
- source  enum  manual / import / nl
+ source  enum  manual / import / nl / ocr
```

**影响**：截图 OCR 记账确认落库后，`transactions.source = 'ocr'`，`confidence` 取模型识别置信度（research R7）。属 Phase 0 表的枚举扩展——若 Phase 0 尚未生成迁移，则在 Phase 1 首个迁移中一并包含 `ocr`；若已生成，则单独 ALTER。

---

## 关系（relations.ts 集中扩展）

- `users` 1—N `net_worth_snapshots`；`net_worth_snapshots` 按日期唯一定位。
- `users` 1—N `rule_findings`；`rule_findings` N—1 `ai_reports`（report_id）。
- `users` 1—N `ai_reports`。
- `ai_reports` 1—N `rule_findings`（一份报告引用其周期内全部 findings）。

## 服务层入口（新增于 services/finance）

- `net-worth.service`：
  - `computeNetWorth(userId, date)`：由账户余额推导某日净值（R1）。
  - `snapshotToday(userId)` / `snapshotRange(userId, from, to)`：写/重算快照（R2/R10）。
  - `backfillHistory(userId)`：首次启用历史回填。
  - `verifySnapshots(userId)`：快照净值 vs 余额推导净值校验+自愈（R10）。
- `rules-engine.service`：纯函数 `computeFindings(userId, period)` → `RuleFinding[]`；`computeHealthScore(findings)` → `{ total, dimensions }`（R3/R8，含缺失维度降权重分配）。
- `report.service`：`generateMonthly(userId, period)` → findings → LLM 表达 → 文档/Block + `ai_reports`（含 sourceDataHash）；LLM 失败降级模板（R4/R5/R6）。
- `ocr-record.service`：图片 → 多模态 structured output → 候选交易 + confidence（R7），确认后走 Phase 0 `ledger.service` 落库（source=ocr）。
