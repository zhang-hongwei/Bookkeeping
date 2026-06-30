/**
 * 退休模拟数据仓库（Phase 7，US3）。按 userId 隔离。
 */
import { and, eq, desc } from 'drizzle-orm';
import {
  retirementSimulations,
  type RetirementSimulationItem,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface CreateRetirementRecord {
  assumptions: RetirementSimulationItem['assumptions'];
  horizonMonths: number;
  resultPessimistic: RetirementSimulationItem['resultPessimistic'];
  resultBaseline: RetirementSimulationItem['resultBaseline'];
  resultOptimistic: RetirementSimulationItem['resultOptimistic'];
  sustainableVerdict: RetirementSimulationItem['sustainableVerdict'];
  engineVersion: string;
  status: 'ok' | 'degraded';
  missing: string[];
  disclaimers: string[];
}

export class RetirementRepository extends FinanceRepository {
  async create(input: CreateRetirementRecord): Promise<RetirementSimulationItem> {
    const userId = this.requireUserId();
    const [row] = await this.db
      .insert(retirementSimulations)
      .values({
        userId,
        assumptions: input.assumptions,
        horizonMonths: input.horizonMonths,
        resultPessimistic: input.resultPessimistic,
        resultBaseline: input.resultBaseline,
        resultOptimistic: input.resultOptimistic,
        sustainableVerdict: input.sustainableVerdict,
        engineVersion: input.engineVersion,
        status: input.status,
        missing: input.missing,
        disclaimers: input.disclaimers,
      })
      .returning();
    if (!row) throw new Error('写入退休模拟失败');
    return row;
  }

  async findLatestByUser(): Promise<RetirementSimulationItem | null> {
    const [row] = await this.db
      .select()
      .from(retirementSimulations)
      .where(eq(retirementSimulations.userId, this.requireUserId()))
      .orderBy(desc(retirementSimulations.createdAt))
      .limit(1);
    return row ?? null;
  }

  async findById(id: string): Promise<RetirementSimulationItem | null> {
    const [row] = await this.db
      .select()
      .from(retirementSimulations)
      .where(
        and(
          eq(retirementSimulations.id, id),
          eq(retirementSimulations.userId, this.requireUserId()),
        ),
      )
      .limit(1);
    return row ?? null;
  }
}

export function retirementRepository(userId: string): RetirementRepository {
  return new RetirementRepository(userId);
}
