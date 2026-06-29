# Data Model: AI 财富顾问深化 (Phase 6)

> Phase 1 产出。在 Phase 0–4 既有 `finance` 领域上**增量** 6 张表（预测 / 预警 / 预警偏好 / 顾问会话 / 顾问消息 / 审批），不改既有表结构（健康分完善为**代码层**扩展，不动 schema；趋势指标复用 `finance_rule_findings` 既有形状）。所有表沿用 finance 域约定：`finance_` 前缀、snake_case 复数、`userId` 纯文本（Supabase id，无 FK）、`onDelete: cascade`、金额 `decimal(18,4)`、timestamps。决策依据见 [research.md](./research.md)。

## 1. 实体关系总览

```text
                       finance_rule_findings (既有, 多期)  ──┐
                                                              │ ruleFindingRefs
finance_ai_reports (既有) ── trends ── (纯函数)                │
                          │                                   ▼
finance_net_worth_snapshots (既有) ──► forecast 输入 ──► finance_smart_alerts ──┐
                          │                                   ▲                │ muted/silence
                          ▼                                   │                ▼
                 finance_cash_flow_forecasts          规则引擎(代码)    finance_alert_preferences

finance_advisor_sessions 1──* finance_advisor_messages  *──1 finance_approvals
        (userId)                  │ citedFindings ─────────► finance_rule_findings
                                  │ proposalId ─────────────► finance_approvals
                                  └─► (LLM 表达层, 复用 AI SDK)
```

**要点**：事实源（findings/reports/snapshots）**只读复用**；预测、预警、顾问消息、审批为**新增可写**实体。`citedFindings` / `ruleFindingRefs` / `ruleValidation` 三处 jsonb 是 SC-002「数值可追溯」的结构化锚点。

## 2. 新增表

### 2.1 `finance_cash_flow_forecasts` — 现金流预测（缓存）

> 预测本身是纯函数（决策 2），此表用于缓存最近一次结果 + 降级标记，避免重复计算与支持「最近一次预测」展示。

| 列 | 类型 | 说明 |
|----|------|------|
| `id` | text PK | `idGenerator('cash_flow_forecasts')` |
| `userId` | text notNull | 用户隔离 |
| `targetMonth` | varchar(7) notNull | 预测基准月 `YYYY-MM` |
| `series` | jsonb notNull | `{ points:[{month, surplus, cashBalance, lower, upper}], emergencyShortfallMonth?:string, modelVersion:string }` |
| `insufficientHistory` | boolean notNull default false | 历史不足降级标记（决策 3） |
| `generatedAt` | timestamptz notNull | 生成时间 |
| `created_at` / `updated_at` / `accessed_at` | timestamptz | `...timestamps` |

- **唯一索引** `(userId, targetMonth)` — 同月重算覆盖。
- **不变量**：`series.points` 的金额均为 `decimal`（存为字符串/数字，禁浮点）；`insufficientHistory=true` 时 `series` 仅含降级说明，无数值预测点（I3）。

### 2.2 `finance_smart_alerts` — 智能预警

| 列 | 类型 | 说明 |
|----|------|------|
| `id` | text PK | |
| `userId` | text notNull | |
| `kind` | varchar(40) notNull | `emergency_shortfall` / `savings_rate_decline` / `debt_ratio_high` / `trend_deterioration` / `concentration` |
| `severity` | varchar(10) notNull | 映射自 `riskLevel`：`low|medium|high` |
| `ruleFindingRefs` | jsonb notNull default '{}' | 引用的 `FindingData` 锚点（period+metric+verdict），可追溯（I1） |
| `period` | varchar(7) notNull | 触发期 `YYYY-MM` |
| `status` | varchar(14) notNull default 'active' | `active|acknowledged|silenced` |
| `message` | text notNull | 规则结论模板文案（非 LLM 自由文本） |
| `dismissedAt` | timestamptz | 静默/已读时间 |
| `created_at` / `updated_at` / `accessed_at` | timestamptz | |

- **唯一索引** `(userId, kind, period)` — 幂等，同期同种覆盖（防疲劳，决策 9）。
- **索引** `(userId, status)` — 活跃列表查询。

### 2.3 `finance_alert_preferences` — 预警偏好/静默

| 列 | 类型 | 说明 |
|----|------|------|
| `id` | text PK | |
| `userId` | text notNull | |
| `kind` | varchar(40) notNull | 同 alerts.kind |
| `muted` | boolean notNull default false | 是否静默（FR-008） |
| `mutedUntil` | timestamptz | 临时静默截止；NULL=永久/直到取消 |
| `channel` | varchar(20) | 预留渠道 |
| `created_at` / `updated_at` / `accessed_at` | timestamptz | |

