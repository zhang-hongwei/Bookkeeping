# Quickstart — AI 财富顾问深化 (Phase 6)

> Phase 1 产出。在 Phase 0–4 已建且达标的基础上，跑通 007 的端到端闭环：**现金流预测 → 智能预警 → 顾问对话（含审批闭环）→ 多期趋势 → 完善健康分**。设计依据见 [plan.md](./plan.md)、[research.md](./research.md)、[data-model.md](./data-model.md)、[contracts/api.md](./contracts/api.md)。

## 1. 前置环境（沿用 Phase 0–4）

- Node ≥ 20、pnpm、PostgreSQL（或 Neon serverless）
- Phase 0–4 已实现并迁移到位：复式账目、净资产快照、规则引擎、AI 报告、资产/负债、投资持仓、家庭（可选）
- `.env.local` 中 AI 相关变量已配（见 §3）

## 2. 安装依赖

无新增必需依赖——007 复用既有栈：
- **Vercel AI SDK**（`ai`、`@ai-sdk/openai`，报告/顾问表达层，Phase 1 已装）
- Drizzle / MUI v7 / TanStack Query 5 / Zod 4 / Vitest（均已装）

若实现期选择流式顾问对话，确认 `ai` 的 `streamText` 已可用（Phase 1 `src/app/api/chat/route.ts` 已在用，无需新增）。

```bash
pnpm install
```

## 3. 环境变量（在 Phase 0–4 `.env.local` 基础上）

```bash
# 既有（必须，沿用 Phase 1）
OPENAI_BASE_URL=...        # 兼容 OpenAI 协议的端点
OPENAI_AUTH_TOKEN=...
OPENAI_MODEL=...           # 顾问/报告表达层模型

# 既有 Supabase（认证，沿用）
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

> 007 **无新增必需变量**。预测/预警为纯函数（决策 2），不需要外部模型；LLM 仅用于表达层。

## 4. 数据库迁移（Phase 6 schema 增量）

新增 6 张表 + 可能的 `transactions.anomaly_flag` 列（实现期按既有列情况决定，优先复用）。

```bash
pnpm drizzle-kit generate   # 产出增量迁移：forecast/alert/preference/advisor_session/advisor_message/approval
pnpm drizzle-kit migrate    # 应用到数据库
```

迁移要点：
- 唯一约束：`forecast(userId,targetMonth)`、`alert(userId,kind,period)`、`alert_preference(userId,kind)`。
- 无数据回填（新表空启动）。

## 5. 运行开发环境

```bash
pnpm dev
```

## 6. 端到端冒烟（手动验证 SC-001..SC-005）

> 前置：当前登录用户已有 ≥ `MIN_HISTORY_MONTHS`（默认 3）个月的历史收支 + 至少 1 份月度报告。

1. **现金流预测（FR-001 / SC-001）**：`GET /api/finance/forecasts?months=3` → 返回 `points[]` 带区间 + `emergencyShortfallMonth`；响应含 `disclaimer` 与 `sourceRefs`。
2. **历史不足降级（SC-005）**：新用户（< 3 月数据）→ `insufficientHistory=true`、`points=[]`、200。
3. **智能预警（FR-002）**：触发应急金不足场景 → `GET /api/finance/alerts?status=active` 出现 `emergency_shortfall`，`ruleFindingRefs` 非空。
4. **预警静默（FR-008）**：`PATCH /api/finance/alert-preferences { kind:'emergency_shortfall', muted:true }` → 该 kind 不再进 active 列表。
5. **顾问对话（FR-003 / SC-002）**：`POST /api/finance/advisor/sessions` → `POST .../messages { content:'储蓄率怎么提' }` → 回答中数字能在 `citedFindings` 找到来源。
6. **审批闭环（FR-004 / SC-003）**：顾问提议高风险动作 → 返回 `proposalId`（`status=proposed`）；未经 §4.3 批准 + §4.4 apply，账目**无变化**；批准并 apply 后落库；重复 apply 返回当前态（幂等）。
7. **LLM 降级（SC-005）**：临时让 `OPENAI_AUTH_TOKEN` 失效 → 顾问消息 `degraded=true` + 模板文本，200 返回。
8. **多期趋势（FR-005 / SC-004）**：有多期报告后 `GET /api/finance/trends?metric=savings_rate,score` → 时序与各期报告结论一致。
9. **健康分完善（FR-006）**：`GET /api/finance/health-score` → `investmentRate` 维度有值（不再 `await_phase3`）、`cashflow` 维度为方差评分。

## 7. 测试

```bash
# 仅跑 007 相关（切勿跑全量，约 10 分钟）
pnpm test --run --silent='passed-only' 'tests/finance/forecast'
pnpm test --run --silent='passed-only' 'tests/finance/alert'
pnpm test --run --silent='passed-only' 'tests/finance/approval'
pnpm test --run --silent='passed-only' 'tests/finance/advisor'
```

重点测试锚点（data-model.md §6 不变量 I1–I8）：
- 预测纯函数可复现（I3）；历史不足降级（SC-005）。
- 预警幂等 `(userId,kind,period)`（I6）；`ruleFindingRefs` 非空（I1）。
- 审批状态机：未审批不落库（I2）、apply 幂等（I8）、改账目动作走 `ledger.service` 平衡校验（不破坏 Phase 0 不变量）。
- 顾问降级 `degraded=true`（I7）、`citedFindings` 可追溯（I1）。

> 记忆提示：`pnpm type-check` 基线即红（约 340 个遗留错误）；007 只对**自己新增/修改的文件**负责，不背遗留债。

## 8. 类型与质量门禁（提交前）

```bash
pnpm type-check              # 仅关注 007 相关文件的新增错误
pnpm test --run --silent='passed-only' 'tests/finance/[007-pattern]'
```

## 9. 实现顺序建议（与后续 tasks.md 对齐）

1. **schema + 迁移**：6 张新表 + 索引（data-model.md §2）。
2. **规则引擎扩展**：趋势规则（决策 10）+ 健康分补全（决策 12）——纯函数，可先行单测。
3. **预测服务**：纯函数 + 缓存表 + 路由（§1）。
4. **预警服务 + 偏好**：生成/幂等/静默 + 路由（§2）。
5. **趋势服务**：纯函数聚合 + 路由（§6）。
6. **审批管道**：表 + 状态机 + kind 校验器/apply + 路由（§4）——是顾问高风险动作的前置依赖。
7. **顾问服务**：会话/消息表 + 双层调用 + 降级 + 提议串联 + 路由（§3）。
8. **前端**：预测/预警/顾问对话/审批/趋势 UI（`features/finance/components`）。

## 10. 参照文档

- 产品设计：`docs/product-design/ai-wealth-manager.md`（§5 双层架构、§6 健康分、§8 Phase 6、§9 合规）
- 规格：`specs/007-ai-wealth-advisor/spec.md`
- 计划：`specs/007-ai-wealth-advisor/plan.md`
- 既有参考实现：`src/services/finance/report.service.ts`（红线 prompt）、`rules-engine.service.ts`（事实层）
