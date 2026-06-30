/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  numeric,
  varchar,
  jsonb,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

/** 组合优化偏离方向（仅方向，非买卖指令，I11）。 */
export const PORTFOLIO_DIRECTIONS = ['under', 'over', 'ok'] as const;
export type PortfolioDirection = (typeof PORTFOLIO_DIRECTIONS)[number];

/** 目标配置区间（参数化，NC4；min/max 为 0–1 占比）。 */
export interface TargetBand {
  min: number;
  max: number;
}

/**
 * 组合优化方向（Phase 7，FR-004/SC-004）。
 * 按 assetClass 一条；随持仓重算覆盖（batchId 整组）。
 * 溯源：targetBandsVersion（NC4/NC7）+ engineVersion + disclaimers。
 */
export const portfolioHints = pgTable(
  'finance_portfolio_hints',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    /** 一次重算的批次（整组覆盖）。 */
    batchId: uuid('batch_id').defaultRandom().notNull(),
    /** 复用 Phase 3 allocation 类别（现金/固收/权益/另类）。 */
    assetClass: varchar('asset_class', { length: 32 }).notNull(),
    currentRatio: numeric('current_ratio', { precision: 18, scale: 6 }).notNull(),
    targetBand: jsonb('target_band').$type<TargetBand>().notNull(),
    direction: varchar('direction', { length: 8 })
      .$type<PortfolioDirection>()
      .notNull(),
    /** 引用规则的可解释依据（不含品种/数量，I11）。 */
    reason: text('reason').notNull(),
    targetBandsVersion: varchar('target_bands_version', { length: 32 }).notNull(),
    engineVersion: varchar('engine_version', { length: 32 }).notNull(),
    disclaimers: jsonb('disclaimers').$type<string[]>().default([]).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('finance_portfolio_hints_user_batch_class_unique').on(
      t.userId,
      t.batchId,
      t.assetClass,
    ),
    index('finance_portfolio_hints_user_idx').on(t.userId),
  ],
);

export type PortfolioHintItem = typeof portfolioHints.$inferSelect;
export type NewPortfolioHint = typeof portfolioHints.$inferInsert;
