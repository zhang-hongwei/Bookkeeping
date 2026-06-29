/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  date,
  decimal,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { aiReports } from './ai-reports';

/** 周期种类（Phase 1 仅 month；预留 quarter/year） */
export const PERIOD_KINDS = ['month', 'quarter', 'year'] as const;
export type PeriodKind = (typeof PERIOD_KINDS)[number];

/** 规则结论指标（确定性、可审计、零幻觉） */
export const FINDING_METRICS = [
  'income_total',
  'expense_total',
  'surplus',
  'savings_rate',
  'debt_ratio',
  'emergency_months',
] as const;
export type FindingMetric = (typeof FINDING_METRICS)[number];

/** 风险等级 */
export const RISK_LEVELS = ['none', 'low', 'medium', 'high'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

/**
 * 规则引擎确定性结论 —— 可审计、零幻觉。
 * 同一 (user_id, period_start, period_end, metric) 唯一；重算覆盖。
 * value 用 numeric(18,4)（比率 4 位、金额 2 位）。
 */
export const ruleFindings = pgTable(
  'finance_rule_findings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    periodKind: varchar('period_kind', { length: 16 })
      .$type<PeriodKind>()
      .default('month')
      .notNull(),
    periodStart: date('period_start').notNull(),
    periodEnd: date('period_end').notNull(),
    metric: varchar('metric', { length: 32 }).$type<FindingMetric>().notNull(),
    value: decimal('value', { precision: 18, scale: 4 }),
    verdict: text('verdict'),
    riskLevel: varchar('risk_level', { length: 8 })
      .$type<RiskLevel>()
      .default('none')
      .notNull(),
    /** 被某报告引用时回填 */
    reportId: uuid('report_id').references(() => aiReports.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('finance_findings_period_metric_unique').on(
      t.userId,
      t.periodStart,
      t.periodEnd,
      t.metric,
    ),
  ],
);

export type RuleFindingItem = typeof ruleFindings.$inferSelect;
export type NewRuleFinding = typeof ruleFindings.$inferInsert;
