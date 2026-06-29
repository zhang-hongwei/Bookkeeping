# Data Model: 家庭财务 (Phase 4)

**Feature**: 005-family-finance · **Date**: 2026-06-29 · **Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

> Phase 1 产出。本文定义 Phase 4 的**领域模型增量**：3 张新表 + 2 处既有表改列，沿用 finance 域 Drizzle 约定（`text` userId 无 FK、`uuid` PK `defaultRandom`、`timestamp` 内联默认、`varchar+$type` 枚举、**不使用 pgEnum**）。命名见 `src/database/schema/finance/`。

---

## 1. 实体关系总览

```
finance_families (家庭)
  │ 1
  │
  │ ∞                          ∞ finance_family_net_worth_snapshots
  finance_family_members ───────────────────────────────────────────
  (成员关系, 含自动 joint 行)            (家庭净资产日快照, family_id+date UNIQUE)
      │ userId (text, 可空)
      │
      │ memberId (FK, SET NULL)
      ▼
  finance_transactions.memberId  ← 新增列（归属维度）
  finance_accounts.visibility    ← 新增列（共享/隐私）
```

**两套正交口径（决策 4，去重根基）**：
- **净资产**：按账号 `userId`(owner) 聚合。家庭净资产 = Σ 成员**共享**账号余额。
- **收支画像**：按交易 `memberId` 聚合。与 owner 无关。

---

## 2. 新增表

### 2.1 `finance_families` — 家庭聚合单位

文件：`src/database/schema/finance/families.ts`

| 列 | Drizzle 类型 | 说明 |
|----|--------------|------|
| `id` | `uuid('id').primaryKey().defaultRandom().notNull()` | |
| `name` | `text('name').notNull()` | 家庭名称，如「张家」 |
| `createdByUserId` | `text('created_by_user_id').notNull()` | 创建者（text，Supabase userId，无 FK） |
| `defaultCurrency` | `varchar('default_currency', { length: 8 }).default('CNY').notNull()` | 单币种（与全域一致） |
| `createdAt` | `timestamp('created_at').defaultNow().notNull()` | |
| `updatedAt` | `timestamp('updated_at').defaultNow().notNull()` | |

**索引**：`finance_families_created_by_idx` on (`createdByUserId`)。

**导出**：`families` table；`insertFamilySchema`/`selectFamilySchema`；`type FamilyItem`、`type NewFamily`。

**不变量**：
- 创建家庭的事务内**自动插入**一条 `role='joint'` 的成员行（见 2.2）。
- 创建者同步成为 `role='self'` 成员（`status='active'`）。

---

### 2.2 `finance_family_members` — 家庭成员关系

文件：`src/database/schema/finance/families.ts`（同文件，内聚）

| 列 | Drizzle 类型 | 说明 |
|----|--------------|------|
| `id` | `uuid('id').primaryKey().defaultRandom().notNull()` | **归属锚点**（transactions.memberId 指向它） |
| `familyId` | `uuid('family_id').references(() => families.id, { onDelete: 'cascade' }).notNull()` | |
| `userId` | `text('user_id')` | **可空**：NULL = 预占槽位（未注册家人）或 joint 行 |
| `displayName` | `text('display_name').notNull()` | 展示名「伴侣/妈妈/家庭·共同」，userId 为空时必显 |
| `role` | `varchar('role', { length: 20 }).$type<FamilyMemberRole>().notNull()` | `self` / `partner` / `child` / `parent` / `other` / `joint` |
| `shareMode` | `varchar('share_mode', { length: 16 }).$type<ShareMode>().default('shared').notNull()` | 成员默认共享倾向（决策 3） |
| `status` | `varchar('status', { length: 16 }).$type<MemberStatus>().default('active').notNull()` | `active` / `left` |
| `defaultView` | `varchar('default_view', { length: 12 }).$type<DefaultView>().default('personal').notNull()` | 决策 8 |
| `joinedAt` | `timestamp('joined_at').defaultNow().notNull()` | |
| `leftAt` | `timestamp('left_at')` | 退出时间（软删除，决策 6） |
| `createdAt` | `timestamp('created_at').defaultNow().notNull()` | |
| `updatedAt` | `timestamp('updated_at').defaultNow().notNull()` | |

**索引**：
- `finance_family_members_family_status_idx` on (`familyId`, `status`) — 成员列表/鉴权热路径。
- `finance_family_members_user_idx` on (`userId`) — 「我的家庭」查询（userId 非空时）。
- `finance_family_members_family_role_unique` **unique** on (`familyId`, `role`) **仅当 role='self' 或 'joint'**：用部分唯一索引保证每家庭恰一个 self、一个 joint。（实现：`uniqueIndex(...).on(familyId, role).where(role in ('self','joint'))` —— Drizzle 用 `where`，Postgres 部分索引。）

