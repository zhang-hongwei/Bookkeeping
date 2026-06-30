/**
 * 规则结论数据仓库（US3）。同 (user, period, metric) 唯一，重算覆盖。
 */
import { and, eq, inArray, asc } from 'drizzle-orm';
import { ruleFindings, type RuleFindingItem } from '@/database/schema/finance';
import { FinanceRepository } from './base';
import type { FindingData } from '@/services/finance/rules-engine.service';
import type { PeriodRange } from '@/services/finance/rules-engine.service';

export class FindingRepository extends FinanceRepository {
  /** 写/重算某周期全部 findings（按 metric 唯一覆盖，绑定 reportId）。 */
  async upsertForPeriod(
    findings: FindingData[],
    period: PeriodRange,
    reportId: string,
  ): Promise<void> {
    const userId = this.requireUserId();
    for (const f of findings) {
      await this.db
        .insert(ruleFindings)
        .values({
          userId,
          periodStart: period.start,
          periodEnd: period.end,
          metric: f.metric,
          value: f.value,
          verdict: f.verdict,
          riskLevel: f.riskLevel,
          reportId,
        })
        .onConflictDoUpdate({
          target: [
            ruleFindings.userId,
            ruleFindings.periodStart,
            ruleFindings.periodEnd,
            ruleFindings.metric,
          ],
          set: {
            value: f.value,
            verdict: f.verdict,
            riskLevel: f.riskLevel,
            reportId,
          },
        });
    }
  }

  /** 某周期 findings。 */
  async findByPeriod(period: PeriodRange): Promise<RuleFindingItem[]> {
    return this.db
      .select()
      .from(ruleFindings)
      .where(
        and(
          eq(ruleFindings.userId, this.requireUserId()),
          eq(ruleFindings.periodStart, period.start),
          eq(ruleFindings.periodEnd, period.end),
        ),
      );
  }

  /**
   * 多周期 findings（按 periodStart 升序）。Phase 6 趋势对比（决策 13）只读复用：
   * 传入报告周期起始日集合，取这些周期的全部 findings，供时序聚合。
   */
  async listByPeriodStarts(periodStarts: string[]): Promise<RuleFindingItem[]> {
    if (periodStarts.length === 0) return [];
    return this.db
      .select()
      .from(ruleFindings)
      .where(
        and(
          eq(ruleFindings.userId, this.requireUserId()),
          inArray(ruleFindings.periodStart, periodStarts),
        ),
      )
      .orderBy(asc(ruleFindings.periodStart));
  }
}

export function findingRepository(userId: string): FindingRepository {
  return new FindingRepository(userId);
}
