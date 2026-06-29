/**
 * 投资品种（行情缓存）数据仓库（Phase 3）—— UNIQUE(userId, code)。
 *
 * 行情缓存由 `market-data.service` 维护；失败/超 TTL 时置 `isStale` 并降级为手动输入。
 */
import { and, eq } from 'drizzle-orm';
import {
  financeInstruments,
  type InstrumentItem,
  type NewInstrument,
  type InstrumentType,
  type ValuationSource,
  type InstrumentMeta,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface UpsertInstrumentInput {
  code: string;
  type: InstrumentType;
  name?: string;
  latestPrice?: string | null;
  priceSource?: ValuationSource;
  priceUpdatedAt?: Date | null;
  isStale?: boolean;
  currency?: string;
  meta?: InstrumentMeta | null;
}

export class InstrumentRepository extends FinanceRepository {
  /** upsert：按 (userId, code) 插入或更新品种行情缓存。 */
  async upsertByCode(input: UpsertInstrumentInput): Promise<InstrumentItem> {
    const values: NewInstrument = {
      userId: this.requireUserId(),
      code: input.code,
      type: input.type,
      name: input.name,
      latestPrice: input.latestPrice,
      priceSource: input.priceSource,
      priceUpdatedAt: input.priceUpdatedAt,
      isStale: input.isStale,
      currency: input.currency,
      meta: input.meta,
    };
    const { userId: _userId, ...set } = values;
    void _userId;
    const [row] = await this.db
      .insert(financeInstruments)
      .values(values)
      .onConflictDoUpdate({
        target: [financeInstruments.userId, financeInstruments.code],
        set: { ...set, updatedAt: new Date() },
      })
      .returning();
    if (!row) throw new Error('品种行情 upsert 失败');
    return row;
  }

  /** 按 code 取品种行情（scoped）。 */
  async findByCode(code: string): Promise<InstrumentItem | null> {
    const [row] = await this.db
      .select()
      .from(financeInstruments)
      .where(
        and(
          eq(financeInstruments.code, code),
          eq(financeInstruments.userId, this.requireUserId()),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  /** 列出品种行情（scoped，可按类型过滤）。 */
  async list(opts?: { type?: InstrumentType }): Promise<InstrumentItem[]> {
    const filters = [eq(financeInstruments.userId, this.requireUserId())];
    if (opts?.type) filters.push(eq(financeInstruments.type, opts.type));
    return this.db.select().from(financeInstruments).where(and(...filters));
  }
}

/** 工厂：绑定请求 userId 的品种仓库实例。 */
export function instrumentRepository(userId: string): InstrumentRepository {
  return new InstrumentRepository(userId);
}
