/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  jsonb,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { scenarios } from './scenarios';

/**
 * 目标达成时点位移（复用 Phase 6 Goal 口径，NC2）。
 * Phase 6 未落地时引擎返回 null（降级，不编造）。
 */
export interface GoalImpact {
  goalId?: string;
  baselineAchieveMonth?: number | null;
  scenarioAchieveMonth?: number | null;
  /** scenario 相对 baseline 提前(−)/推迟(+)的月数。 */
  deltaMonths?: number | null;
}

/**
 * 确定性投影点（Phase 7，FR-001/SC-001/I3/I4）。
 * 每个情景的逐月点：基线值 + 情景值 + diff（确定性、可复现）。
 * 同一情景重算 → 按 (scenarioId, monthOffset) 覆盖。
 */
export const scenarioProjections = pgTable(
  'finance_scenario_projections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scenarioId: uuid('scenario_id')
      .references(() => scenarios.id, { onDelete: 'cascade' })
      .notNull(),
    /** 冗余便于隔离查询（与全域一致）。 */
    userId: text('user_id').notNull(),
    /** 0 = 当下，1..horizonMonths。 */
    monthOffset: integer('month_offset').notNull(),
    baselineNetWorth: numeric('baseline_net_worth', { precision: 18, scale: 2 }),
    scenarioNetWorth: numeric('scenario_net_worth', { precision: 18, scale: 2 }),
    /** 情景 − 基线（I3，行内一致性测试锚点）。 */
    netWorthDelta: numeric('net_worth_delta', { precision: 18, scale: 2 }),
    baselineEmergencyMonths: numeric('baseline_emergency_months', {
      precision: 18,
      scale: 4,
    }),
    scenarioEmergencyMonths: numeric('scenario_emergency_months', {
      precision: 18,
      scale: 4,
    }),
    goalImpact: jsonb('goal_impact').$type<GoalImpact>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('finance_scenario_projections_scenario_month_unique').on(
      t.scenarioId,
      t.monthOffset,
    ),
    index('finance_scenario_projections_user_idx').on(t.userId),
  ],
);

export type ScenarioProjectionItem = typeof scenarioProjections.$inferSelect;
export type NewScenarioProjection = typeof scenarioProjections.$inferInsert;
