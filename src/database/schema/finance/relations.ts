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
import { financePositions } from './positions';
import { financeInstruments } from './instruments';
import { financeInvestmentTrades } from './investment-trades';
import { financeDcaPlans } from './dca-plans';
import { financeFamilies, financeFamilyMembers } from './families';
import { financeFamilyNetWorthSnapshots } from './family-snapshots';
// Phase 6：AI 财富顾问
import { cashFlowForecasts } from './cash-flow-forecasts';
import { smartAlerts, alertPreferences } from './smart-alerts';
import { approvals } from './approvals';
import { advisorSessions, advisorMessages } from './advisor';
// Phase 5：预算与目标
import { budgets, budgetPeriods } from './budgets';
import { goals } from './goals';
// Phase 7：高级分析
import { scenarios } from './scenarios';
import { scenarioProjections } from './scenario-projections';
import { taxEstimates } from './tax-estimates';
import { retirementSimulations } from './retirement-simulations';
import { portfolioHints } from './portfolio-hints';

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
    // Phase 3：1:1 投资持仓（仅 investment 账户）
    position: one(financePositions, {
      fields: [financeAccounts.id],
      references: [financePositions.accountId],
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
  // Phase 4：归属成员（谁花/谁赚，含 joint；可空）。
  attributedMember: one(financeFamilyMembers, {
    fields: [transactions.memberId],
    references: [financeFamilyMembers.id],
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

// Phase 3：投资持仓 / 品种目录 / 投资交易 / 定投计划

export const financePositionsRelations = relations(financePositions, ({ one, many }) => ({
  account: one(financeAccounts, {
    fields: [financePositions.accountId],
    references: [financeAccounts.id],
  }),
  trades: many(financeInvestmentTrades),
}));

export const financeInvestmentTradesRelations = relations(
  financeInvestmentTrades,
  ({ one }) => ({
    position: one(financePositions, {
      fields: [financeInvestmentTrades.positionId],
      references: [financePositions.id],
    }),
    transaction: one(transactions, {
      fields: [financeInvestmentTrades.transactionId],
      references: [transactions.id],
    }),
    dcaPlan: one(financeDcaPlans, {
      fields: [financeInvestmentTrades.dcaPlanId],
      references: [financeDcaPlans.id],
    }),
  }),
);

export const financeDcaPlansRelations = relations(financeDcaPlans, ({ one, many }) => ({
  cashAccount: one(financeAccounts, {
    fields: [financeDcaPlans.cashAccountId],
    references: [financeAccounts.id],
  }),
  trades: many(financeInvestmentTrades),
}));

// finance_instruments：instrument_code 为持仓软引用（无硬 FK），仅留占位保证 barrel 一致。
export const financeInstrumentsRelations = relations(financeInstruments, () => ({}));

// Phase 4：家庭 / 成员 / 家庭快照
export const financeFamiliesRelations = relations(financeFamilies, ({ many }) => ({
  members: many(financeFamilyMembers),
  netWorthSnapshots: many(financeFamilyNetWorthSnapshots),
}));

export const financeFamilyMembersRelations = relations(
  financeFamilyMembers,
  ({ one, many }) => ({
    family: one(financeFamilies, {
      fields: [financeFamilyMembers.familyId],
      references: [financeFamilies.id],
    }),
    attributedTransactions: many(transactions),
  }),
);

export const financeFamilyNetWorthSnapshotsRelations = relations(
  financeFamilyNetWorthSnapshots,
  ({ one }) => ({
    family: one(financeFamilies, {
      fields: [financeFamilyNetWorthSnapshots.familyId],
      references: [financeFamilies.id],
    }),
  }),
);

// Phase 6：AI 财富顾问
// cashFlowForecasts / smartAlerts / alertPreferences 仅 userId 作用域，
// 无强外键到 findings（findings 可被覆盖重算，引用存 jsonb 快照）—— 留空占位保证 barrel 一致。
export const cashFlowForecastsRelations = relations(cashFlowForecasts, () => ({}));
export const smartAlertsRelations = relations(smartAlerts, () => ({}));
export const alertPreferencesRelations = relations(alertPreferences, () => ({}));

// 顾问会话 ↔ 消息 ↔ 审批（proposalId FK；proposedBy 为软引用不在 relations 建模）
export const advisorSessionsRelations = relations(advisorSessions, ({ many }) => ({
  messages: many(advisorMessages),
}));

export const advisorMessagesRelations = relations(advisorMessages, ({ one, many }) => ({
  session: one(advisorSessions, {
    fields: [advisorMessages.sessionId],
    references: [advisorSessions.id],
  }),
  proposal: one(approvals, {
    fields: [advisorMessages.proposalId],
    references: [approvals.id],
  }),
}));

export const approvalsRelations = relations(approvals, ({ many }) => ({
  // 被（多条）顾问消息引用（proposalId）；proposedBy 软引用不建模
  proposedIn: many(advisorMessages),
}));

// Phase 5：预算 / 预算周期 / 目标
// budgets.categoryId 为逻辑关联（无 FK 约束），用 one + fields/references 表达用于 query API。
export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
  periods: many(budgetPeriods),
}));

export const budgetPeriodsRelations = relations(budgetPeriods, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetPeriods.budgetId],
    references: [budgets.id],
  }),
}));

// goals.linkedAccountIds 为 jsonb id 数组，不做关系展开（手动按 id 查 accounts）—— 留空占位。
export const goalsRelations = relations(goals, () => ({}));

// Phase 7：高级分析
// 情景 ↔ 投影点（一对多；FK 已表达，关系声明供 query API）
export const scenariosRelations = relations(scenarios, ({ many }) => ({
  projections: many(scenarioProjections),
}));

export const scenarioProjectionsRelations = relations(
  scenarioProjections,
  ({ one }) => ({
    scenario: one(scenarios, {
      fields: [scenarioProjections.scenarioId],
      references: [scenarios.id],
    }),
  }),
);

// tax/retirement/portfolio 仅 userId 作用域，无表间关系 —— 留空占位保证 barrel 一致。
export const taxEstimatesRelations = relations(taxEstimates, () => ({}));
export const retirementSimulationsRelations = relations(
  retirementSimulations,
  () => ({}),
);
export const portfolioHintsRelations = relations(portfolioHints, () => ({}));
