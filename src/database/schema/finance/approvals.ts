/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

/** 审批动作种类白名单（FR-004 / 决策 6）。 */
export const APPROVAL_KINDS = [
  'flag_transaction_anomaly',
  'rebalance_suggestion',
  'amend_finding_override',
  'create_transaction',
] as const;
export type ApprovalKind = (typeof APPROVAL_KINDS)[number];

/** 审批状态机（FR-004 / SC-003）。 */
export const APPROVAL_STATUSES = [
  'proposed',
  'pending',
  'approved',
  'rejected',
  'applied',
  'expired',
] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

/** 审批引用的规则结论锚点（jsonb 快照，I1）。 */
export interface ApprovalSourceRef {
  metric: string;
  period: string;
  value: string | null;
  verdict: string;
  riskLevel: string;
}

/** 规则校验结论 + 依据（双校验：propose 门控 + apply 防御，决策 5）。 */
export interface RuleValidation {
  passed: boolean;
  reason?: string;
  refs: ApprovalSourceRef[];
}

/**
 * 审批闭环（Phase 6，FR-004 / SC-003）。
 * - 状态机：proposed → pending（规则校验通过）→ approved → applied（落库），
 *   及 rejected / expired 终态。
 * - 未审批绝不落库；apply 幂等（I8）；改账目动作走既有 ledger.service（I2）。
 * - proposedBy 为软引用 advisor_messages.id（避免循环 FK）。
 */
export const approvals = pgTable(
  'finance_approvals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    kind: varchar('kind', { length: 40 }).$type<ApprovalKind>().notNull(),
    /** 提议的具体变更（kind 结构化）。 */
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    ruleValidation: jsonb('rule_validation').$type<RuleValidation>().notNull(),
    status: varchar('status', { length: 12 })
      .$type<ApprovalStatus>()
      .default('proposed')
      .notNull(),
    /** 来源消息（advisor_messages.id，软引用，避免循环 FK）。 */
    proposedBy: text('proposed_by'),
    approvedAt: timestamp('approved_at'),
    appliedAt: timestamp('applied_at'),
    appliedResult: jsonb('applied_result').$type<Record<string, unknown>>(),
    /** TTL（默认 proposed + 7d）；超时 proposed/pending → expired。 */
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('finance_approvals_user_status_idx').on(t.userId, t.status)],
);

export type ApprovalItem = typeof approvals.$inferSelect;
export type NewApproval = typeof approvals.$inferInsert;
