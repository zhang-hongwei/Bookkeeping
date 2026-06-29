/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import type { TransactionType } from './transactions';

/** 账单来源 */
export const BILL_IMPORT_SOURCES = [
  'alipay',
  'wechat',
  'bank',
  'generic_csv',
] as const;
export type BillImportSource = (typeof BILL_IMPORT_SOURCES)[number];

/** 导入批次状态机：parsing → preview → confirmed；或 parsing → failed */
export const BILL_IMPORT_STATUSES = [
  'parsing',
  'preview',
  'confirmed',
  'failed',
] as const;
export type BillImportStatus = (typeof BILL_IMPORT_STATUSES)[number];

/** 候选行状态 */
export const BILL_IMPORT_ROW_STATUSES = [
  'pending',
  'imported',
  'duplicate',
  'error',
] as const;
export type BillImportRowStatus = (typeof BILL_IMPORT_ROW_STATUSES)[number];

/** 解析出的候选交易（落库前，供预览/确认）。 */
export interface ParsedTx {
  amount: string; // 正金额字符串
  type?: TransactionType; // 缺省按收支方向推断
  counterparty?: string;
  note?: string;
  occurredAt?: string; // ISO 时间
  categoryId?: string;
  accountId?: string;
}

/**
 * 账单导入批次 —— 一次批量导入的会话。
 * 状态机：parsing → preview（待确认）→ confirmed（落库完成）；或 parsing → failed。
 */
export const billImports = pgTable('finance_bill_imports', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  source: varchar('source', { length: 16 }).$type<BillImportSource>().notNull(),
  fileName: text('file_name'),
  status: varchar('status', { length: 16 })
    .$type<BillImportStatus>()
    .default('parsing')
    .notNull(),
  total: integer('total').default(0).notNull(),
  imported: integer('imported').default(0).notNull(),
  skipped: integer('skipped').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 账单导入候选行 + 去重锚点。
 * `rowHash` = 归一化哈希 hash(occurredAt + amount + counterparty + memo)；
 * 落库前与该用户已 status=imported 的 rows 比对，命中 → duplicate（SC-006）。
 */
export const billImportRows = pgTable('finance_bill_import_rows', {
  id: uuid('id').primaryKey().defaultRandom(),
  billImportId: uuid('bill_import_id')
    .references(() => billImports.id, { onDelete: 'cascade' })
    .notNull(),
  userId: text('user_id').notNull(),
  rowHash: text('row_hash').notNull(),
  parsed: jsonb('parsed').$type<ParsedTx>().notNull(),
  status: varchar('status', { length: 16 })
    .$type<BillImportRowStatus>()
    .default('pending')
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type BillImportItem = typeof billImports.$inferSelect;
export type NewBillImport = typeof billImports.$inferInsert;
export type BillImportRowItem = typeof billImportRows.$inferSelect;
export type NewBillImportRow = typeof billImportRows.$inferInsert;
