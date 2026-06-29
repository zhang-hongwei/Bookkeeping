/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  decimal,
  date,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { financeAccounts } from './accounts';

/** 负债种类（区分信用卡与各类贷款）。 */
export const LIABILITY_KINDS = [
  'credit',
  'mortgage',
  'car_loan',
  'consumer_loan',
  'borrowing',
] as const;
export type LiabilityKind = (typeof LIABILITY_KINDS)[number];

/**
 * 负债明细（1:1 挂 credit / 贷款账户）—— Phase 2。
 *
 * 负债「剩余本金 / 当前欠款」= 关联账户 `finance_accounts.balance`（真相源）。
 * 本表承载贷款参数（本金/利率/月供/到期）+ 已还本金累计 + 信用卡账单周期，
 * 不冗余存「剩余本金」（避免与 balance 双写漂移，见 research R8）。
 * 无固定还款的借款（如亲友借款）：interestRate/monthlyPayment/dueDate 可为 null。
 */
export const financeLiabilityDetails = pgTable(
  'finance_liability_details',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    /** 1:1 关联账户（credit / mortgage / car_loan / consumer_loan / borrowing）。 */
    accountId: uuid('account_id')
      .references(() => financeAccounts.id, { onDelete: 'cascade' })
      .notNull(),
    kind: varchar('kind', { length: 32 })
      .$type<LiabilityKind>()
      .notNull(),
    /** 原始本金（建账时定，不变；credit 可为 0）。 */
    principal: decimal('principal', { precision: 18, scale: 2 })
      .default('0')
      .notNull(),
    /** 年利率（小数，如 0.0450 = 4.5%）；0/无利率借款可为 null。 */
    interestRate: decimal('interest_rate', { precision: 8, scale: 5 }),
    /** 月供；无固定月供可为 null。 */
    monthlyPayment: decimal('monthly_payment', { precision: 18, scale: 2 }),
    /** 到期日；无固定到期可为 null。 */
    dueDate: date('due_date'),
    /** 已还本金累计（recordRepayment 单调递增；credit 表示累计已还）。 */
    paidAmount: decimal('paid_amount', { precision: 18, scale: 2 })
      .default('0')
      .notNull(),
    /** 账单日（月内 1–31），仅 credit；其它可为 null。 */
    statementDay: integer('statement_day'),
    /** 还款日（月内 1–31），仅 credit；其它可为 null。 */
    repaymentDay: integer('repayment_day'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('finance_liability_details_account_unique').on(t.accountId),
  ],
);

export type LiabilityDetailItem = typeof financeLiabilityDetails.$inferSelect;
export type NewLiabilityDetail = typeof financeLiabilityDetails.$inferInsert;
