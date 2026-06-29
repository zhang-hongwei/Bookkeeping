/**
 * Finance 领域关系定义（集中）。
 *
 * 对应 data-model.md 的「关系」节。供 drizzle 关系查询 API（`db.query.*`）使用；
 * 列表/明细等仍优先用显式 select/from 以便精确控制列与过滤。
 */
import { relations } from 'drizzle-orm';
import { financeAccounts } from './accounts';
import { categories } from './categories';
import { transactions, entries } from './transactions';
import { billImports, billImportRows } from './bill-imports';

export const financeAccountsRelations = relations(financeAccounts, ({ many }) => ({
  entries: many(entries),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'category_parent',
  }),
  children: many(categories, { relationName: 'category_parent' }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  entries: many(entries),
}));

export const entriesRelations = relations(entries, ({ one }) => ({
  transaction: one(transactions, {
    fields: [entries.transactionId],
    references: [transactions.id],
  }),
  account: one(financeAccounts, {
    fields: [entries.accountId],
    references: [financeAccounts.id],
  }),
}));

export const billImportsRelations = relations(billImports, ({ many }) => ({
  rows: many(billImportRows),
}));

export const billImportRowsRelations = relations(billImportRows, ({ one }) => ({
  billImport: one(billImports, {
    fields: [billImportRows.billImportId],
    references: [billImports.id],
  }),
}));
