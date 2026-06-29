# Quickstart — 投资管理 (Phase 3)

> Phase 3 输出：开发与运行指引。面向实现者。**前置**：Phase 0（复式记账核心）+ Phase 1（净资产快照/曲线）已实现并达标；Phase 2（003）**schema 已落库**（investment 账户/revaluation·disposal 交易类型/asset_details/`__revaluation` 桶），但其服务/路由/UI **尚未实现**——Phase 3 承接 `revaluation`/`disposal` 过账与 `__revaluation` 创建（research R8）。

## 前置环境（沿用 Phase 0/1/2）

- Node.js ≥ 20、pnpm、PostgreSQL（本地或 Neon）。
- Phase 0/1 已实现：`src/database/schema/finance/*`（accounts/categories/transactions+entries/bill-imports/net-worth-snapshots/rule-findings/ai-reports）、`balance.service`、`ledger.service`、`net-worth.service`、系统权益账户 `__income`/`__expense` 已 seed。
- Phase 2 schema 已落库：`finance_asset_details`/`finance_liability_details`、`investment`/贷款账户类型、`revaluation`/`disposal`/`repayment` 交易类型、`principal_amount`/`interest_amount` 列、`__revaluation` 权益桶（schema 定义层）。
- 认证已迁移至 **Supabase Auth**（`@supabase/ssr` 会话 cookie，`src/app/api/finance/_lib/auth.ts` 的 `requireUserId`）。

## 1. 安装依赖

```bash
pnpm install
```

Phase 3 复用既有依赖（Drizzle、Zod、MUI v7、TanStack Query、Zustand、recharts、Supabase Auth），**无需新增主依赖**。行情拉取用运行时 `fetch`（Node 20+ 内置），XIRR/盈亏为自实现纯函数。

## 2. 环境变量

在 `.env.local` 基础上（Phase 0/1/2 已有），可选配置行情源（默认走免费公开行情 HTTP 接口，无需 Key）：

```bash
# Phase 0/1/2 既有
DATABASE_URL=postgres://...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Phase 3 可选（行情 provider；默认免费公开源，可换付费源）
MARKET_DATA_PROVIDER=http-quote       # 默认；可扩展（如 tushare）
MARKET_DATA_TTL_SECONDS=300           # 现价缓存 TTL（盘中可缩短）
```

> 行情拉取为服务端行为（Node runtime 路由），无需暴露任何密钥到前端。

## 3. 数据库迁移（Phase 3 schema 增量）

新增 `finance_positions` / `finance_instruments` / `finance_investment_trades` / `finance_dca_plans`（可选）四表；`__revaluation` 系统权益账户由 `ensureSystemEquityAccounts()` 幂等创建（应用层 seed，无需迁移脚本硬插）：

```bash
pnpm db:generate     # 生成增量迁移
pnpm db:migrate      # 应用迁移
pnpm db:studio       # 检查表结构
```

**注意**：
- `finance_positions` 与 `finance_accounts`(investment) 1:1（`account_id UNIQUE`，`onDelete: cascade`）。
- `finance_investment_trades.transaction_id` 关联 `finance_transactions`（`onDelete: set null`，分录是真相源，语义层软关联）。
- `finance_instruments` 按 `(user_id, code)` 唯一；行情缓存按用户隔离（未来可优化为全局缓存）。
- 份额/单价/现价用 `numeric(18,6)`（金额仍 `numeric(18,2)`），避免精度误差。

## 4. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3000`，进入财务仪表盘验证持仓登记、买入/卖出、现价同步、定投 IRR、资产配置。

## 5. 验证核心不变式（最重要）

针对 Phase 3 的 SC，重点测试（金额走「分」整数、份额/价格高精度，纯函数优先单测）：

```bash
pnpm test --run --silent='passed-only' 'finance'
```

