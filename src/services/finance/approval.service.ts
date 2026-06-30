/**
 * 审批闭环服务（Phase 6，FR-004 / SC-003）。
 *
 * 从零构建的通用提议/审批管道（research.md 决策 4/5/6）：
 * - 状态机：proposed/pending →(approve)→ approved →(apply+再校验)→ applied[终]；
 *   及 rejected / expired 终态。未审批绝不落库。
 * - 双校验：propose 门控一次 + apply 防御一次（防 TOCTOU，决策 5）。
 * - 幂等：applied 终态重复 apply 为 no-op（I8）。
 * - kind 白名单驱动校验器 + apply；改账目动作（create_transaction）走既有
 *   ledger.service 平衡校验，不另起旁路（I2，不破坏 Phase 0 不变量）。
 */
import { and, eq } from 'drizzle-orm';
import { db } from '@/database/client';
import { transactions } from '@/database/schema/finance';
import {
  type ApprovalItem,
  type ApprovalKind,
  type ApprovalStatus,
  type ApprovalSourceRef,
  type RuleValidation,
} from '@/database/schema/finance';
import { approvalRepository } from '@/repositories/finance/approval.repository';
import { createTransaction } from './ledger.service';
import { LedgerInvariantError } from './ledger.service';

/** 提议 TTL（默认 7 天，决策 5 标定项）。 */
export const PROPOSAL_TTL_DAYS = 7;

/** 审批事件。 */
export type ApprovalEvent = 'approve' | 'reject' | 'apply' | 'expire';

/** apply 业务失败（未审批 / 过期 / 规则再校验失败 / 落库失败）。 */
export class ApprovalApplyError extends Error {
  constructor(
    message: string,
    public code: 'not_approved' | 'expired' | 'rule_revalidation_failed' | 'apply_failed',
  ) {
    super(message);
    this.name = 'ApprovalApplyError';
  }
}

/** 非法状态转换。 */
export class ApprovalStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApprovalStateError';
  }
}

/**
 * 纯函数：状态机转换表（data-model.md §5.1）。
 * - approve/reject：proposed|pending → approved/rejected。
 * - apply：approved → applied。
 * - expire：proposed|pending → expired。
 * 不允许的转换返回 null。
 */
export function canTransition(
  from: ApprovalStatus,
  event: ApprovalEvent,
): ApprovalStatus | null {
  if (event === 'approve' && (from === 'proposed' || from === 'pending'))
    return 'approved';
  if (event === 'reject' && (from === 'proposed' || from === 'pending'))
    return 'rejected';
  if (event === 'apply' && from === 'approved') return 'applied';
  if (event === 'expire' && (from === 'proposed' || from === 'pending'))
    return 'expired';
  return null;
}

/** 终态（不可再转换；applied 幂等除外）。 */
export function isTerminal(status: ApprovalStatus): boolean {
  return status === 'applied' || status === 'rejected' || status === 'expired';
}

// ============ kind 校验器（payload 合法性 + propose 门控）============

type PayloadValidator = (
  payload: Record<string, unknown>,
) => { passed: boolean; reason?: string };

const validateCreateTransaction: PayloadValidator = (p) => {
  const type = p.type;
  const amount = p.amount;
  if (!['income', 'expense', 'transfer'].includes(type as string))
    return { passed: false, reason: '非法交易类型' };
  if (!amount || Number(amount) <= 0)
    return { passed: false, reason: '金额必须为正' };
  if (type === 'expense' && !p.fromAccountId)
    return { passed: false, reason: '支出需要 fromAccountId' };
  if (type === 'transfer' && (!p.fromAccountId || !p.toAccountId))
    return { passed: false, reason: '转账需要双方账户' };
  if (type === 'income' && !p.toAccountId && !p.fromAccountId)
    return { passed: false, reason: '收入需要账户' };
  return { passed: true };
};

