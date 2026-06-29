/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * 家庭财务（Phase 4）—— 家庭聚合单位 + 成员关系。
 *
 * 设计要点（research.md 决策1/5/6）：
 * - `userId` 沿用 finance 域「纯 text、无 FK」约定（Supabase userId 字符串）。
 * - `family_members.userId` **可空**：NULL 表示预占槽位（未注册家人，仅记账归属）或 joint 行。
 * - 每家庭自动生成一条 `role='joint'`（共同归属锚）与一条 `role='self'`（创建者）。
 * - 成员退出走软删除（status='left'），不删行，保留历史归属引用（SC-004）。
 *
 * 净资产与归属是两套正交口径（research.md 决策4）：
 * - 净资产按账号 owner 聚合；家庭净资产 = Σ 成员共享账号。
 * - 收支画像按 `transactions.member_id` 聚合（member_id 指向本表 family_members.id）。
 */

/** 成员角色。self=创建者、joint=系统生成的「共同」归属锚（不可删）、其余为家庭角色。 */
export const FAMILY_MEMBER_ROLES = [
  'self',
  'partner',
  'child',
  'parent',
  'other',
  'joint',
] as const;
export type FamilyMemberRole = (typeof FAMILY_MEMBER_ROLES)[number];

/** 成员默认共享倾向（决策3）。 */
export const SHARE_MODES = ['shared', 'private_by_default'] as const;
export type ShareMode = (typeof SHARE_MODES)[number];

/** 成员状态：active=在家庭中；left=已退出（软删除）。 */
export const MEMBER_STATUSES = ['active', 'left'] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

/** 成员默认着陆视图（决策8）。 */
export const DEFAULT_VIEWS = ['personal', 'family'] as const;
export type DefaultView = (typeof DEFAULT_VIEWS)[number];

/**
 * 家庭 —— 多成员的财务聚合单位。
 * `created_by_user_id` 为创建者（text，无 FK）。
 */
export const financeFamilies = pgTable(
  'finance_families',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    createdByUserId: text('created_by_user_id').notNull(),
    defaultCurrency: varchar('default_currency', { length: 8 })
      .default('CNY')
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('finance_families_created_by_idx').on(t.createdByUserId)],
);

/**
 * 家庭成员 —— 归属锚点（transactions.member_id 指向本表 id）。
 * `userId` 可空（预占槽位 / joint 行）。`displayName` 必填（userId 为空时仍需展示）。
 */
export const financeFamilyMembers = pgTable(
  'finance_family_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    familyId: uuid('family_id')
      .references(() => financeFamilies.id, { onDelete: 'cascade' })
      .notNull(),
    userId: text('user_id'),
    displayName: text('display_name').notNull(),
    role: varchar('role', { length: 20 })
      .$type<FamilyMemberRole>()
      .notNull(),
    shareMode: varchar('share_mode', { length: 16 })
      .$type<ShareMode>()
      .default('shared')
      .notNull(),
    status: varchar('status', { length: 16 })
      .$type<MemberStatus>()
      .default('active')
      .notNull(),
    defaultView: varchar('default_view', { length: 12 })
      .$type<DefaultView>()
      .default('personal')
      .notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    leftAt: timestamp('left_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('finance_family_members_family_status_idx').on(t.familyId, t.status),
    index('finance_family_members_user_idx').on(t.userId),
    // 部分唯一索引：每家庭恰一个 self、一个 joint（partner/child/parent/other 可多）。
    uniqueIndex('finance_family_members_family_role_unique')
      .on(t.familyId, t.role)
      .where(sql`role IN ('self', 'joint')`),
  ],
);

export type FamilyItem = typeof financeFamilies.$inferSelect;
export type NewFamily = typeof financeFamilies.$inferInsert;
export type FamilyMemberItem = typeof financeFamilyMembers.$inferSelect;
export type NewFamilyMember = typeof financeFamilyMembers.$inferInsert;
