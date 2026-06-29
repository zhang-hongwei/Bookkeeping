# Quickstart — 高级分析 (Phase 7)

**Feature**: 008-advanced-analytics · **Date**: 2026-06-29 · **Spec**: [spec.md](./spec.md)

> Phase 1 输出：开发与运行指引，面向实现者。
> **前置**：Phase 0–6 已实现并达标——复式记账核心、净资产闭环（snapshots）、资产/负债明细、投资管理（positions）、家庭维度（005）、预算/目标（006）。Phase 7 在同一 `finance` 域上做**增量扩展**（4 个确定性分析引擎 + 5 张新表）。

---

## 1. 前置环境（沿用 Phase 0–6）

- Node.js ≥ 20、pnpm、PostgreSQL（本地或 Neon）。
- 认证：**Supabase Auth**（finance 全域用 `@supabase/ssr`；`userId` = Supabase user id 字符串）。
- Phase 0–6 既有表/服务已就绪：
  - `finance_accounts/transactions/entries/categories`、`finance_net_worth_snapshots`、`finance_asset_details/liability_details`、`finance_positions/instruments/investment_trades`、`finance_families/family_members`、`finance_rule_findings`。
  - 服务：`balance.service`/`net-worth.service`（基线）、`investment.service`/`allocation`（组合输入）、`rules-engine.service`（双层架构范本）、`report.service`（LLM 解读层范本）、Phase 6 goals 服务（goalImpact 口径）。

## 2. 安装依赖

```bash
pnpm install
```

Phase 7 **无需新增主依赖**：复用 Drizzle、Zod、MUI v7、TanStack Query、Zustand、dayjs。分析引擎为纯 TypeScript 函数，不引入新框架。

## 3. 环境变量（在 Phase 0–6 `.env.local` 基础上）

```bash
# 既有（必须）
DATABASE_URL=postgres://...          # 或 DATABASE_TEST_URL（NODE_ENV=test）
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 既有（LLM 解读层；不可用时各 /interpret 返回空文本，结构化结果不受影响）
# 沿用 Phase 2 report.service 的 LLM 配置键
```

> 规则配置（个税 `taxRuleConfig`、组合 `targetBands`）以**版本化 JSON** 形式置于配置目录（实现时确定路径，如 `src/services/finance/config/`），不写进环境变量。

## 4. 数据库迁移

```bash
pnpm drizzle-kit generate            # 生成 5 张新表的 CREATE TABLE（纯新增、向后兼容）
pnpm drizzle-kit migrate             # 应用迁移
```

新增表（见 [data-model.md](./data-model.md)）：
`finance_scenarios`、`finance_scenario_projections`、`finance_tax_estimates`、`finance_retirement_simulations`、`finance_portfolio_hints`。无既有表改列，无数据回填。

## 5. 运行

```bash
pnpm dev                             # Next.js 开发服务
```

访问 Phase 7 面板（路由实现时确定，挂载于既有 finance 仪表盘）：
- What-if 情景模拟 / 个税估算 / 退休模拟 / 组合优化方向。

## 6. 类型检查与测试

```bash
pnpm type-check
```

测试（**始终带文件模式**，勿跑全量）：

```bash
# 纯函数引擎（确定性、可复现 —— 首选、必须齐全）
pnpm test --run --silent='passed-only' 'tests/finance/projection.engine.test.ts'
pnpm test --run --silent='passed-only' 'tests/finance/tax.engine.test.ts'
pnpm test --run --silent='passed-only' 'tests/finance/portfolio-hint.engine.test.ts'

# 服务层（取数 → 引擎 → 落表 集成）
pnpm test --run --silent='passed-only' 'tests/finance/scenario.service.test.ts'
pnpm test --run --silent='passed-only' 'tests/finance/tax.service.test.ts'
pnpm test --run --silent='passed-only' 'tests/finance/retirement.service.test.ts'
pnpm test --run --silent='passed-only' 'tests/finance/portfolio-hint.service.test.ts'
```

> 同一测试两次修复仍失败 → 停下求助（CLAUDE.md）。

### 引擎单测要点（对应 SC）
- **SC-001（what-if 可复现、与基线一致）**：同 `(snapshot, surplusProfile, assumptions)` 断言逐点 `netWorthDelta = scenario − baseline`（I3），且重算结果稳定。
- **SC-002（个税正确）**：固定输入下与权威计算器一致（允许末位差）；`separate`/`merged` 差额正确（I5）。
- **SC-003（退休标注不确定性）**：三点单调（I8）+ `disclaimers` 含不确定性文案（I9）。
- **SC-004（可追溯）**：落表行含 `engineVersion`/`assumptions`/`disclaimers`。
- **SC-005（降级不编造）**：数据不足 → `status='degraded'` + `missing[]`，无数值结论。

## 7. 实现顺序建议（供 `/speckit-tasks` 参考）

1. Schema ×5 + barrel + relations + 迁移。
2. 纯函数引擎 ×4（先引擎 + 单测，零幻觉、可复现）：
   `projection.engine`（what-if 基线/情景 diff + 退休长期投影）→ `tax.engine` → `portfolio-hint.engine`。
3. Service ×4（取数 → 引擎 → 落表 + 溯源/免责/降级）。
4. API ×4 组（含 `/interpret` 子资源 + LLM 零编造校验）。
5. Repository ×4。
6. 前端 ×4 面板 + hooks/api（结构化数字必渲染 + 免责强渲染）。
7. 集成测试 + 类型检查收尾。

## 8. 红线复检（每次改动）

- [ ] 任何数字都来自确定性引擎，LLM 仅解读（`/interpret` 出参无引擎外数字）。
- [ ] 全部分析带 `disclaimers`（税务另注「需以当期法规为准」）。
- [ ] 数据不足走 `degraded`，不编造。
- [ ] `userId` 仅来自会话；家庭视角经 `requireFamilyMembership`。
- [ ] 易变规则（个税/组合 band）走版本化配置 + `ruleVintage`/`targetBandsVersion`，不硬编码。