- **唯一索引** `(userId, kind)` — 每 kind 一行。

### 2.4 `finance_advisor_sessions` — 顾问会话

| 列 | 类型 | 说明 |
|----|------|------|
| `id` | text PK | |
| `userId` | text notNull | auth 用户（非 visitorId） |
| `title` | varchar(120) | 会话标题/摘要 |
| `createdAt` | timestamptz notNull default now | |
| `created_at` / `updated_at` / `accessed_at` | timestamptz | |

- **索引** `(userId, createdAt)` — 列表/分页。

### 2.5 `finance_advisor_messages` — 顾问消息（含可追溯引用）

| 列 | 类型 | 说明 |
|----|------|------|
| `id` | text PK | |
| `sessionId` | text notNull → `finance_advisor_sessions.id` (cascade) | |
| `userId` | text notNull | 冗余便于隔离查询（I5） |
| `role` | varchar(16) notNull | `user|assistant` |
| `content` | text notNull | 消息正文（assistant 为 LLM 表达文本） |
| `citedFindings` | jsonb notNull default '[]' | 本条依据的 `FindingData`/预测点引用（FR-007 锚点，I1） |
| `degraded` | boolean notNull default false | 是否 LLM 失败降级模板（SC-005） |
| `proposalId` | text → `finance_approvals.id` (set null) | 本条携带的高风险提议（FR-004 串联） |
| `createdAt` | timestamptz notNull default now | |
| `created_at` / `updated_at` / `accessed_at` | timestamptz | |

- **索引** `(sessionId, createdAt)` — 会话内时序。
- **不变量**：assistant 消息的数值结论必须能在 `citedFindings` 找到来源（I1）；`degraded=true` 时 `content` 为模板文本（I7）。

### 2.6 `finance_approvals` — 审批闭环（提议管道）

| 列 | 类型 | 说明 |
|----|------|------|
| `id` | text PK | |
| `userId` | text notNull | |
| `kind` | varchar(40) notNull | 白名单：`flag_transaction_anomaly` / `rebalance_suggestion` / `amend_finding_override` / `create_transaction` |
| `payload` | jsonb notNull | 提议的具体变更（kind 结构化） |
| `ruleValidation` | jsonb notNull | 规则校验结论 + 引用 findings（I1） |
| `status` | varchar(12) notNull default 'proposed' | `proposed|pending|approved|rejected|applied|expired` |
| `proposedBy` | text → `finance_advisor_messages.id` (set null) | 来源消息 |
| `approvedAt` | timestamptz | |
| `appliedAt` | timestamptz | 落库时间 |
| `appliedResult` | jsonb | 落库结果（主键等） |
| `expiresAt` | timestamptz notNull | TTL（默认 proposed+7d） |
| `created_at` / `updated_at` / `accessed_at` | timestamptz | |

- **索引** `(userId, status)` — 待审列表。
- **不变量**：仅 `approved` 且 apply 时规则再校验通过 → `applied`（I2）；`applied` 为终态，幂等（I8）；超 `expiresAt` 的 `proposed/pending` → `expired`，不落库。

## 3. 既有表扩展（仅代码层，不改 schema）

### 3.1 `finance_rule_findings`（既有）— 趋势指标复用

- **不改列**。趋势规则（决策 10）产出的 `metric='trend_*'`（如 `trend_savings_decline`、`trend_health_decline`）写入既有表，沿用 `{metric,value,verdict,riskLevel}` 形状与 `(userId,periodStart,periodEnd,metric)` 唯一约束。
- 健康分完善（决策 12）在 `rules-engine.service.ts` 代码内完成：`investmentRate` 接 Phase 3 持仓、`cashflow` 改方差评分——**不**新增列，仅改计算。

### 3.2 `finance_transactions`（既有）— 异常标记字段

- `flag_transaction_anomaly` 的 apply 需一个「异常标记」落点。若既有表已有备注/标记列则复用；若无，本 Phase **最小增量**加一列 `anomalyFlag varchar(20)`（值如 `flagged|cleared`，默认 NULL，向后兼容）。实现期确认是否已有可用列，优先复用。

## 4. 关系（`finance/relations.ts` 增补）

