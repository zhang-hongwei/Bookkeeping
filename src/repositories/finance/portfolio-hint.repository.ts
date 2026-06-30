/**
 * 组合优化方向数据仓库（Phase 7，US4）。按 userId 隔离。
 *
 * 随持仓重算覆盖：每次重算写入一个新 batchId 批次（旧批次保留作历史留痕/追溯，
 * data-model §2.5「便于整组覆盖与追溯」）。当前生效批次 = 最近 createdAt 的 batchId。
 */
import { and, eq, desc } from 'drizzle-orm';
import {
  portfolioHints,
  type PortfolioHintItem,
  type NewPortfolioHint,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

/** 落表用的单条方向建议（仅方向，I11）。 */
export interface PortfolioHintRecord {
  assetClass: string;
  currentRatio: string;
  targetBand: { min: number; max: number };
  direction: 'under' | 'over' | 'ok';
  reason: string;
  targetBandsVersion: string;
  engineVersion: string;
  disclaimers: string[];
}

export class PortfolioHintRepository extends FinanceRepository {
  /**
   * 整组覆盖：以新 batchId 写入本批全部 hint（共用 batchId）。
   * - 空记录 → 不写入，返回空（无持仓场景，NC6）。
   * - 旧批次行保留（按 batchId 区分）；最近 batchId 即当前生效集合。
   */
  async replaceBatch(records: PortfolioHintRecord[]): Promise<PortfolioHintItem[]> {
    const userId = this.requireUserId();
    if (records.length === 0) return [];
    const rows = await this.db
      .insert(portfolioHints)
      .values(
        records.map<NewPortfolioHint>((r) => ({
          userId,
          assetClass: r.assetClass,
          currentRatio: r.currentRatio,
          targetBand: r.targetBand,
          direction: r.direction,
          reason: r.reason,
          targetBandsVersion: r.targetBandsVersion,
          engineVersion: r.engineVersion,
          disclaimers: r.disclaimers,
        })),
      )
      .returning();
    return rows;
  }

  /** 取最近一批方向建议（按 createdAt desc 取首条 batchId，再取该批全部行）。 */
  async findLatestByUser(): Promise<{
    batchId: string;
    items: PortfolioHintItem[];
  } | null> {
    const userId = this.requireUserId();
    const [latest] = await this.db
      .select({ batchId: portfolioHints.batchId })
      .from(portfolioHints)
      .where(eq(portfolioHints.userId, userId))
      .orderBy(desc(portfolioHints.createdAt))
      .limit(1);
    if (!latest) return null;
    const items = await this.db
      .select()
      .from(portfolioHints)
      .where(
        and(
          eq(portfolioHints.userId, userId),
          eq(portfolioHints.batchId, latest.batchId),
        ),
      );
    return { batchId: latest.batchId, items };
  }
}

export function portfolioHintRepository(userId: string): PortfolioHintRepository {
  return new PortfolioHintRepository(userId);
}
