/**
 * 审批仓库（Phase 6，FR-004）。按 userId 隔离。
 * 状态机转换由 approval.service 守卫；本仓库提供 CRUD + 乐观更新（按 id+userId）。
 */
import { and, eq, desc, inArray } from 'drizzle-orm';
import {
  approvals,
  type ApprovalItem,
  type ApprovalKind,
  type ApprovalStatus,
  type RuleValidation,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface CreateApprovalInput {
  kind: ApprovalKind;
  payload: Record<string, unknown>;
  ruleValidation: RuleValidation;
  status: ApprovalStatus;
  proposedBy?: string | null;
  expiresAt: Date;
}

export type ApprovalUpdate = Partial<{
  status: ApprovalStatus;
  ruleValidation: RuleValidation;
  approvedAt: Date | null;
  appliedAt: Date | null;
  appliedResult: Record<string, unknown> | null;
}>;

export class ApprovalRepository extends FinanceRepository {
  async create(input: CreateApprovalInput): Promise<ApprovalItem> {
    const [row] = await this.db
      .insert(approvals)
      .values({
        userId: this.requireUserId(),
        kind: input.kind,
        payload: input.payload,
        ruleValidation: input.ruleValidation,
        status: input.status,
        proposedBy: input.proposedBy ?? null,
        expiresAt: input.expiresAt,
      })
      .returning();
    return row!;
  }

  async findById(id: string): Promise<ApprovalItem | null> {
    const [row] = await this.db
      .select()
      .from(approvals)
      .where(and(eq(approvals.id, id), eq(approvals.userId, this.requireUserId())))
      .limit(1);
    return row ?? null;
  }

  async list(status?: ApprovalStatus | 'all'): Promise<ApprovalItem[]> {
    const conditions = [eq(approvals.userId, this.requireUserId())];
    if (status && status !== 'all') {
      conditions.push(eq(approvals.status, status));
    }
    return this.db
      .select()
      .from(approvals)
      .where(and(...conditions))
      .orderBy(desc(approvals.createdAt));
  }

  /** 通用更新（状态转换 + 时间戳 + 结果）；按 id+userId 作用域。 */
  async update(id: string, patch: ApprovalUpdate): Promise<ApprovalItem | null> {
    const [row] = await this.db
      .update(approvals)
      .set({ ...patch, updatedAt: new Date() })
      .where(
        and(eq(approvals.id, id), eq(approvals.userId, this.requireUserId())),
      )
      .returning();
    return row ?? null;
  }

  /**
   * 乐观状态转换：仅当当前状态属于 `from` 集合时更新为 `to`。
   * 返回更新后的行（成功）或 null（状态不匹配/不存在）——供服务层守卫状态机。
   */
  async transitionIf(
    id: string,
    from: ApprovalStatus[],
    to: ApprovalStatus,
    extra?: ApprovalUpdate,
  ): Promise<ApprovalItem | null> {
    const userId = this.requireUserId();
    const [row] = await this.db
      .update(approvals)
      .set({ ...(extra ?? {}), status: to, updatedAt: new Date() })
      .where(
        and(
          eq(approvals.id, id),
          eq(approvals.userId, userId),
          inArray(approvals.status, from),
        ),
      )
      .returning();
    return row ?? null;
  }
}

export function approvalRepository(userId: string): ApprovalRepository {
  return new ApprovalRepository(userId);
}
