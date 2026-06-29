# Finance — 复式记账核心地基 (Phase 0)

永远平衡的复式账本：账户管理、收支/转账记账、账单批量导入、自然语言记账。
核心硬约束：任何交易后 `Σdebit == Σcredit`，转账不改净资产（SC-001 / SC-002）。

## 架构分层

```
src/database/schema/finance/   Drizzle schema（accounts/categories/transactions+entries/bill-imports/relations）
src/repositories/finance/      数据访问（base + account/category/transaction），强制 userId 作用域
src/services/finance/          领域服务
  balance.service.ts           余额维护 + assertBalanced + recomputeBalance + verifyAll（不变式引擎）
  ledger.service.ts            记账/改/删（事务内原子写 entries + 更新 balance）
  account.service.ts           归档/恢复/带守卫删除（US2）
  import.service.ts            账单导入：解析→去重→preview→confirm（US3）
  nl-record.service.ts         自然语言→候选交易（AI SDK structured output，US4）
  import/parsers.ts            CSV 解析器注册表（Alipay/WeChat/Generic + 表头自动识别）
  money.ts                     金额「分」整数运算（禁浮点）
src/app/api/finance/           Route Handlers（全部 Supabase 认证，userId 取自会话）
src/features/finance/          UI（components / hooks / api 客户端）
```

## 复式记账模型

- 每笔交易展开为 ≥2 条 entries；不变式：同 transaction 内 `Σ(debit) == Σ(credit)`，每条 amount>0。
- 收入/支出的对腿写入**系统权益账户** `__income` / `__expense`（`type=equity`, `userId='__system__'`, `systemKey` 标记），
  使全套账目恒等式成立。系统账户不归属任何真实用户，用户不可见/不可写（userId 过滤天然排除）。
- 账户 `balance` 为物化列，在写 entries 的同一数据库事务内 `balance += signedDelta` 原子维护；
  `recomputeBalance(accountId)` 由 entries 重算用于校验与自愈（SC-007）。
- 资产类（cash/savings/investment/real_asset）借方正常余额；信用类 credit 贷方正常余额（余额体现为欠款）。

## 金额

一律 PostgreSQL `numeric(18,2)`，前端/API 用字符串收发；运算走 `toCents/fromCents` 整数「分」转换，禁浮点。

## 测试

```bash
# 纯单元（无需 DB，默认运行）
pnpm test --run finance

# 集成测试（需 PostgreSQL，finance_* 表已建）
FINANCE_INTEGRATION_TEST=1 pnpm test --run finance
# 测试库建表：node --env-file=.env scripts/init-finance.mjs（指向测试 DATABASE_URL）
```

覆盖：balance 不变式数学（SC-001/002/007）、CSV 解析（SC-004）、NL 候选映射（SC-005）、
导入去重（SC-006）、记账/改/删/账户管理集成。

## 数据库迁移

仓库 drizzle-kit journal 与现有 schema 不一致（`db:generate` 触发交互式 rename），
故 finance 表沿用幂等 `CREATE TABLE IF NOT EXISTS` 范式：

```bash
node --env-file=.env scripts/init-finance.mjs   # 建 finance_* 表 + 种子权益账户
```

## 与设计文档的偏差（实现记录）

- **ID**：用 `uuid().defaultRandom()`（沿用项目既有 `mealRecords` 约定），而非风格指南的 text 前缀。
  tasks T002 已记录此决策。
- **系统权益账户 userId**：data-model 原述 `user_id=NULL`；实现用 `userId='__system__'` 哨兵值，
  因 schema 中 `user_id` 为 `NOT NULL`。语义等价（全局共享、用户不可写），userId 过滤天然排除。
- **opening_balance**：作为账户起始值列（balance = opening + Σentries），不作为分录入账，
  与 balance.service.computeBalanceCents 一致。

## 接入注意

- finance API 使用 **Supabase Auth** 取会话（`requireUserId` → `createSupabaseServerClient` + `auth.getUser()`）。
  `src/middleware.ts` 已用 `updateSession` 刷新会话 cookie，并将 `/finance` 列入受保护路径（未登录跳 `/signin`）。
- 自然语言记账依赖 `OPENAI_BASE_URL` / `OPENAI_AUTH_TOKEN` / `OPENAI_MODEL`；未配置时返回 `candidate:null` + reason。
