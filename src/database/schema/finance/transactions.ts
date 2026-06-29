/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  decimal,
  timestamp,
} from 'drizzle-orm/pg-core';
import { financeAccounts } from './accounts';

/** 交易类型 */
export const TRANSACTION_TYPES = ['income', 'expense', 'transfer'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

/** 交易来源（Phase 1 追加 ocr：截图 OCR 记账） */
export const TRANSACTION_SOURCES = ['manual', 'import', 'nl', 'ocr'] as const;
export type TransactionSource = (typeof TRANSACTION_SOURCES)[number];

/** 分录方向（复式记账） */
export const ENTRY_SIDES = ['debit', 'credit'] as const;
export type EntrySide = (typeof ENTRY_SIDES)[number];

/**
 * 交易 —— 一笔业务事件（收入/支出/转账）。
 * `amount` 为冗余的交易金额（>0），便于查询；权威金额在 entries。
 */
export const transactions = pgTable('finance_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  type: varchar('type', { length: 16 }).$type<TransactionType>().notNull(),
  categoryId: uuid('category_id'),
  amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
  note: text('note'),
  source: varchar('source', { length: 16 })
    .$type<TransactionSource>()
    .default('manual')
    .notNull(),
  // 置信度 0.00–1.00（手动=1.0；导入/自然语言按解析置信度）
  confidence: decimal('confidence', { precision: 3, scale: 2 })
    .default('1.00')
    .notNull(),
  billImportId: uuid('bill_import_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 分录 —— 复式记账的平衡锚点。
 * 不变式（应用层事务强制）：同一 transactionId 下 Σ(debit) === Σ(credit)，且每条 amount > 0。
 */
export const entries = pgTable('finance_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id')
    .references(() => transactions.id, { onDelete: 'cascade' })
    .notNull(),
  accountId: uuid('account_id')
    .references(() => financeAccounts.id, { onDelete: 'restrict' })
    .notNull(),
  side: varchar('side', { length: 8 }).$type<EntrySide>().notNull(),
  amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type TransactionItem = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type EntryItem = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
