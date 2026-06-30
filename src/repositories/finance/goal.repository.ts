/**
 * 储蓄目标数据仓库（Phase 5）。按 userId 隔离。
 * currentAmount / progressRate / eta 均为派生（service 层），本仓库只管设置 CRUD。
 */
import { and, eq } from 'drizzle-orm';
import {
  goals,
  type GoalItem,
  type GoalProgressBasis,
  type GoalStatus,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface CreateGoalInput {
  name: string;
  targetAmount: string;
  targetDate?: string | null;
  progressBasis?: GoalProgressBasis;
  linkedAccountIds?: string[];
  manualAmount?: string;
  notes?: string | null;
}

export interface UpdateGoalPatch {
  name?: string;
  targetAmount?: string;
  targetDate?: string | null;
  progressBasis?: GoalProgressBasis;
  linkedAccountIds?: string[];
  manualAmount?: string;
  notes?: string | null;
  status?: GoalStatus;
  completedAt?: Date | null;
}

export class GoalRepository extends FinanceRepository {
  async create(input: CreateGoalInput): Promise<GoalItem> {
    const [row] = await this.db
      .insert(goals)
      .values({
        userId: this.requireUserId(),
        name: input.name,
        targetAmount: input.targetAmount,
        targetDate: input.targetDate ?? null,
        progressBasis: input.progressBasis ?? 'manual',
        linkedAccountIds: input.linkedAccountIds ?? [],
        manualAmount: input.manualAmount ?? '0',
        notes: input.notes ?? null,
      })
      .returning();
    if (!row) throw new Error('创建目标失败');
    return row;
  }

  async findById(id: string): Promise<GoalItem | null> {
    const [row] = await this.db
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, this.requireUserId())))
      .limit(1);
    return row ?? null;
  }

  async listByUser(opts: { status?: GoalStatus } = {}): Promise<GoalItem[]> {
    const conds = [eq(goals.userId, this.requireUserId())];
    if (opts.status) conds.push(eq(goals.status, opts.status));
    return this.db.select().from(goals).where(and(...conds));
  }

  async update(id: string, patch: UpdateGoalPatch): Promise<GoalItem | null> {
    const [row] = await this.db
      .update(goals)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(goals.id, id), eq(goals.userId, this.requireUserId())))
      .returning();
    return row ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, this.requireUserId())));
  }
}

export function goalRepository(userId: string): GoalRepository {
  return new GoalRepository(userId);
}
