/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { approvals } from './approvals';

/** 顾问消息角色。 */
export const ADVISOR_ROLES = ['user', 'assistant'] as const;
export type AdvisorRole = (typeof ADVISOR_ROLES)[number];

/** 顾问消息引用的规则结论锚点（jsonb 快照，FR-007 / I1）。 */
export interface AdvisorSourceRef {
  metric: string;
  period: string;
  value: string | null;
  verdict: string;
  riskLevel: string;
}

/**
 * 顾问会话（Phase 6，FR-003）。按 userId 隔离（auth 用户，非 visitorId）。
 */
export const advisorSessions = pgTable(
  'finance_advisor_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    title: varchar('title', { length: 120 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('finance_advisor_sessions_user_created_idx').on(t.userId, t.createdAt)],
);

/**
 * 顾问消息（Phase 6，FR-003 / FR-007）。
 * - assistant 消息的数值结论必须能在 citedFindings 找到来源（I1）。
 * - degraded=true 时 content 为模板文本（I7）；proposalId 串联高风险审批（FR-004）。
 */
export const advisorMessages = pgTable(
  'finance_advisor_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .references(() => advisorSessions.id, { onDelete: 'cascade' })
      .notNull(),
    /** 冗余便于隔离查询（I5）。 */
    userId: text('user_id').notNull(),
    role: varchar('role', { length: 16 }).$type<AdvisorRole>().notNull(),
    content: text('content').notNull(),
    citedFindings: jsonb('cited_findings')
      .$type<AdvisorSourceRef[]>()
      .default([])
      .notNull(),
    degraded: boolean('degraded').default(false).notNull(),
    /** 本条携带的高风险提议 → finance_approvals.id（set null；FR-004 串联）。 */
    proposalId: uuid('proposal_id').references(() => approvals.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('finance_advisor_messages_session_created_idx').on(
      t.sessionId,
      t.createdAt,
    ),
  ],
);

export type AdvisorSessionItem = typeof advisorSessions.$inferSelect;
export type NewAdvisorSession = typeof advisorSessions.$inferInsert;
export type AdvisorMessageItem = typeof advisorMessages.$inferSelect;
export type NewAdvisorMessage = typeof advisorMessages.$inferInsert;
