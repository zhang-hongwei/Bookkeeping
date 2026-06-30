/**
 * 个税估算数据仓库（Phase 7，US2）。按 userId 隔离。
 */
import { and, eq, desc } from 'drizzle-orm';
import {
  taxEstimates,
  type TaxEstimateItem,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface CreateTaxEstimateRecord {
  taxYear: number;
  ruleVintage: string;
  inputs: TaxEstimateItem['inputs'];
  methodComparison: TaxEstimateItem['methodComparison'];
  totalTaxAmount: string;
  effectiveRate: string | null;
  hints: TaxEstimateItem['hints'];
  engineVersion: string;
  status: 'ok' | 'degraded';
  missing: string[];
  disclaimers: string[];
}

export class TaxEstimateRepository extends FinanceRepository {
  async create(input: CreateTaxEstimateRecord): Promise<TaxEstimateItem> {
    const userId = this.requireUserId();
    const [row] = await this.db
      .insert(taxEstimates)
      .values({
        userId,
        taxYear: input.taxYear,
        ruleVintage: input.ruleVintage,
        inputs: input.inputs,
        methodComparison: input.methodComparison,
        totalTaxAmount: input.totalTaxAmount,
        effectiveRate: input.effectiveRate,
        hints: input.hints,
        engineVersion: input.engineVersion,
        status: input.status,
        missing: input.missing,
        disclaimers: input.disclaimers,
      })
      .returning();
    if (!row) throw new Error('写入个税估算失败');
    return row;
  }

  /** 取某用户某年最近一次估算（无则 null）。 */
  async findLatestByUserAndYear(taxYear: number): Promise<TaxEstimateItem | null> {
    const [row] = await this.db
      .select()
      .from(taxEstimates)
      .where(
        and(
          eq(taxEstimates.userId, this.requireUserId()),
          eq(taxEstimates.taxYear, taxYear),
        ),
      )
      .orderBy(desc(taxEstimates.createdAt))
      .limit(1);
    return row ?? null;
  }

  async findById(id: string): Promise<TaxEstimateItem | null> {
    const [row] = await this.db
      .select()
      .from(taxEstimates)
      .where(
        and(eq(taxEstimates.id, id), eq(taxEstimates.userId, this.requireUserId())),
      )
      .limit(1);
    return row ?? null;
  }
}

export function taxEstimateRepository(userId: string): TaxEstimateRepository {
  return new TaxEstimateRepository(userId);
}
