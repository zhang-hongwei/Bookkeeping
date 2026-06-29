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
import { financeFamilyMembers } from './families';

/** 交易类型（Phase 2 追加 repayment/revaluation/disposal）。 */
export const TRANSACTION_TYPES = [
  'income',
  'expense',
  'transfer',
  // Phase 2：资产/负债生命周期交易
  'repayment', // 还款：本金减负债 + 利息计支出 + 合计减现金（3 腿）
  'revaluation', // 估值更新：资产 ↔ __revaluation（2 腿）
  'disposal', // 资产处置：现金 + 资产清零 + 实现损益（3 腿）
] as const;
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
  // Phase 4：家庭归属维度（谁花/谁赚，指向 family_members.id；含 joint）。
  // 可空：NULL = 无家庭归属（向后兼容 Phase 0–3 数据与纯个人用户）。
  // 注意：归属只作用于收支画像，不改变净资产所有权（净资产按账号 owner 聚合）。
  memberId: uuid('member_id').references(() => financeFamilyMembers.id, {
    onDelete: 'set null',
  }),
  // Phase 2：还款本金/利息拆分（仅 type=repayment 填充，其它为 null）。
  // amount = principal + interest；便于「利息支出」报表与拆分追溯。
  principalAmount: decimal('principal_amount', { precision: 18, scale: 2 }),
  interestAmount: decimal('interest_amount', { precision: 18, scale: 2 }),
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