const VALIDATORS: Record<ApprovalKind, PayloadValidator> = {
  flag_transaction_anomaly: (p) =>
    p.transactionId ? { passed: true } : { passed: false, reason: '需要 transactionId' },
  rebalance_suggestion: (p) =>
    p.positionId && p.suggestion
      ? { passed: true }
      : { passed: false, reason: '需要 positionId 与 suggestion' },
  amend_finding_override: (p) =>
    p.metric && p.value != null && p.reason
      ? { passed: true }
      : { passed: false, reason: '需要 metric/value/reason' },
  create_transaction: validateCreateTransaction,
};

function runValidator(
  kind: ApprovalKind,
  payload: Record<string, unknown>,
): { passed: boolean; reason?: string } {
  return VALIDATORS[kind](payload);
}

// ============ kind apply（复用既有服务落库，不另起旁路）============

type PayloadApplier = (
  userId: string,
  payload: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

const applyFlagAnomaly: PayloadApplier = async (userId, p) => {
  await db
    .update(transactions)
    .set({ anomalyFlag: 'flagged', updatedAt: new Date() })
    .where(
      and(eq(transactions.id, String(p.transactionId)), eq(transactions.userId, userId)),
    );
  return { flagged: true, transactionId: p.transactionId };
};

const applyRecordOnly: PayloadApplier = async (_userId, p) => ({
  recorded: true,
  payload: p,
});

const applyCreateTransaction: PayloadApplier = async (userId, p) => {
  // 走既有 ledger.service：复式平衡校验（assertBalanced），不破坏 Phase 0 不变量（I2）。
  const { transaction } = await createTransaction({
    userId,
    type: p.type as 'income' | 'expense' | 'transfer',
    amount: String(p.amount),
    fromAccountId: (p.fromAccountId as string) ?? undefined,
    toAccountId: (p.toAccountId as string) ?? undefined,
    categoryId: (p.categoryId as string) ?? undefined,
    note: (p.note as string) ?? undefined,
    occurredAt: p.occurredAt ? new Date(p.occurredAt as string) : undefined,
    source: 'nl',
  });
  return { transactionId: transaction.id };
};

const APPLIERS: Record<ApprovalKind, PayloadApplier> = {
  flag_transaction_anomaly: applyFlagAnomaly,
  rebalance_suggestion: applyRecordOnly,
  amend_finding_override: applyRecordOnly,
  create_transaction: applyCreateTransaction,
};

// ============ 服务入口 ============

export interface ProposalInput {
  kind: ApprovalKind;
  payload: Record<string, unknown>;
  /** 提议依据的规则结论锚点（I1；由 advisor 上下文提供）。 */
  refs?: ApprovalSourceRef[];
  proposedBy?: string | null;
}

/** 提议：规则校验（门控）→ 落 'pending'（通过）或 'rejected'（失败）。 */
export async function propose(
  userId: string,
  input: ProposalInput,
): Promise<ApprovalItem> {
  const result = runValidator(input.kind, input.payload);
  const ruleValidation: RuleValidation = {
    passed: result.passed,
    reason: result.reason,
    refs: input.refs ?? [],
  };
  const status: ApprovalStatus = result.passed ? 'pending' : 'rejected';
  const expiresAt = new Date(Date.now() + PROPOSAL_TTL_DAYS * 24 * 60 * 60 * 1000);
  return approvalRepository(userId).create({
    kind: input.kind,
    payload: input.payload,
    ruleValidation,
    status,
    proposedBy: input.proposedBy ?? null,
    expiresAt,
  });
}

/** 批准 / 拒绝（pending|proposed → approved|rejected）。 */
export async function decideApproval(
  userId: string,
  id: string,
  decision: 'approve' | 'reject',
): Promise<ApprovalItem> {
  const repo = approvalRepository(userId);
  const approval = await repo.findById(id);
  if (!approval) return null as unknown as ApprovalItem; // 路由层判 null → 404

  // 过期先行：超期的不可批准
  if (approval.expiresAt.getTime() < Date.now() && !isTerminal(approval.status)) {
    await repo.transitionIf(id, ['proposed', 'pending'], 'expired');
    throw new ApprovalStateError('提议已过期');
  }

  const target = canTransition(approval.status, decision);
  if (!target) {
    throw new ApprovalStateError(`当前状态 ${approval.status} 不允许 ${decision}`);
  }
  const updated = await repo.transitionIf(id, ['proposed', 'pending'], target, {
    approvedAt: decision === 'approve' ? new Date() : null,
  });
  if (!updated) {
    throw new ApprovalStateError('状态转换失败（可能已被处理）');
  }
  return updated;
}

/**
 * 执行落库（幂等，I8；改账目走 ledger.service 平衡校验，I2）。
 * - applied 终态 → 返回当前态（idempotent=true）。
 * - 未 approved / 过期 / 规则再校验失败 / 落库失败 → ApprovalApplyError（路由 422）。
 */
export async function applyApproval(
  userId: string,
  id: string,
): Promise<{ approval: ApprovalItem; idempotent: boolean }> {
  const repo = approvalRepository(userId);
  const approval = await repo.findById(id);
  if (!approval) return null as unknown as { approval: ApprovalItem; idempotent: boolean };

  // 幂等：已 applied → no-op（I8）
  if (approval.status === 'applied') {
    return { approval, idempotent: true };
  }

  if (approval.status !== 'approved') {
    throw new ApprovalApplyError('提议未获批准，不可落库', 'not_approved');
  }

  // 过期
  if (approval.expiresAt.getTime() < Date.now()) {
    await repo.transitionIf(id, ['approved'], 'expired');
    throw new ApprovalApplyError('提议已过期', 'expired');
  }

  // 防御性再校验（决策 5，防 TOCTOU）
  const revalidation = runValidator(approval.kind, approval.payload);
  if (!revalidation.passed) {
    await repo.update(id, {
      status: 'rejected',
      ruleValidation: { ...approval.ruleValidation, passed: false, reason: revalidation.reason },
    });
    throw new ApprovalApplyError(
      `规则再校验失败：${revalidation.reason ?? ''}`,
      'rule_revalidation_failed',
    );
  }

  // 落库（kind 驱动；create_transaction 走 ledger 平衡校验）
  try {
    const appliedResult = await APPLIERS[approval.kind](userId, approval.payload);
    const updated = await repo.transitionIf(id, ['approved'], 'applied', {
      appliedAt: new Date(),
      appliedResult,
    });
    if (!updated) {
      // 已被并发处理（如已 applied）→ 重读返回
      const current = await repo.findById(id);
      return { approval: current!, idempotent: true };
    }
    return { approval: updated, idempotent: false };
  } catch (err) {
    if (err instanceof LedgerInvariantError) {
      await repo.update(id, {
        status: 'rejected',
        ruleValidation: { ...approval.ruleValidation, passed: false, reason: err.message },
      });
      throw new ApprovalApplyError(`落库失败（复式平衡）：${err.message}`, 'apply_failed');
    }
    throw err;
  }
}

/** 把超时的 proposed/pending 标记为 expired（best-effort，列表前调用）。 */
export async function expireOverdue(userId: string): Promise<void> {
  const repo = approvalRepository(userId);
  const overdue = await repo.list('pending');
  const now = Date.now();
  for (const a of overdue) {
    if (a.expiresAt.getTime() < now) {
      await repo.transitionIf(a.id, ['proposed', 'pending'], 'expired');
    }
  }
  // proposed 也可能超时（propose 落 pending，故仅需扫 pending；保留以备扩展）
}

/** 详情。 */
export async function getApproval(
  userId: string,
  id: string,
): Promise<ApprovalItem | null> {
  return approvalRepository(userId).findById(id);
}

/** 列表（先清理过期）。 */
export async function listApprovals(
  userId: string,
  status?: ApprovalStatus | 'all',
): Promise<ApprovalItem[]> {
  await expireOverdue(userId);
  return approvalRepository(userId).list(status);
}