```text
advisor_sessions  one→many  advisor_messages
advisor_messages  many→one  approvals (proposalId, 可空)
advisor_messages  many→one  advisor_sessions (sessionId)
approvals         many→one  advisor_messages (proposedBy, 可空)
smart_alerts      (软引用) rule_findings 经 ruleFindingRefs
cash_flow_forecasts / alert_preferences / approvals —— 仅 userId 作用域，无强外键到 findings（findings 可被覆盖/删除，引用存 jsonb 快照）
```

> 设计取舍：`citedFindings` / `ruleFindingRefs` / `ruleValidation` **不**用 FK 指向 `finance_rule_findings`（findings 同期会被覆盖重算），改为 jsonb **快照引用**——保证「结论当时的依据」不可变、可追溯（SC-002），即使后续 findings 被重算也能回看当时的依据。

## 5. 状态转换

### 5.1 审批状态机（`finance_approvals.status`）

```text
proposed ──(规则校验通过)──► pending ──(用户批准)──► approved ──(apply+规则再校验)──► applied[终]
   │                            │
   │                            ├──(用户拒绝)──► rejected[终]
   │                            └──(expiresAt 超时)──► expired[终]
   └──(规则校验失败)──► rejected[终]
```

- **双校验**：proposed→pending 一次（gate），approved→applied 一次（defensive，防 TOCTOU）。
- **幂等**：对 `applied` 再次 apply 为 no-op（I8）。

### 5.2 预警状态（`finance_smart_alerts.status`）

```text
active ──(用户已读/确认)──► acknowledged ──(偏好静默/手动 dismiss)──► silenced
```
- 静默受 `finance_alert_preferences` 控制；silenced 仍可历史回看（不删）。

### 5.3 降级态（跨实体）

- 预测：`insufficientHistory=true`（I3）；顾问消息：`degraded=true`（I7）——均不阻塞，退化为模板/标记。

## 6. 不变量（测试锚点）

| ID | 不变量 | 验证位置 |
|----|--------|----------|
| **I1** | 所有数值结论（findings/forecast series/alert refs/message citations/approval validation）必须可追溯到规则/账目来源；jsonb 引用非空 | forecast/alert/message/approval 服务测试 |
| **I2** | 审批：仅 `approved` + apply 时规则再校验通过才 `applied`；未审批绝不落库 | approval.service 状态机测试 |
| **I3** | 预测是历史输入的纯函数（同输入同输出）；`insufficientHistory` 时不产出数值预测点 | forecast 纯函数测试 |
| **I4** | 金额一律 `decimal(18,4)`（字符串/整数分），禁浮点 | money 工具 + 序列化测试 |
| **I5** | 所有表 `userId` 作用域隔离；跨用户读写 100% 拒绝（401/403） | repository 隔离测试 |
| **I6** | 预警幂等：`(userId,kind,period)` 唯一，重算覆盖不堆积 | alert 生成测试 |
| **I7** | LLM 失败 → 顾问消息 `degraded=true` + 模板文本；关键结论不丢失（SC-005） | advisor.service 降级测试 |
| **I8** | 审批 apply 幂等：`applied` 终态，重复 apply no-op；改账目动作走既有 `ledger.service` 平衡校验（不破坏 Phase 0 不变量） | approval.service + ledger 集成测试 |

## 7. 迁移

- `pnpm drizzle-kit generate` 产出增量迁移：新增 6 表 + `transactions.anomaly_flag`（若需）+ 索引/唯一约束。
- 不含数据回填（新表为空启动）；findings 趋势指标在首次报告/预警生成时自然写入。
- 健康分完善为代码变更，无迁移。

## 8. 影响面速查（实现阶段参照）

| 既有资产 | 变更类型 | 说明 |
|----------|----------|------|
| `rules-engine.service.ts` | 扩展（代码） | +趋势规则、补 `investmentRate`/`cashflow` 维度 |
| `report.service.ts` / AI SDK | 复用 | 顾问 prompt 克隆报告红线系统 prompt |
| `chat-context-trimmer.ts` | 复用 | 顾问会话上下文裁剪 |
| `net-worth.service.ts` `snapshotRange` | 复用（只读） | 预测历史输入 |
| `sumAmountByType` / `getPeriodMetrics` | 复用（只读） | 月度现金流序列 |
| `report.repository` `listReports` + `finding.repository` | 复用（只读） | 趋势对比时序来源 |
| `ledger.service` | 复用 | 审批 `create_transaction` apply 落库点（走平衡校验） |
| `database/schema/finance/index.ts` | barrel 增 6 表 | |
| `database/schema/finance/relations.ts` | 增 session/message/approval 关系 | |
| `features/finance/api.ts` + `hooks/use-finance.ts` | 增 DTO/方法/hooks | forecast/alert/advisor/approval |
