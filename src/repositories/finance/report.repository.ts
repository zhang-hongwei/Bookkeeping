/**
 * AI 月报数据仓库（US3）。按 userId 隔离。
 */
import { and, eq, desc } from 'drizzle-orm';
import {
  aiReports,
  type AiReportItem,
  type ReportDimensions,
  type ReportStatus,
  type ReportType,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';
import type { PeriodRange } from '@/services/finance/rules-engine.service';

export interface CreateReportInput {
  type?: ReportType;
  periodStart: string;
  periodEnd: string;
  score: string | null;
  dimensions: ReportDimensions | null;
  status: ReportStatus;
  sourceDataHash: string;
  content: string | null;
}

export class ReportRepository extends FinanceRepository {
  async create(input: CreateReportInput): Promise<AiReportItem> {
    const [row] = await this.db
      .insert(aiReports)
      .values({
        userId: this.requireUserId(),
        type: input.type ?? 'monthly',
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        score: input.score,
        dimensions: input.dimensions,
        status: input.status,
        sourceDataHash: input.sourceDataHash,
        content: input.content,
      })
      .returning();
    return row!;
  }

  async findById(id: string): Promise<AiReportItem | null> {
    const [row] = await this.db
      .select()
      .from(aiReports)
      .where(and(eq(aiReports.id, id), eq(aiReports.userId, this.requireUserId())))
      .limit(1);
    return row ?? null;
  }

  async list(period?: PeriodRange): Promise<AiReportItem[]> {
    const conditions = [eq(aiReports.userId, this.requireUserId())];
    const where =
      period && period.start && period.end
        ? and(
            ...conditions,
            eq(aiReports.periodStart, period.start),
            eq(aiReports.periodEnd, period.end),
          )
        : and(...conditions);
    return this.db.select().from(aiReports).where(where).orderBy(desc(aiReports.generatedAt));
  }

  async updateStatus(id: string, status: ReportStatus): Promise<void> {
    await this.db
      .update(aiReports)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(aiReports.id, id), eq(aiReports.userId, this.requireUserId())));
  }
}

export function reportRepository(userId: string): ReportRepository {
  return new ReportRepository(userId);
}
