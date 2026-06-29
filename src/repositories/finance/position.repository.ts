/**
 * 投资持仓数据仓库（Phase 3）—— 1:1 挂 investment 账户。
 *
 * 全部操作按 userId 作用域（FR-009）。`account_id` UNIQUE，用 upsert 维护 1:1。
 * 持仓「市值」不在此表（= 关联账户 balance，由分录维护）。
 */
import { and, eq, ne } from 'drizzle-orm';
import {
  financePositions,
  type PositionItem,
  type NewPosition,
  type InstrumentType,
  type ValuationSource,
  type EstimateConfidence,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface UpsertPositionInput {
  accountId: string;
  instrumentCode: string;
  instrumentType: InstrumentType;
  quantity?: string;
  costPrice?: string;
  currentPrice?: string;
  priceSource?: ValuationSource;
  lastPriceAt?: Date | null;
  currency?: string;
  estimateConfidence?: EstimateConfidence;
  isClosed?: boolean;
}

export interface UpdatePositionPatch {
  quantity?: string;
  costPrice?: string;
  currentPrice?: string;
  priceSource?: ValuationSource;
  lastPriceAt?: Date | null;
  estimateConfidence?: EstimateConfidence;
  isClosed?: boolean;
}

export class PositionRepository extends FinanceRepository {
  /** upsert：按 account_id（UNIQUE）插入或更新持仓。 */
  async upsertByAccountId(input: UpsertPositionInput): Promise<PositionItem> {
    const values: NewPosition = {
      userId: this.requireUserId(),
      accountId: input.accountId,
      instrumentCode: input.instrumentCode,
      instrumentType: input.instrumentType,
      quantity: input.quantity,
      costPrice: input.costPrice,
      currentPrice: input.currentPrice,
      priceSource: input.priceSource,
      lastPriceAt: input.lastPriceAt,
      currency: input.currency,
      estimateConfidence: input.estimateConfidence,
      isClosed: input.isClosed,
    };
    const { accountId: _accountId, userId: _userId, ...set } = values;
    void _accountId;
    void _userId;
    const [row] = await this.db
      .insert(financePositions)
      .values(values)
      .onConflictDoUpdate({
        target: financePositions.accountId,
        set: { ...set, updatedAt: new Date() },
      })
      .returning();
    if (!row) throw new Error('持仓 upsert 失败');
    return row;
  }

  /** 按账户 id 取持仓（scoped）。 */
  async findByAccountId(accountId: string): Promise<PositionItem | null> {
    const [row] = await this.db
      .select()
      .from(financePositions)
      .where(
        and(
          eq(financePositions.accountId, accountId),
          eq(financePositions.userId, this.requireUserId()),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  /** 按持仓 id 取持仓（scoped）。 */
  async findById(positionId: string): Promise<PositionItem | null> {
    const [row] = await this.db
      .select()
      .from(financePositions)
      .where(
        and(
          eq(financePositions.id, positionId),
          eq(financePositions.userId, this.requireUserId()),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  /** 列出该用户持仓（scoped，可按类型/是否已平仓过滤）。 */
  async list(opts?: {
    instrumentType?: InstrumentType;
    includeClosed?: boolean;
  }): Promise<PositionItem[]> {
    const includeClosed = opts?.includeClosed ?? false;
    const filters = [eq(financePositions.userId, this.requireUserId())];
    if (opts?.instrumentType) filters.push(eq(financePositions.instrumentType, opts.instrumentType));
    if (!includeClosed) filters.push(ne(financePositions.isClosed, true));
    return this.db
      .select()
      .from(financePositions)
      .where(and(...filters));
  }

  /** 部分更新（scoped）。 */
  async update(
    positionId: string,
    patch: UpdatePositionPatch,
  ): Promise<PositionItem | null> {
    const [row] = await this.db
      .update(financePositions)
      .set({ ...patch, updatedAt: new Date() })
      .where(
        and(
          eq(financePositions.id, positionId),
          eq(financePositions.userId, this.requireUserId()),
        ),
      )
      .returning();
    return row ?? null;
  }
}

/** 工厂：绑定请求 userId 的持仓仓库实例。 */
export function positionRepository(userId: string): PositionRepository {
  return new PositionRepository(userId);
}
