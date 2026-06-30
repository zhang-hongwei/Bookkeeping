/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  varchar,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { DEGRADED_STATUSES, type DegradedStatus } from './scenarios';

/** 专项附加扣除目录键（NC1，取值由 taxRuleConfig 注入）。 */
export const SPECIAL_DEDUCTION_KEYS = [
  'children_education',
  'continuing_education',
  'serious_illness',
  'housing_loan_interest',
  'housing_rent',
  'supporting_elderly',
  'infant_care',
] as const;
export type SpecialDeductionKey = (typeof SPECIAL_DEDUCTION_KEYS)[number];

/** 个税估算输入（NC1）。 */
export interface TaxInputs {
  /** 年度综合所得（工资薪金等，decimal 字符串）。 */
  annualIncome: string;
  /** 五险一金年度扣除（decimal 字符串）。 */
  insuranceAndFund: string;
  /** 专项附加扣除（目录键 → 年度定额 decimal 字符串）。 */
  specialDeductions: Partial<Record<SpecialDeductionKey, string>>;
  /** 全年一次性奖金（decimal 字符串）；无则 separate==merged。 */
  annualBonus?: string | null;
}

/** 年终奖两种计税对比结果（I5）。 */
export interface MethodComparison {
  /** 单独计税。 */
  separate: { taxAmount: string };
  /** 并入综合所得。 */
  merged: { taxAmount: string };
  /** separate − merged（I5）。 */
  diff: string;
  /** 较优方向（取较小者，规则化非建议）。 */
  better: 'separate' | 'merged';
}

/** 规则化节税方向（非税务建议）。 */
export interface TaxHint {
  /** 方向文案，引用规则结论。 */
  text: string;
}

/**
 * 个税估算（Phase 7，FR-002/SC-002）。
 * 确定性纯函数引擎 `tax.engine.ts` 产出，溯源：ruleVintage（NC1/NC7）+ inputs + disclaimers。
 */
export const taxEstimates = pgTable(
  'finance_tax_estimates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    taxYear: integer('tax_year').notNull(),
    /** 规则版本，如 `PRC-IIT-2026`（I7）。 */
    ruleVintage: varchar('rule_vintage', { length: 32 }).notNull(),
    inputs: jsonb('inputs').$type<TaxInputs>().notNull(),
    methodComparison: jsonb('method_comparison')
      .$type<MethodComparison>()
      .notNull(),
    /** 较优方向应纳税额（decimal）。 */
    totalTaxAmount: numeric('total_tax_amount', {
      precision: 18,
      scale: 2,
    }).notNull(),
    effectiveRate: numeric('effective_rate', { precision: 18, scale: 6 }),
    hints: jsonb('hints').$type<TaxHint[]>().default([]).notNull(),
    engineVersion: varchar('engine_version', { length: 32 }).notNull(),
    status: varchar('status', { length: 16 })
      .$type<DegradedStatus>()
      .default('ok')
      .notNull(),
    missing: jsonb('missing').$type<string[]>().default([]).notNull(),
    disclaimers: jsonb('disclaimers').$type<string[]>().default([]).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('finance_tax_estimates_user_year_idx').on(t.userId, t.taxYear)],
);

export type TaxEstimateItem = typeof taxEstimates.$inferSelect;
export type NewTaxEstimate = typeof taxEstimates.$inferInsert;
