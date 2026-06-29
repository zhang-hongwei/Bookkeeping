/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  date,
  decimal,
  jsonb,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { financeFamilies } from './families';

/**
 * 家庭净资产日快照（Phase 4）—— 家庭合并曲线数据源（每家庭每日一行）。
 *
 * 值 = Σ 各 active 成员该日**共享账号**净资产（research.md 决策2）。
 * 隐私由构造保证：仅对 `visibility='shared'` 账号求和，私有账号天然排除（SC-002）。
 * `member_breakdown` 为 `{ [memberId]: netWorth }`，支持按成员拆分曲线。
 * 维护挂在个人 `refreshSnapshots` 钩子之后、best-effort（不阻塞记账）。
 */
export const financeFamilyNetWorthSnapshots = pgTable(
  'finance_family_net_worth_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    familyId: uuid('family_id')
      .references(() => financeFamilies.id, { onDelete: 'cascade' })
      .notNull(),
    date: date('date').notNull(),
    totalAssets: decimal('total_assets', { precision: 18, scale: 2 })
      .default('0')
      .notNull(),
    totalLiabilities: decimal('total_liabilities', { precision: 18, scale: 2 })
      .default('0')
      .notNull(),
    netWorth: decimal('net_worth', { precision: 18, scale: 2 })
      .default('0')
      .notNull(),
    /** `{ [memberId]: netWorth }`（金额字符串），用于按成员拆分曲线。 */
    memberBreakdown: jsonb('member_breakdown')
      .$type<Record<string, string>>()
      .default({})
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('finance_family_nw_family_date_unique').on(t.familyId, t.date),
  ],
);

export type FamilyNetWorthSnapshotItem =
  typeof financeFamilyNetWorthSnapshots.$inferSelect;
export type NewFamilyNetWorthSnapshot =
  typeof financeFamilyNetWorthSnapshots.$inferInsert;
