/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  integer,
  varchar,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { DEGRADED_STATUSES, type DegradedStatus } from './scenarios';

/** 退休模拟假设束（NC3，全部可调、全部落表溯源）。 */
export interface RetirementAssumptions {
  currentAge: number;
  retirementAge: number;
  /** 月度储蓄/投资节奏（decimal 字符串）。 */
  monthlyContribution: string;
  /** 实际回报率（百分点，如 4.0 = 4%；默认保守值）。 */
  realReturnRatePct: number;
  /** 通胀率（百分点）。 */
  inflationPct: number;
  /** 退休后月支出（decimal 字符串）。 */
  postRetirementMonthlySpend: string;
  /** 安全提取率（百分点，经验假设「4% 规则」类）。 */
  withdrawalRatePct: number;
}

/** 退休模拟结果点（金额 string/decimal 语义）。 */
export interface RetirementPoint {
  /** 退休时点预估资产（corpus）。 */
  retirementCorpus: string;
  /** 按提取率可支撑的月支出。 */
  monthlySustainable: string;
  /** 资产耗尽年龄（null = 可持续）。 */
  depletionAge: number | null;
}

/** 可持续性判定（中性口径，规则判定）。 */
export const SUSTAINABLE_VERDICTS = ['sustainable', 'marginal', 'insufficient'] as const;
export type SustainableVerdict = (typeof SUSTAINABLE_VERDICTS)[number];

/**
 * 退休模拟（Phase 7，FR-003/SC-003）。
 * 复用 `projection.engine` 长期投影 + 确定性三点区间（悲观/中性/乐观）。
 * 溯源：engineVersion + assumptions + disclaimers（强制含不确定性 I9）。
 */
export const retirementSimulations = pgTable(
  'finance_retirement_simulations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    assumptions: jsonb('assumptions').$type<RetirementAssumptions>().notNull(),
    horizonMonths: integer('horizon_months').notNull(),
    /** 悲观（回报率 −2%，I8）。 */
    resultPessimistic: jsonb('result_pessimistic')
      .$type<RetirementPoint>()
      .notNull(),
    resultBaseline: jsonb('result_baseline').$type<RetirementPoint>().notNull(),
    /** 乐观（回报率 +2%）。 */
    resultOptimistic: jsonb('result_optimistic')
      .$type<RetirementPoint>()
      .notNull(),
    sustainableVerdict: varchar('sustainable_verdict', { length: 16 })
      .$type<SustainableVerdict>()
      .notNull(),
    engineVersion: varchar('engine_version', { length: 32 }).notNull(),
    status: varchar('status', { length: 16 })
      .$type<DegradedStatus>()
      .default('ok')
      .notNull(),
    missing: jsonb('missing').$type<string[]>().default([]).notNull(),
    disclaimers: jsonb('disclaimers').$type<string[]>().default([]).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('finance_retirement_simulations_user_idx').on(t.userId)],
);

export type RetirementSimulationItem = typeof retirementSimulations.$inferSelect;
export type NewRetirementSimulation = typeof retirementSimulations.$inferInsert;