**约束（应用层 + DB）**：
- 每家庭**恰一个** `role='self'`（创建者）与**恰一个** `role='joint'`（自动生成，不可删）。
- `role in ('self','joint')` 时 `userId` 语义：self 必为创建者 userId；joint 必为 NULL。
- 同一 `userId` 在**同一家庭**只能有一条 `status='active'` 行（业务层校验，避免重复加入）。
- 退出：`status='left'` + `leftAt`，不删行（保留历史归属引用）。

**导出**：`familyMembers` table；`insertFamilyMemberSchema`/`selectFamilyMemberSchema`；`type FamilyMemberItem`、`type NewFamilyMember`。

**枚举常量**（导出 `as const` 数组 + 类型，不用 pgEnum）：
```ts
export const FAMILY_MEMBER_ROLES = ['self', 'partner', 'child', 'parent', 'other', 'joint'] as const;
export type FamilyMemberRole = (typeof FAMILY_MEMBER_ROLES)[number];
export const SHARE_MODES = ['shared', 'private_by_default'] as const;
export type ShareMode = (typeof SHARE_MODES)[number];
export const MEMBER_STATUSES = ['active', 'left'] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];
export const DEFAULT_VIEWS = ['personal', 'family'] as const;
export type DefaultView = (typeof DEFAULT_VIEWS)[number];
```

---

### 2.3 `finance_family_net_worth_snapshots` — 家庭净资产日快照

文件：`src/database/schema/finance/family-snapshots.ts`（镜像 Phase 1 的 `net-worth-snapshots.ts` 结构）

| 列 | Drizzle 类型 | 说明 |
|----|--------------|------|
| `id` | `uuid('id').primaryKey().defaultRandom().notNull()` | |
| `familyId` | `uuid('family_id').references(() => families.id, { onDelete: 'cascade' }).notNull()` | |
| `date` | `date('date').notNull()` | |
| `totalAssets` | `decimal('total_assets', { precision: 18, scale: 2 }).default('0').notNull()` | Σ 成员共享资产 |
| `totalLiabilities` | `decimal('total_liabilities', { precision: 18, scale: 2 }).default('0').notNull()` | Σ 成员共享负债 |
| `netWorth` | `decimal('net_worth', { precision: 18, scale: 2 }).default('0').notNull()` | totalAssets − totalLiabilities |
| `memberBreakdown` | `jsonb('member_breakdown').$type<Record<string, string>>().default({}).notNull()` | `{ [memberId]: netWorth }`，支持按成员拆分曲线 |
| `createdAt` | `timestamp('created_at').defaultNow().notNull()` | |
| `updatedAt` | `timestamp('updated_at').defaultNow().notNull()` | |

**索引**：`finance_family_nw_family_date_unique` **unique** on (`familyId`, `date`)。

**导出**：`familyNetWorthSnapshots` table；`type FamilyNetWorthSnapshotItem`、`type NewFamilyNetWorthSnapshot`。

**维护语义**：值 = Σ 各 active 成员该日**共享账号**净资产（决策 2）。刷新挂在个人 `refreshSnapshots` 之后、best-effort（决策见 research 决策 2/11）。

---

## 3. 既有表改列（增量、向后兼容）

### 3.1 `finance_transactions` 增 `memberId`

文件：`src/database/schema/finance/transactions.ts`

| 新列 | 类型 | 说明 |
|------|------|------|
| `memberId` | `uuid('member_id').references(() => familyMembers.id, { onDelete: 'set null' })` | **可空**。归属维度（谁花/谁赚）。NULL = 无家庭归属 |

- `ON DELETE SET NULL`：极端情况下成员行被删时保留交易（但决策 6 软删除，正常不触发）。
- 向后兼容：Phase 0–3 历史交易 memberId 为 NULL，语义 = 个人/未归属。
- `CreateTransactionInput`（`ledger.service.ts:59`）增 `memberId?: string`，透传至插入（`ledger.service.ts:213`）。
- **不**在 entries 上加 memberId（继承自 transaction）。

### 3.2 `finance_accounts` 增 `visibility`

文件：`src/database/schema/finance/accounts.ts`

| 新列 | 类型 | 说明 |
|------|------|------|
| `visibility` | `varchar('visibility', { length: 12 }).$type<AccountVisibility>().default('shared').notNull()` | `shared` / `private` |

```ts
export const ACCOUNT_VISIBILITIES = ['shared', 'private'] as const;
export type AccountVisibility = (typeof ACCOUNT_VISIBILITIES)[number];
```

- 默认 `shared`（决策 3），家庭聚合**只对 shared 求和**（SC-002 由构造保证）。
- 私有账号：家庭视图不可见、不并入家庭净资产；个人视图照常。
- 账号更新 API（`accounts/[id]/route.ts` PATCH）接受 `visibility` 字段。

