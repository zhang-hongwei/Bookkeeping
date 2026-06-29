/**
 * 负债明细数据仓库（Phase 2）—— 1:1 挂 credit / 贷款账户。
 *
 * 全部操作按 userId 作用域（FR-009）。`account_id` UNIQUE，用 upsert 维护 1:1。
 * 负债「剩余本金 / 当前欠款」不在此表（= 关联账户 balance）。
 */
import { and, eq, sql } from 'drizzle-orm';
import {
  financeLiabilityDetails,
  type LiabilityDetailItem,
  type NewLiabilityDetail,
  type LiabilityKind,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface UpsertLiabilityDetailInput {
  accountId: string;
  kind: LiabilityKind;
  principal?: string;
  interestRate?: string | null;
  monthlyPayment?: string | null;
  dueDate?: string | null;
  paidAmount?: string;
  statementDay?: number | null;
  repaymentDay?: number | null;
}

export interface UpdateLiabilityDetailPatch {
  kind?: LiabilityKind;
  interestRate?: string | null;
  monthlyPayment?: string | null;
  dueDate?: string | null;
  statementDay?: number | null;
  repaymentDay?: number | null;
}

export class LiabilityDetailRepository extends FinanceRepository {
  /** upsert：按 account_id（UNIQUE）插入或更新明细。 */
  async upsertByAccountId(
    input: UpsertLiabilityDetailInput,
  ): Promise<LiabilityDetailItem> {
    const values: NewLiabilityDetail = {
      userId: this.requireUserId(),
      accountId: input.accountId,
      kind: input.kind,
      principal: input.principal,
      interestRate: input.interestRate,
      monthlyPayment: input.monthlyPayment,
      dueDate: input.dueDate,
      paidAmount: input.paidAmount,
      statementDay: input.statementDay,
      repaymentDay: input.repaymentDay,
    };
    const { accountId: _accountId, userId: _userId, ...set } = values;
    void _accountId;
    void _userId;
    const [row] = await this.db
      .insert(financeLiabilityDetails)
      .values(values)
      .onConflictDoUpdate({
        target: financeLiabilityDetails.accountId,
        set: { ...set, updatedAt: new Date() },
      })
      .returning();
    if (!row) throw new Error('负债明细 upsert 失败');
    return row;
  }

  /** 按账户 id 取明细（scoped）。 */
  async findByAccountId(accountId: string): Promise<LiabilityDetailItem | null> {
    const [row] = await this.db
      .select()
      .from(financeLiabilityDetails)
      .where(
        and(
          eq(financeLiabilityDetails.accountId, accountId),
          eq(financeLiabilityDetails.userId, this.requireUserId()),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  /** 列出该用户全部负债明细（scoped）。 */
  async list(): Promise<LiabilityDetailItem[]> {
    return this.db
      .select()
      .from(financeLiabilityDetails)
      .where(eq(financeLiabilityDetails.userId, this.requireUserId()));
  }

  /** 已还本金累加（recordRepayment 在事务内调用，scoped by account_id+user_id）。 */
  async addPaidAmount(accountId: string, principalCentsDelta: string): Promise<void> {
    await this.db
      .update(financeLiabilityDetails)
      .set({
        paidAmount: sql`${financeLiabilityDetails.paidAmount} + ${principalCentsDelta}::numeric`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(financeLiabilityDetails.accountId, accountId),
          eq(financeLiabilityDetails.userId, this.requireUserId()),
        ),
      );
  }

  /** 部分更新（scoped；不改 paidAmount——已还只能由还款交易驱动）。 */
  async update(
    accountId: string,
    patch: UpdateLiabilityDetailPatch,
  ): Promise<LiabilityDetailItem | null> {
    const [row] = await this.db
      .update(financeLiabilityDetails)
      .set({ ...patch, updatedAt: new Date() })
      .where(
        and(
          eq(financeLiabilityDetails.accountId, accountId),
          eq(financeLiabilityDetails.userId, this.requireUserId()),
        ),
      )
      .returning();
    return row ?? null;
  }
}

/** 工厂：绑定请求 userId 的负债明细仓库实例。 */
export function liabilityDetailRepository(userId: string): LiabilityDetailRepository {
  return new LiabilityDetailRepository(userId);
}
