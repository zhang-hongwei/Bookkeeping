/**
 * 家庭净资产快照仓库（Phase 4）。
 *
 * 每家庭每日一行（UNIQUE family_id+date）。镜像 net-worth.repository，但按 familyId
 * 作用域（家庭是多用户聚合，不继承单 userId 的 FinanceRepository）。
 */
import { and, eq, gte, lte, asc } from 'drizzle-orm';
import { db } from '@/database/client';
import {
  financeFamilyNetWorthSnapshots,
  type FamilyNetWorthSnapshotItem,
} from '@/database/schema/finance';

export interface FamilySnapshotUpsert {
  date: string; // YYYY-MM-DD
  totalAssets: string;
  totalLiabilities: string;
  netWorth: string;
  memberBreakdown: Record<string, string>;
}

export class FamilyNetWorthRepository {
  /** 写/重算单日家庭快照（按 family_id+date 唯一覆盖）。 */
  async upsert(
    familyId: string,
    input: FamilySnapshotUpsert,
  ): Promise<FamilyNetWorthSnapshotItem> {
    const [row] = await db
      .insert(financeFamilyNetWorthSnapshots)
      .values({
        familyId,
        date: input.date,
        totalAssets: input.totalAssets,
        totalLiabilities: input.totalLiabilities,
        netWorth: input.netWorth,
        memberBreakdown: input.memberBreakdown,
      })
      .onConflictDoUpdate({
        target: [
          financeFamilyNetWorthSnapshots.familyId,
          financeFamilyNetWorthSnapshots.date,
        ],
        set: {
          totalAssets: input.totalAssets,
          totalLiabilities: input.totalLiabilities,
          netWorth: input.netWorth,
          memberBreakdown: input.memberBreakdown,
          updatedAt: new Date(),
        },
      })
      .returning();
    return row!;
  }

  /** 区间家庭快照（按日期升序），用于家庭曲线。 */
  async findRange(
    familyId: string,
    from: string,
    to: string,
  ): Promise<FamilyNetWorthSnapshotItem[]> {
    return db
      .select()
      .from(financeFamilyNetWorthSnapshots)
      .where(
        and(
          eq(financeFamilyNetWorthSnapshots.familyId, familyId),
          gte(financeFamilyNetWorthSnapshots.date, from),
          lte(financeFamilyNetWorthSnapshots.date, to),
        ),
      )
      .orderBy(asc(financeFamilyNetWorthSnapshots.date));
  }
}

export const familyNetWorthRepository = new FamilyNetWorthRepository();
