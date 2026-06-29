# Quickstart — 家庭财务 (Phase 4)

**Feature**: 005-family-finance · **Date**: 2026-06-29 · **Spec**: [spec.md](./spec.md)

> Phase 1 输出：开发与运行指引，面向实现者。
> **前置**：Phase 0–3 已实现并达标——复式记账核心（账目平衡）、净资产闭环（snapshots）、资产/负债明细、投资管理（positions）。Phase 4 在同一 `finance` 域上做**增量扩展**（家庭/成员维度 + 共享可见性 + 成员归属）。

---

## 1. 前置环境（沿用 Phase 0–3）

- Node.js ≥ 20、pnpm、PostgreSQL（本地或 Neon）。
- 认证：**Supabase Auth**（finance 全域用 `@supabase/ssr`；`userId` = Supabase user id 字符串）。
- Phase 0–3 既有表/服务已就绪：`finance_accounts/transactions/entries/categories`、`finance_asset_details/liability_details`、`finance_positions/instruments/investment_trades`、`finance_net_worth_snapshots`、`balance.service`/`ledger.service`/`net-worth.service`。

## 2. 安装依赖

```bash
pnpm install
```

Phase 4 **无需新增主依赖**：复用 Drizzle、Zod、MUI v7、TanStack Query、Zustand、dayjs。家庭维度纯领域扩展，不引入新框架。

## 3. 环境变量（在 Phase 0–3 `.env.local` 基础上）

```bash
# 既有（必须）
DATABASE_URL=postgres://...          # 或 DATABASE_TEST_URL（NODE_ENV=test）
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...                   # 家庭报告 LLM 表达层（复用 Phase 1 规则引擎+LLM）

# Phase 4 无新增必需变量
```

## 4. 数据库迁移（Phase 4 schema 增量）

新增 3 表（`finance_families` / `finance_family_members` / `finance_family_net_worth_snapshots`）、改 2 列（`finance_transactions.member_id`、`finance_accounts.visibility`）+ 索引 + relations：

```bash
pnpm db:generate     # 生成增量迁移到 src/database/migrations/
pnpm db:migrate      # 应用迁移
pnpm db:studio       # 检查表结构（确认 family_members 的部分唯一索引、FK）
pnpm type-check      # 确认 schema 类型导出无错
```

迁移为纯增量、可逆（新列可空/有默认值；新表无历史数据依赖）。

## 5. 运行开发环境

```bash
pnpm dev             # Next.js 开发服务器（无 proxy 配置时仅起 Next）
```

家庭功能入口：登录后，若 `GET /api/finance/families` 返回空 → 显示「创建/加入家庭」；否则仪表盘顶部出现「个人 / 家庭」视图切换。

## 6. 端到端冒烟（手动验证 SC-001..SC-005）

> 用两个 Supabase 账号 A、B（或一个账号 + 一个预占槽位成员）。

1. **建家庭**：A 调 `POST /api/finance/families { name:"张家" }` → 返回 self + joint 成员行。
2. **加成员**：`POST .../families/[id]/members { userId:<B>, role:"partner", displayName:"伴侣" }`。
3. **各自记账**：A、B 各自建账号、录交易（确保账号 `visibility='shared'`）。
4. **验证合并（SC-001）**：`GET .../families/[id]/net-worth` → `netWorth == A.shared + B.shared`，`memberBreakdown` 拆分正确。
5. **验证隐私（SC-002）**：A 把某账号 `PATCH .../accounts/[id] { visibility:"private" }` → 该账号从家庭净资产/曲线消失，仅 A 个人视图可见。
6. **验证越权（SC-003）**：非成员 C 调 `GET .../families/[id]/net-worth` → **403 FORBIDDEN**。
7. **验证归属（FR-002/FR-004）**：交易标 `memberId=<B 的 member 行>` 或 joint → `GET .../members/[memberId]/profile` 画像正确；joint 不计入个人画像（I6）。
8. **验证退出（SC-004）**：B `DELETE .../members/[B memberId]` → B status='left'，家庭净资产不再含 B，B 个人数据完整，历史家庭快照保留。
9. **验证切换（SC-005）**：个人 ⇄ 家庭视图瞬时切换，无数据串扰。

## 7. 测试

```bash
# 仅跑家庭相关（切勿跑全量，约 10 分钟）
pnpm test --run --silent='passed-only' 'tests/finance/family'
pnpm test --run --silent='passed-only' 'tests/finance/ledger'   # memberId/visibility 用例
```

新增测试文件（遵循 `.claude/skills/testing`）：
- `tests/finance/family.service.test.ts` — 建家/加成员/退出/鉴权（I3/I4）。
- `tests/finance/family-net-worth.service.test.ts` — 合并=Σ、隐私排除、joint、双计=0（I1/I2/I5/I6）。
- `tests/finance/family-attribution.service.test.ts` — 成员画像、joint 不入个人。
- 既有 `ledger.service.test.ts` / `net-worth.service.test.ts` 补 `memberId` 透传、visibility 过滤、家庭快照刷新用例。

> 失败两次仍不过 → 停下求助（见 CLAUDE.md Testing 指引），勿继续猜测。

## 8. 类型与质量门禁（提交前）

```bash
pnpm type-check
pnpm test --run --silent='passed-only' 'tests/finance/family'
```

提交：gitmoji 前缀，例 `✨ feat(finance): 005 家庭财务 — 家庭/成员模型 + 合并净资产 + 共享可见性`。

## 9. 实现顺序建议（与 tasks.md 对齐）

1. schema + 迁移（data-model.md §2/§3）+ relations + barrel。
2. repository（family / family-net-worth）。
3. service：family.service → family-net-worth.service（复用 Phase 1 纯函数）→ family-attribution.service；改 ledger/net-worth 注入 memberId 与家庭快照刷新钩子。
4. `_lib`：family-auth（requireFamilyMembership + ShareScopeError）、validation（family schemas）、serialize（family DTOs）。
5. API routes（contracts/api.md §1–§6）。
6. UI（`features/family/`）：建家/成员管理、视图切换、家庭仪表盘 + 曲线、成员画像。
7. 测试 + 门禁。

## 10. 参照文档

- 规格与决策：[spec.md](./spec.md) · [research.md](./research.md)
- 设计：[data-model.md](./data-model.md) · [contracts/api.md](./contracts/api.md)
- 产品背景：`docs/product-design/ai-wealth-manager.md` §3.9 / Phase 4 / 第 9 章（信任优先）
- 既有约定：`.claude/project.md`、`.claude/skills/{frontend-dev,backend-dev,database-dev,testing}`
