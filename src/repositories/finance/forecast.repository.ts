/**
 * 现金流预测缓存仓库（Phase 6，FR-001）。按 userId 隔离。
 * (userId, targetMonth) 幂等覆盖——同月重算不堆积。
 */
import { and, eq } from 'drizzle-orm';
import {
  cashFlowForecasts,
  type CashFlowForecastItem,
  type ForecastSeries,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface UpsertForecastInput {
  targetMonth: string;
  series: ForecastSeries;
  insufficientHistory: boolean;
}

export class ForecastRepository extends FinanceRepository {
  /** 写/重算某基准月预测（按 userId+targetMonth 唯一覆盖）。 */
  async upsert(input: UpsertForecastInput): Promise<CashFlowForecastItem> {
    const [row] = await this.db
      .insert(cashFlowForecasts)
      .values({
        userId: this.requireUserId(),
        targetMonth: input.targetMonth,
        series: input.series,
        insufficientHistory: input.insufficientHistory,
      })
      .onConflictDoUpdate({
        target: [cashFlowForecasts.userId, cashFlowForecasts.targetMonth],
        set: {
          series: input.series,
          insufficientHistory: input.insufficientHistory,
          generatedAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();
    return row!;
  }

  /** 读取某基准月预测缓存。 */
  async findByTargetMonth(targetMonth: string): Promise<CashFlowForecastItem | null> {
    const [row] = await this.db
      .select()
      .from(cashFlowForecasts)
      .where(
        and(
          eq(cashFlowForecasts.userId, this.requireUserId()),
          eq(cashFlowForecasts.targetMonth, targetMonth),
        ),
      )
      .limit(1);
    return row ?? null;
  }
}

export function forecastRepository(userId: string): ForecastRepository {
  return new ForecastRepository(userId);
}
