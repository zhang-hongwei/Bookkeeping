# Quickstart — 复式记账核心地基 (Phase 0)

> Phase 1 输出：开发与运行指引。面向实现者。

## 前置环境

- Node.js（满足 Next.js 16 要求，≥ 20）
- pnpm
- PostgreSQL（本地 或 Neon；项目已用 `@neondatabase/serverless` + `pg`）

## 1. 安装依赖

```bash
pnpm install
```

实现前确认测试运行器（Technical Context 标注项）：

```bash
# 若 pnpm test 无对应 runner，补装：
pnpm add -D vitest
```

## 2. 环境变量

复制 `.env.example` → `.env.local`，确保含：

```bash
# 数据库（Neon 或本地 PG）
DATABASE_URL=postgres://...
# Clerk 认证
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
# AI（自然语言记账）
OPENAI_API_KEY=...
```

## 3. 数据库迁移

新增 `src/database/schemas/finance/*` 后，生成并应用迁移：

```bash
pnpm db:generate     # 生成迁移文件到 src/database/migrations
pnpm db:migrate      # 应用迁移
# 或开发期快速同步：pnpm db:push
pnpm db:studio       # Drizzle Studio 检查表结构
```

**Seed**：默认收支分类（餐饮/购物/…；工资/奖金/…）与系统权益账户 `__income`/`__expense` 需在迁移/seed 中建立。

## 4. 启动开发服务器

```bash
pnpm dev             # 仅 Next.js（无代理需求时）
# 或带代理（见 .claude/rules/proxy-server.md）：pnpm dev:proxy & pnpm dev:next
```

访问 `http://localhost:3000`，进入记账入口验证。

## 5. 验证核心不变式（最重要）

针对 SC-001 / SC-002 / SC-007，重点测试：

```bash
pnpm test --run --silent='passed-only' 'finance'
```

关键测试用例（必须通过）：
- 记录支出/收入/转账后 `Σdebit == Σcredit`、账户余额正确。
- **转账不改净资产**（资产总额前后相等）。
- 编辑/删除历史交易后，相关账户余额一次同步正确（`recomputeBalance` 自愈）。
- 重复导入同一账单 → `duplicate`，不产生重复交易。

## 6. 类型检查与质量门

提交前：

```bash
pnpm type-check      # tsc --noEmit
pnpm check           # type-check + lint
```

## 7. 实现顺序建议（与后续 /speckit-tasks 对齐）

1. schema：`accounts` → `categories` → `transactions`+`entries` → `bill_imports`+`rows`。
2. `balance.service`（余额维护 + `assertBalanced` + `recomputeBalance`）。
3. `ledger.service`（记账/改/删，事务内 + 平衡校验）。
4. API routes（accounts / categories / transactions）。
5. `import.service` + 导入 API（解析器 + 去重 + 预览/确认）。
6. `nl-record.service` + 自然语言 API（AI SDK structured output）。
7. UI（`features/finance`）：账户、记账、导入、明细。
