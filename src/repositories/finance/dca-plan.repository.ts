/**
 * 定投计划数据仓库（Phase 3，US3）—— 仅配置/标记，不自动生成交易。
 * 全部操作按 userId 作用域（FR-009）。
 */
import { eq } from 'drizzle-orm';
import {
  financeDcaPlans,
  type DcaPlanItem,
  type NewDcaPlan,
  type InstrumentType,
  type DcaFrequency,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface CreateDcaPlanInput {
  instrumentCode: string;
  instrumentType: InstrumentType;
  amount?: string;
  frequency?: DcaFrequency;
  dayOfPeriod?: number;
  cashAccountId?: string | null;
  active?: boolean;
}

export class DcaPlanRepository extends FinanceRepository {
  async create(input: CreateDcaPlanInput): Promise<DcaPlanItem> {
    const values: NewDcaPlan = {
      userId: this.requireUserId(),
      instrumentCode: input.instrumentCode,
      instrumentType: input.instrumentType,
      amount: input.amount,
      frequency: input.frequency,
      dayOfPeriod: input.dayOfPeriod,
      cashAccountId: input.cashAccountId,
      active: input.active,
    };
    const [row] = await this.db.insert(financeDcaPlans).values(values).returning();
    if (!row) throw new Error('定投计划创建失败');
    return row;
  }

  async list(): Promise<DcaPlanItem[]> {
    return this.db
      .select()
      .from(financeDcaPlans)
      .where(eq(financeDcaPlans.userId, this.requireUserId()));
  }

  async setActive(id: string, active: boolean): Promise<DcaPlanItem | null> {
    const [row] = await this.db
      .update(financeDcaPlans)
      .set({ active, updatedAt: new Date() })
      .where(eq(financeDcaPlans.id, id))
      .returning();
    return row ?? null;
  }
}

/** 工厂：绑定请求 userId 的定投计划仓库实例。 */
export function dcaPlanRepository(userId: string): DcaPlanRepository {
  return new DcaPlanRepository(userId);
}
