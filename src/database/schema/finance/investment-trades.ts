/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  decimal,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { transactions } from './transactions';
import { financePositions } from './positions';
import { financeDcaPlans } from './dca-plans';

/**
 * 投资交易语义层（Phase 3）—— 1:N 挂持仓（research.md R2）。
 *
 * 钱在 `finance_transactions` + `finance_entries`（复式真相源）；本表承载投资语义
 *（买卖/分红/拆股的动作、份额、单价、费用、税），经 `transaction_id` 关联底层交易，
 * 经 `dca_plan_id`（可选）关联定投计划。用于 IRR 现金流、加权成本、已实现盈亏历史。
 */
export const TRADE_ACTIONS = [
  'buy',
  'sell',
  'dividend_cash',
  'dividend_reinvest',
  'split',
] as const;
export type TradeAction = (typeof TRADE_ACTIONS)[number];

export const financeInvestmentTrades = pgTable(
  'finance_investment_trades',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    positionId: uuid('position_id')
      .references(() => financePositions.id, { onDelete: 'cascade' })
      .notNull(),
    action: varchar('action', { length: 24 }).$type<TradeAction>().notNull(),
    /** 成交份额/数量（6 位小数）。 */
    shares: decimal('shares', { precision: 18, scale: 6 }),
    /** 成交单价（6 位小数）。 */
    price: decimal('price', { precision: 18, scale: 6 }),
    /** 费用（买入计入成本；卖出从所得扣除）。 */
    fee: decimal('fee', { precision: 18, scale: 2 }).default('0').notNull(),
    /** 税/印花税（卖出，可空）。 */
    tax: decimal('tax', { precision: 18, scale: 2 }).default('0').notNull(),
    /** 复式侧金额：买入 = shares×price+fee；卖出净额 = shares×price−fee−tax。 */
    amount: decimal('amount', { precision: 18, scale: 2 }).default('0').notNull(),
    transactionId: uuid('transaction_id').references(() => transactions.id, {
      onDelete: 'set null',
    }),
    dcaPlanId: uuid('dca_plan_id').references(() => financeDcaPlans.id, {
      onDelete: 'set null',
    }),
    /** 成交时间（IRR 现金流时点）。 */
    occurredAt: timestamp('occurred_at').defaultNow().notNull(),
    note: text('note'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('finance_investment_trades_position_idx').on(t.positionId)],
);

export type InvestmentTradeItem = typeof financeInvestmentTrades.$inferSelect;
export type NewInvestmentTrade = typeof financeInvestmentTrades.$inferInsert;