关键测试用例（必须通过）：
- **买入不变式（SC-001）**：「银行卡 −¥1,000 → 基金 +¥1,000」后，现金 `−1000`、持仓 `balance=+1000`（成本）、**净资产不变**、`quantity`/`costPrice` 正确；`Σdebit==Σcredit`。
- **现价同步（SC-003）**：现价更新后，`盈亏 = 市值 − 成本`、`盈亏率 = 盈亏/成本` 即时正确；持仓 `balance` 经 `revaluation` 改为新市值、净资产快照同步刷新、曲线不留旧值。
- **卖出盈亏（US1-AC2）**：部分卖出后 `quantity` 减少、`costPrice` 不变、`balance` 按比例减、`proceeds − bookValue` 如实计入已实现损益、净资产如实反映。
- **IRR（SC-002）**：给定一组定投买入（多笔不同时点）+ 当前市值，`computeXirr` 年化收益率与主流基金 IRR 计算器（天天基金定投收益）一致（允许末位差异）。
- **行情降级（SC-004）**：provider 失败/超时 → 返回 `MARKET_UNAVAILABLE` 提示手动输入；手动录价后 `priceSource='manual'`、`lastPriceAt` 正确，不展示虚假最新价。
- **集中度预警（SC-005）**：单一品种占比超阈值（如 60%）→ `rules-engine` 产出 `rule_finding`、`/allocation` 返回预警。
- **纯函数**：`computeXirr`、盈亏/盈亏率/加权成本、资产配置占比、`revaluation`/`disposal` 分录构造均为可单测的纯逻辑。

## 6. 类型检查与质量门

```bash
pnpm type-check      # tsc --noEmit
pnpm check           # type-check + lint（提交前必跑）
```

提交前：`pnpm type-check` + 相关文件 `pnpm test` + gitmoji 前缀 commit message（见 `.claude/rules/code-review.md`）。

## 7. 实现顺序建议（与后续 /speckit-tasks 对齐）

1. **schema 增量**：`positions.ts` → `instruments.ts` → `investment-trades.ts` → `dca-plans.ts`(可选) → `relations.ts` → `index.ts` barrel → 迁移。
2. **承接 Phase 2 过账（R8，先做）**：`ensureSystemEquityAccounts` +`__revaluation`；`ledger.service.buildEntries` 支持 `revaluation`(2腿)/`disposal`(3腿)；`_lib/validation.ts` 枚举补 `revaluation`/`disposal`。**否则卖出/现价同步无法成立**。
3. **纯函数（可先行单测）**：`irr.ts`（XIRR，含主流计算器 known-answer）、`pnl.ts`（盈亏/盈亏率/加权成本/配置占比）。
4. **repositories**：`position.repository` / `instrument.repository` / `investment-trade.repository`（scoped，沿用 `FinanceRepository` 基座）。
5. **`investment.service`**：registerPosition、buy、sell、dividend、revalue、getPerformance（均复式 + 更新持仓 + `refreshSnapshots`）。
6. **`market-data.service`**：provider 接口 + 默认 `HttpQuoteProvider` + 缓存(`finance_instruments`) + TTL/`is_stale` + 降级（FR-004）。
7. **API routes**：positions（GET/POST/PATCH/buy/sell/dividend/revalue/performance）、instruments（GET/POST/quote）、allocation；`_lib/validation.ts` 加对应 Zod schema + 投资交易 action 枚举。
8. **UI**：`PositionManager`（持仓列表 + 现价/市值/盈亏/来源标记）、`TradeForm`（买入/卖出/分红 + 费用/税）、`DcaOverview`（累计投入/市值/IRR）、`AllocationDashboard`（配置饼图 + 集中度预警）；`api.ts`/`use-finance.ts` 加 DTO 与 hooks。

## 8. 关键风险确认项（实现前）

- **Phase 2 服务未实现（R8，硬前置）**：`revaluation`/`disposal` 过账与 `__revaluation` 创建须先落地；确认 `ledger.service.buildEntries` 现状（仅 income/expense/transfer）后扩展，回归 Phase 0/1 既有转账/收支测试。
- **行情源稳定性（R3）**：具体 provider 端点/格式/限流需实现期实测；公开源（新浪/腾讯/东财）对 REITs/数字货币等覆盖不足时降级为手动输入（FR-004 已支持），不阻断交付。
- **份额/价格精度（R7）**：确认 `numeric(18,6)` 是否满足基金净值/份额精度，避免市值与成本对不上。
- **net-worth 无需改动**：`investment` 已计入资产、现价 `revaluation` 后 `refreshSnapshots` 自动反映市值，确认无需改 `net-worth.service`。
- **IRR 收敛性（R6）**：极端现金流（无正回收/多解）返回 `null` 并提示，不返回错误数值。
