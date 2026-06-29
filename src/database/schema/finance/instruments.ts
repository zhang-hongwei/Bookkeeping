/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  decimal,
  jsonb,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { VALUATION_SOURCES, type ValuationSource } from './asset-details';

/**
 * 投资品种类型（FR-001）。
 * stock/fund/bond/gold/etf/reits/crypto —— 用于持仓、品种目录、定投计划与配置聚合。
 */
export const INSTRUMENT_TYPES = [
  'stock',
  'fund',
  'bond',
  'gold',
  'etf',
  'reits',
  'crypto',
] as const;
export type InstrumentType = (typeof INSTRUMENT_TYPES)[number];

/** 品种行情缓存的原数据（市场/原始字段，扩展用）。 */
export interface InstrumentMeta {
  market?: string;
  [key: string]: unknown;
}

/**
 * 投资品种目录 + 行情缓存（Phase 3）—— 每用户每品种一行（UNIQUE(userId, code)）。
 *
 * 持仓 `finance_positions.instrument_code` 软引用本表 `code`（无硬 FK，因品种可先于目录存在）。
 * 行情由 `market-data.service` 写入 `latestPrice`/`priceSource`/`priceUpdatedAt`/`isStale`，
 * 失败或超 TTL 时降级为手动输入（FR-004），**绝不伪造价格**。
 */
export const financeInstruments = pgTable(
  'finance_instruments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    code: varchar('code', { length: 32 }).notNull(),
    type: varchar('type', { length: 16 }).$type<InstrumentType>().notNull(),
    name: varchar('name', { length: 128 }),
    /** 缓存最新价（高精度，6 位小数）。 */
    latestPrice: decimal('latest_price', { precision: 18, scale: 6 }),
    priceSource: varchar('price_source', { length: 32 })
      .$type<ValuationSource>()
      .default('manual')
      .notNull(),
    priceUpdatedAt: timestamp('price_updated_at'),
    /** 行情是否陈旧（超 TTL 或拉取失败）。 */
    isStale: boolean('is_stale').default(false).notNull(),
    currency: varchar('currency', { length: 8 }).default('CNY').notNull(),
    meta: jsonb('meta').$type<InstrumentMeta>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('finance_instruments_user_code_unique').on(t.userId, t.code)],
);

export type InstrumentItem = typeof financeInstruments.$inferSelect;
export type NewInstrument = typeof financeInstruments.$inferInsert;
