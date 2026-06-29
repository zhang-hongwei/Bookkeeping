/**
 * 净资产快照数据仓库（US1）。
 *
 * 每用户每日一行（UNIQUE user_id+date）。upsert 用于写/重算；range 用于曲线；
 * 全部按 userId 作用域。
 */
import { and, eq, gte, lte, asc, sql } from 'drizzle-orm';
import {
  netWorthSnapshots,
  type NetWorthSnapshotItem,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface SnapshotUpsert {
  date: string; // YYYY-MM-DD
  totalAssets: string;
  totalLiabilities: string;
  netWorth: string;
  breakdown: Record<string, string>;
}

export class NetWorthRepository extends FinanceRepository {
  /** 写/重算单日快照（按 user_id+date 唯一覆盖）。 */
  async upsert(input: SnapshotUpsert): Promise<NetWorthSnapshotItem> {
    const [row] = await this.db
      .insert(netWorthSnapshots)
      .values({
        userId: this.requireUserId(),
        date: input.date,
        totalAssets: input.totalAssets,
        totalLiabilities: input.totalLiabilities,
        netWorth: input.netWorth,
        breakdown: input.breakdown,
      })
      .onConflictDoUpdate({
        target: [netWorthSnapshots.userId, netWorthSnapshots.date],
        set: {
          totalAssets: input.totalAssets,
          totalLiabilities: input.totalLiabilities,
          netWorth: input.netWorth,
          breakdown: input.breakdown,
          updatedAt: new Date(),
        },
      })
      .returning();
    return row!;
  }

  /** 单日快照。 */
  async findByDate(date: string): Promise<NetWorthSnapshotItem | null> {
    const [row] = await this.db
      .select()
      .from(netWorthSnapshots)
      .where(
        and(
          eq(netWorthSnapshots.userId, this.requireUserId()),
          eq(netWorthSnapshots.date, date),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  /** 区间快照（按日期升序）。 */
  async findRange(from: string, to: string): Promise<NetWorthSnapshotItem[]> {
    return this.db
      .select()
      .from(netWorthSnapshots)
      .where(
        and(
          eq(netWorthSnapshots.userId, this.requireUserId()),
          gte(netWorthSnapshots.date, from),
          lte(netWorthSnapshots.date, to),
        ),
      )
      .orderBy(asc(netWorthSnapshots.date));
  }

  /** 用户最早/最晚快照日期（用于回填判断）。 */
  async findDateBounds(): Promise<{ min: string | null; max: string | null }> {
    const [row] = await this.db
      .select({
        min: sql<string | null>`MIN(${netWorthSnapshots.date})`,
        max: sql<string | null>`MAX(${netWorthSnapshots.date})`,
      })
      .from(netWorthSnapshots)
      .where(eq(netWorthSnapshots.userId, this.requireUserId()));
    return { min: row?.min ?? null, max: row?.max ?? null };
  }

  /** 是否已有任何快照（首次启用判断）。 */
  async hasAny(): Promise<boolean> {
    const [row] = await this.db
      .select({ one: sql<number>`1` })
      .from(netWorthSnapshots)
      .where(eq(netWorthSnapshots.userId, this.requireUserId()))
      .limit(1);
    return Boolean(row);
  }
}

export function netWorthRepository(userId: string): NetWorthRepository {
  return new NetWorthRepository(userId);
}
