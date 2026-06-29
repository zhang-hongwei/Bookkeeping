/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  decimal,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { financeAccounts } from './accounts';
import {
  ESTIMATE_CONFIDENCES,
  type EstimateConfidence,
  VALUATION_SOURCES,
  type ValuationSource,
} from './asset-details';
import { INSTRUMENT_TYPES, type InstrumentType } from './instruments';

/**
 * 投资持仓（Phase 3）—— 1:1 挂 `investment` 账户（UNIQUE account_id）。
 *
 * 建模（research.md R1）：
 * - 每个持仓 = 一个 `investment` 账户；**当前市值 = 账户 `balance`（真相源，由分录维护）**。
 * - 本表承载投资语义：品种/份额/成本价/现价缓存/来源/估值时间/置信度。
 * - `current_price` 仅用于展示与触发 revaluation，**不是市值来源**（市值取账户 balance）。
 * 派生（不存储）：市值 = account.balance；成本 = quantity × cost_price；
 * 盈亏 = 市值 − 成本；盈亏率 = 盈亏 / 成本（见 `services/finance/pnl.ts`）。
 */
export const financePositions = pgTable(
  'finance_positions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    /** 1:1 关联 investment 账户。 */
    accountId: uuid('account_id')
      .references(() => financeAccounts.id, { onDelete: 'cascade' })
      .notNull(),
    instrumentCode: varchar('instrument_code', { length: 32 }).notNull(),
    instrumentType: varchar('instrument_type', { length: 16 })
      .$type<InstrumentType>()
      .notNull(),
    /** 持有份额/数量（6 位小数避免累积漂移，research.md R7）。 */
    quantity: decimal('quantity', { precision: 18, scale: 6 })
      .default('0')
      .notNull(),
    /** 加权平均成本价（买入重算；卖出不变）。 */
    costPrice: decimal('cost_price', { precision: 18, scale: 6 })
      .default('0')
      .notNull(),
    /** 现价缓存（展示/触发 revaluation，非市值真相源）。 */
    currentPrice: decimal('current_price', { precision: 18, scale: 6 })
      .default('0')
      .notNull(),
    priceSource: varchar('price_source', { length: 32 })
      .$type<ValuationSource>()
      .default('manual')
      .notNull(),
    lastPriceAt: timestamp('last_price_at'),
    currency: varchar('currency', { length: 8 }).default('CNY').notNull(),
    estimateConfidence: varchar('estimate_confidence', { length: 16 })
      .$type<EstimateConfidence>()
      .default('medium')
      .notNull(),
    /** 全部卖出后置 true（余额 0）。 */
    isClosed: boolean('is_closed').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('finance_positions_account_unique').on(t.accountId)],
);

export type PositionItem = typeof financePositions.$inferSelect;
export type NewPosition = typeof financePositions.$inferInsert;

// 仅为让 ESTIMATE_CONFIDENCES/VALUATION_SOURCES 在 barrel 中保持「被使用」的语义提示；
// 枚举类型本身已通过 $type 引用。
void ESTIMATE_CONFIDENCES;
void VALUATION_SOURCES;
