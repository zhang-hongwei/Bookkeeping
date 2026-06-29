/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  decimal,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { financeAccounts } from './accounts';
import { INSTRUMENT_TYPES, type InstrumentType } from './instruments';

/** 定投频率。 */
export const DCA_FREQUENCIES = ['monthly', 'biweekly', 'weekly'] as const;
export type DcaFrequency = (typeof DCA_FREQUENCIES)[number];

/**
 * 定投计划（Phase 3，**仅配置/标记，不自动生成交易**，设计 §9 / research.md）。
 *
 * IRR 的真相源是 `finance_investment_trades`（实际买入时点与金额），而非本计划。
 * 本表仅用于「记录定投历史/计划」与 UI 展示。`active=false` 表示中断/暂停。
 */
export const financeDcaPlans = pgTable('finance_dca_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  instrumentCode: varchar('instrument_code', { length: 32 }).notNull(),
  instrumentType: varchar('instrument_type', { length: 16 })
    .$type<InstrumentType>()
    .notNull(),
  /** 每期金额。 */
  amount: decimal('amount', { precision: 18, scale: 2 }),
  frequency: varchar('frequency', { length: 16 })
    .$type<DcaFrequency>()
    .default('monthly')
    .notNull(),
  /** 周期内执行日（如月内 1–28 日）。 */
  dayOfPeriod: integer('day_of_period'),
  /** 扣款现金账户（set null：账户删除不影响计划记录）。 */
  cashAccountId: uuid('cash_account_id').references(() => financeAccounts.id, {
    onDelete: 'set null',
  }),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type DcaPlanItem = typeof financeDcaPlans.$inferSelect;
export type NewDcaPlan = typeof financeDcaPlans.$inferInsert;
