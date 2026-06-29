/**
 * 资产明细数据仓库（Phase 2）—— 1:1 挂 real_asset / investment 账户。
 *
 * 全部操作按 userId 作用域（FR-009）。`account_id` UNIQUE，用 upsert 维护 1:1。
 * 资产「当前价值」不在此表（= 关联账户 balance，由分录维护）。
 */
import { and, eq } from 'drizzle-orm';
import {
  financeAssetDetails,
  type AssetDetailItem,
  type NewAssetDetail,
  type EstimateConfidence,
  type ValuationSource,
  type ValuationHistoryEntry,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface UpsertAssetDetailInput {
  accountId: string;
  costBasis?: string;
  valuationSource?: ValuationSource;
  estimateConfidence?: EstimateConfidence;
  valuationDate?: string | null;
  valuationHistory?: ValuationHistoryEntry[];
  isDisposed?: boolean;
}

export interface UpdateAssetDetailPatch {
  costBasis?: string;
  valuationSource?: ValuationSource;
  estimateConfidence?: EstimateConfidence;
  valuationDate?: string | null;
  valuationHistory?: ValuationHistoryEntry[];
  isDisposed?: boolean;
}

export class AssetDetailRepository extends FinanceRepository {
  /** upsert：按 account_id（UNIQUE）插入或更新明细。 */
  async upsertByAccountId(input: UpsertAssetDetailInput): Promise<AssetDetailItem> {
    const values: NewAssetDetail = {
      userId: this.requireUserId(),
      accountId: input.accountId,
      costBasis: input.costBasis,
      valuationSource: input.valuationSource,
      estimateConfidence: input.estimateConfidence,
      valuationDate: input.valuationDate,
      valuationHistory: input.valuationHistory,
      isDisposed: input.isDisposed,
    };
    const { accountId: _accountId, userId: _userId, ...set } = values;
    void _accountId;
    void _userId;
    const [row] = await this.db
      .insert(financeAssetDetails)
      .values(values)
      .onConflictDoUpdate({
        target: financeAssetDetails.accountId,
        set: { ...set, updatedAt: new Date() },
      })
      .returning();
    if (!row) throw new Error('资产明细 upsert 失败');
    return row;
  }

  /** 按账户 id 取明细（scoped）。 */
  async findByAccountId(accountId: string): Promise<AssetDetailItem | null> {
    const [row] = await this.db
      .select()
      .from(financeAssetDetails)
      .where(
        and(
          eq(financeAssetDetails.accountId, accountId),
          eq(financeAssetDetails.userId, this.requireUserId()),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  /** 列出该用户全部资产明细（scoped）。 */
  async list(): Promise<AssetDetailItem[]> {
    return this.db
      .select()
      .from(financeAssetDetails)
      .where(eq(financeAssetDetails.userId, this.requireUserId()));
  }

  /** 部分更新（scoped）。 */
  async update(
    accountId: string,
    patch: UpdateAssetDetailPatch,
  ): Promise<AssetDetailItem | null> {
    const [row] = await this.db
      .update(financeAssetDetails)
      .set({ ...patch, updatedAt: new Date() })
      .where(
        and(
          eq(financeAssetDetails.accountId, accountId),
          eq(financeAssetDetails.userId, this.requireUserId()),
        ),
      )
      .returning();
    return row ?? null;
  }
}

/** 工厂：绑定请求 userId 的资产明细仓库实例。 */
export function assetDetailRepository(userId: string): AssetDetailRepository {
  return new AssetDetailRepository(userId);
}