---

## 4. 关系（`finance/relations.ts` 增补）

```ts
export const familiesRelations = relations(families, ({ many }) => ({
  members: many(familyMembers),
  netWorthSnapshots: many(familyNetWorthSnapshots),
}));

export const familyMembersRelations = relations(familyMembers, ({ one, many }) => ({
  family: one(families, { fields: [familyMembers.familyId], references: [families.id] }),
  attributedTransactions: many(transactions), // via transactions.memberId
}));

export const familyNetWorthSnapshotsRelations = relations(familyNetWorthSnapshots, ({ one }) => ({
  family: one(families, { fields: [familyNetWorthSnapshots.familyId], references: [families.id] }),
}));

// transactions 增一条：
// attributedMember: one(familyMembers, { fields: [transactions.memberId], references: [familyMembers.id] })
```

`finance/index.ts` barrel 增 `export * from './families'` 与 `export * from './family-snapshots'`。

---

## 5. 状态转换

### 5.1 成员状态机
```
(invite) ──► active ──leave──► left ──rejoin──► active
                │
              (创建时 self/joint 直接 active)
```
- `left` → `active`（重新加入）：清 `leftAt`，可选保留原 displayName/role。
- `joint` 行**不可** left/delete（自动生成、系统持有）。

### 5.2 账号可见性
```
shared ⇄ private （用户随时切换；切换触发家庭快照刷新）
```

### 5.3 交易归属
```
memberId: NULL ⇄ <memberId>（含 joint）；编辑交易可改归属
```

---

## 6. 不变量（I1–I7，测试锚点）

- **I1（家庭净资产可加）**：`familyNetWorth(f) == Σ_{m∈active(f)} memberSharedNetWorth(m)`（SC-001）。
- **I2（隐私排除）**：家庭净资产/曲线/画像**从不**包含任何 `visibility='private'` 账号的数据（SC-002）。
- **I3（越权拒绝）**：非 active 成员访问家庭端点 → 403（SC-003）。
- **I4（退出隔离）**：`status='left'` 成员不再出现在家庭聚合；其个人数据完整；历史家庭快照保留（SC-004）。
- **I5（无双计）**：家庭净资产按 accountId 去重求和，每账号计一次（SC-009）。
- **I6（joint 不入个人画像）**：`memberId=joint` 的交易计入家庭合计、不计入任何个人画像。
- **I7（复式平衡不破坏）**：新增 memberId/visibility 不影响 `Σdebit==Σcredit` 与账号余额原子更新（沿用 Phase 0 不变量）。
- **I8（金额精度）**：所有金额 `decimal(18,2)`，禁浮点（沿用全域）。

---

## 7. 迁移

- 工具：`pnpm db:generate`（drizzle-kit），输出 `src/database/migrations/`，dialect postgresql、strict。
- 变更：3 新表 + transactions 加 `member_id`（nullable，FK set null）+ accounts 加 `visibility`（default 'shared'）+ 5 个索引 + relations。
- 迁移为**纯增量、可逆**（新列可空/有默认；新表无历史数据依赖）。
- 应用顺序：先建 `families` → `family_members`（FK 依赖 families）→ `family_net_worth_snapshots` → 改 transactions/accounts。
- 校验：`pnpm type-check` 通过；`pnpm test --run --silent='passed-only' 'tests/finance/family'` 全绿。

---

## 8. 影响面速查（实现阶段参照）

| 层 | 新增 | 改动 |
|----|------|------|
| schema | `families.ts`, `family-snapshots.ts` | `transactions.ts`(+memberId), `accounts.ts`(+visibility), `relations.ts`, `finance/index.ts` |
| repository | `family.repository.ts`, `family-net-worth.repository.ts` | — |
| service | `family.service.ts`, `family-net-worth.service.ts`, `family-attribution.service.ts` | `ledger.service.ts`(memberId 透传+家庭快照刷新), `net-worth.service.ts`(刷新钩子扩展), `rules-engine.service.ts`(家庭口径输入) |
| api `_lib` | `family-auth.ts`(requireFamilyMembership), `ShareScopeError` | `validation.ts`(family schemas), `serialize.ts`(family DTOs) |
| api routes | `families/`, `families/[id]/`, `families/[id]/members/`, `families/[id]/net-worth/`, `…/curve/`, `…/members/[mid]/profile/` | `accounts/[id]`(PATCH visibility) |
| features/UI | `features/family/`(设置/成员/视图切换/家庭仪表盘/成员画像) | 个人仪表盘增视图切换 |
| tests | `tests/finance/family-*.test.ts` | 既有 ledger/net-worth 测试补 memberId/visibility 用例 |
