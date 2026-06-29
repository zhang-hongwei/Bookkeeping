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
import { netWorthSnapshots } from './net-worth-snapshots';
import { ruleFindings } from './rule-findings';
import { aiReports } from './ai-reports';
import { financeAssetDetails } from './asset-details';
import { financeLiabilityDetails } from './liability-details';

export const financeAccountsRelations = relations(
  financeAccounts,
  ({ many, one }) => ({
    entries: many(entries),
    // Phase 2：1:1 资产/负债明细（仅部分账户类型挂载）
    assetDetail: one(financeAssetDetails, {
      fields: [financeAccounts.id],
      references: [financeAssetDetails.accountId],
    }),
    liabilityDetail: one(financeLiabilityDetails, {
      fields: [financeAccounts.id],
      references: [financeLiabilityDetails.accountId],
    }),
  }),
);

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

// Phase 1 关系（users 为纯 text userId，不在此建模；findings ↔ reports 通过 report_id）
export const ruleFindingsRelations = relations(ruleFindings, ({ one }) => ({
  report: one(aiReports, {
    fields: [ruleFindings.reportId],
    references: [aiReports.id],
  }),
}));

export const aiReportsRelations = relations(aiReports, ({ many }) => ({
  findings: many(ruleFindings),
}));

// netWorthSnapshots：按 (userId, date) 定位，无外键关系，留空占位以保证 barrel 一致。
export const netWorthSnapshotsRelations = relations(netWorthSnapshots, () => ({}));

// Phase 2：资产/负债明细 ↔ 账户（1:1）。
export const financeAssetDetailsRelations = relations(
  financeAssetDetails,
  ({ one }) => ({
    account: one(financeAccounts, {
      fields: [financeAssetDetails.accountId],
      references: [financeAccounts.id],
    }),
  }),
);

export const financeLiabilityDetailsRelations = relations(
  financeLiabilityDetails,
  ({ one }) => ({
    account: one(financeAccounts, {
      fields: [financeLiabilityDetails.accountId],
      references: [financeAccounts.id],
    }),
  }),
);
