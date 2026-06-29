# Quickstart — 资产/负债完整化 (Phase 2)

> Phase 2 输出：开发与运行指引。面向实现者。**前置**：Phase 0（复式记账核心）+ Phase 1（净资产快照/曲线）已实现并达标（账目平衡、转账不改净资产、净资产曲线与账目一致）。

## 前置环境（沿用 Phase 0/1）

- Node.js ≥ 20、pnpm、PostgreSQL（本地或 Neon）。
- Phase 0/1 已实现：`src/database/schema/finance/*`（accounts/categories/transactions+entries/bill-imports/net-worth-snapshots/rule-findings/ai-reports）、`balance.service`、`ledger.service`、`net-worth.service`、系统权益账户 `__income`/`__expense` 已 seed。
- 认证已迁移至 **Supabase Auth**（`@supabase/ssr` 会话 cookie，`src/app/api/finance/_lib/auth.ts` 的 `requireUserId`）。

## 1. 安装依赖

```bash
pnpm install
```

Phase 2 复用既有依赖（Drizzle、Zod、MUI v7、TanStack Query、Zustand、recharts、Supabase Auth），**无需新增主依赖**。

## 2. 环境变量

在 `.env.local` 基础上（Phase 0/1 已有），确保：

```bash
# Phase 0/1 既有
DATABASE_URL=postgres://...           # Neon/本地 PG
NEXT_PUBLIC_SUPABASE_URL=...          # Supabase Auth（已取代 Clerk）
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...         # 服务端客户端
```

Phase 2 为纯领域增量（资产/负债明细 + 复式还款/估值/处置），不引入新的外部服务依赖。

## 3. 数据库迁移（Phase 2 schema 增量）

新增 `finance_asset_details` / `finance_liability_details` 两表，扩展 `accounts.type` 枚举（+4 贷款类型）、`transactions.type` 枚举（+repayment/revaluation/disposal）、`transactions` 加 `principal_amount`/`interest_amount` 列、新增 `__revaluation` 系统权益账户：

```bash
pnpm db:generate     # 生成增量迁移
pnpm db:migrate      # 应用迁移
pnpm db:studio       # 检查表结构
```

**注意**：
- 贷款/交易类型若 Phase 0/1 用 `varchar + $type<>`（而非 DB 枚举），迁移仅需新增类型常量、无 ALTER 枚举；确认实际 schema 后决定迁移内容。
- `__revaluation` 系统权益账户由 `ensureSystemEquityAccounts()` 幂等创建（应用层 seed），无需迁移脚本硬插。
- `finance_asset_details`/`finance_liability_details` 与 `finance_accounts` 1:1（`account_id UNIQUE`，`onDelete: cascade`）。

## 4. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3000`，进入财务仪表盘验证资产/负债登记、还款、流动性视图。

## 5. 验证核心不变式（最重要）

针对 Phase 2 的 SC，重点测试（金额走「分」整数，纯函数优先单测）：

```bash
pnpm test --run --silent='passed-only' 'finance'
```

关键测试用例（必须通过）：
- **还款正确性（SC-001）**：一笔房贷还款（principal 3000 + interest 2000）后，剩余负债 `−3000`、现金 `−5000`、净资产 `−2000`（仅利息改变净资产）、资产端不变；`Σdebit==Σcredit`。
- **估值点标记 + 视图切换（SC-002）**：登记房产后曲线标记为估值点；`?view=high` 过滤之，`?view=all` 含之，可一键切回。
- **净资产恒等（SC-003）**：`净资产 = 总资产 − 总负债`（含全部资产/负债，含新贷款类型）与逐项手动汇总一致；新贷款类型（mortgage 等）正确计入总负债。
- **信用卡账单（SC-004）**：设账单日/还款日后，本期账单/已还/待还按周期正确聚合；临近还款日 `dueSoon=true`。
- **快照刷新（SC-005）**：估值更新/还款/处置后，相关日期快照同步刷新，无历史旧值残留。
- **纯函数**：`recordRepayment` 分录构造、`getCreditCardPeriod` 周期聚合、流动性视图派生均为可单测的纯逻辑。

## 6. 类型检查与质量门

```bash
pnpm type-check      # tsc --noEmit
pnpm check           # type-check + lint（提交前必跑）
```

提交前：`pnpm type-check` + 相关文件 `pnpm test` + gitmoji 前缀 commit message（见 `.claude/rules/code-review.md`）。

## 7. 实现顺序建议（与后续 /speckit-tasks 对齐）

1. **schema 增量**：`accounts.ts`（+贷款类型/`LIABILITY_ACCOUNT_TYPES`/`__revaluation`）→ `transactions.ts`（+类型/拆分列）→ `asset-details.ts` → `liability-details.ts` → `relations.ts` → `index.ts` barrel → 迁移。
2. **`net-worth.service` 改造**：负债识别 `credit` → `LIABILITY_ACCOUNT_TYPES`（**先做**，否则后续净资产全部失真）；+ 流动性视图派生。
3. **repositories**：`asset-detail.repository` / `liability-detail.repository`（scoped，沿用 `FinanceRepository` 基座）。
4. **`ledger.service` 扩展**：`ensureSystemEquityAccounts` +`revaluation`；`recordRepayment`（3 腿 + 更新 `paidAmount` + `refreshSnapshots`）。
5. **`asset.service`**：register/update、`revalueAsset`、`disposeAsset`（均复式 + 刷新快照）。
6. **`liability.service`**：register/update、`getCreditCardPeriod`（账单聚合 + 还款提示）。
7. **API routes**：assets（GET/POST/PATCH/revalue/dispose）、liabilities（GET/POST/PATCH/repay/billing）、net-worth `?view`；`_lib/validation.ts` 加对应 Zod schema + 枚举扩展。
8. **UI**：`AssetManager`（登记/列表 + 置信度标记）、`LiabilityManager`（贷款明细 + 信用卡账单 + 还款入口）、`NetWorthDashboard` 扩展（流动性切换 + 估值点标记）；`api.ts`/`use-finance.ts` 加 DTO 与 hooks。

## 8. 关键风险确认项（实现前）

- Phase 0/1 是否已实现并达标（**硬前置**，research R9）。
- `net-worth.service` 改造的影响面：负债识别扩展后，需回归 Phase 1 既有快照/曲线测试（确保 `credit` 行为不变、新类型正确计入）。
- 确认 `transactions`/`accounts` 的 `type` 是 DB 枚举还是 `varchar + $type<>`（决定迁移是 ALTER 枚举还是仅应用层常量）。
