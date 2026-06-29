/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  date,
  decimal,
  jsonb,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * 净资产日快照 —— 曲线数据源（每用户每日一行）。
 *
 * 由 accounts.balance 推导（research R1）：total_assets = Σ资产类余额、
 * total_liabilities = Σcredit 欠款、net_worth = 差。`UNIQUE(user_id, date)`。
 * 任意交易增/改/删后重算 [occurredAt 当日 .. today] 区间（research R2/R10）。
 */
export const netWorthSnapshots = pgTable(
  'finance_net_worth_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
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
    /** 按账户类型的分项明细，如 { cash, savings, credit, investment, real_asset }（金额字符串）。 */
    breakdown: jsonb('breakdown').$type<Record<string, string>>().default({}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('finance_net_worth_user_date_unique').on(t.userId, t.date)],
);

export type NetWorthSnapshotItem = typeof netWorthSnapshots.$inferSelect;
export type NewNetWorthSnapshot = typeof netWorthSnapshots.$inferInsert;
