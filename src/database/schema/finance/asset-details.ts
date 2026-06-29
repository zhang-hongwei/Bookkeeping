/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  decimal,
  date,
  jsonb,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { financeAccounts } from './accounts';

/** 估值置信度（诚实估值，设计 P6）：标注资产估值的可靠性。 */
export const ESTIMATE_CONFIDENCES = ['high', 'medium', 'low'] as const;
export type EstimateConfidence = (typeof ESTIMATE_CONFIDENCES)[number];

/** 估值来源。 */
export const VALUATION_SOURCES = ['manual', 'market', 'estimate'] as const;
export type ValuationSource = (typeof VALUATION_SOURCES)[number];

/** 估值历史轨迹条目（存于 valuation_history jsonb）。 */
export interface ValuationHistoryEntry {
  date: string; // YYYY-MM-DD
  value: string; // 金额字符串
  confidence: EstimateConfidence;
  source: ValuationSource;
}

/**
 * 资产明细（1:1 挂 real_asset / investment 账户）—— Phase 2。
 *
 * 资产「当前价值」= 关联账户 `finance_accounts.balance`（真相源，由分录维护）。
 * 本表只承载估值元数据（成本/来源/置信度）与估值历史，不冗余存当前价值。
 * 现金/储蓄类无明细表；投资类持仓细节属 Phase 3（本阶段仅简单估值）。
 */
export const financeAssetDetails = pgTable(
  'finance_asset_details',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    /** 1:1 关联账户（real_asset / investment）。 */
    accountId: uuid('account_id')
      .references(() => financeAccounts.id, { onDelete: 'cascade' })
      .notNull(),
    /** 成本/取得成本（建账估值或购入价）。 */
    costBasis: decimal('cost_basis', { precision: 18, scale: 2 })
      .default('0')
      .notNull(),
    valuationSource: varchar('valuation_source', { length: 32 })
      .$type<ValuationSource>()
      .default('manual')
      .notNull(),
    estimateConfidence: varchar('estimate_confidence', { length: 16 })
      .$type<EstimateConfidence>()
      .default('medium')
      .notNull(),
    /** 最近估值日（仅日期）。 */
    valuationDate: date('valuation_date'),
    /** 估值轨迹（追加，不覆盖），便于回溯贬值/升值。 */
    valuationHistory: jsonb('valuation_history')
      .$type<ValuationHistoryEntry[]>()
      .default([])
      .notNull(),
    /** 是否已处置（处置后 true，账户余额归零）。 */
    isDisposed: boolean('is_disposed').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('finance_asset_details_account_unique').on(t.accountId)],
);

export type AssetDetailItem = typeof financeAssetDetails.$inferSelect;
export type NewAssetDetail = typeof financeAssetDetails.$inferInsert;
