/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

/** 智能预警种类（FR-002）。 */
export const ALERT_KINDS = [
  'emergency_shortfall',
  'savings_rate_decline',
  'debt_ratio_high',
  'trend_deterioration',
  'concentration',
] as const;
export type AlertKind = (typeof ALERT_KINDS)[number];

/** 预警严重度（映射自 riskLevel，不含 none）。 */
export const ALERT_SEVERITIES = ['low', 'medium', 'high'] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

/** 预警状态（FR-008）。 */
export const ALERT_STATUSES = ['active', 'acknowledged', 'silenced'] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

/**
 * 预警引用的规则结论锚点（jsonb 快照，I1）。findings 同期会被覆盖重算，
 * 故存快照保证「结论当时的依据」不可变、可回看（SC-002）。
 */
export interface AlertFindingRef {
  metric: string;
  period: string;
  value: string | null;
  verdict: string;
  riskLevel: string;
}

/**
 * 智能预警（Phase 6，FR-002）。
 * - 规则触发，依据可追溯到规则结论（ruleFindingRefs，I1）。
 * - `(userId,kind,period)` 幂等，同期间重复生成覆盖（防疲劳，决策 9）。
 * - message 为规则结论模板文案（非 LLM 自由文本，零幻觉）。
 */
export const smartAlerts = pgTable(
  'finance_smart_alerts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    kind: varchar('kind', { length: 40 }).$type<AlertKind>().notNull(),
    severity: varchar('severity', { length: 10 }).$type<AlertSeverity>().notNull(),
    ruleFindingRefs: jsonb('rule_finding_refs')
      .$type<AlertFindingRef[]>()
      .default([])
      .notNull(),
    /** 触发期 YYYY-MM。 */
    period: varchar('period', { length: 7 }).notNull(),
    status: varchar('status', { length: 14 })
      .$type<AlertStatus>()
      .default('active')
      .notNull(),
    message: text('message').notNull(),
    /** 静默/已读时间。 */
    dismissedAt: timestamp('dismissed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('finance_smart_alerts_user_kind_period_unique').on(
      t.userId,
      t.kind,
      t.period,
    ),
    index('finance_smart_alerts_user_status_idx').on(t.userId, t.status),
  ],
);

/**
 * 预警偏好/静默（Phase 6，FR-008）。每 `userId × kind` 一行。
 */
export const alertPreferences = pgTable(
  'finance_alert_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    kind: varchar('kind', { length: 40 }).$type<AlertKind>().notNull(),
    muted: boolean('muted').default(false).notNull(),
    /** 临时静默截止；NULL=永久/直到取消。 */
    mutedUntil: timestamp('muted_until'),
    /** 预留渠道。 */
    channel: varchar('channel', { length: 20 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('finance_alert_preferences_user_kind_unique').on(
      t.userId,
      t.kind,
    ),
  ],
);

export type SmartAlertItem = typeof smartAlerts.$inferSelect;
export type NewSmartAlert = typeof smartAlerts.$inferInsert;
export type AlertPreferenceItem = typeof alertPreferences.$inferSelect;
export type NewAlertPreference = typeof alertPreferences.$inferInsert;
