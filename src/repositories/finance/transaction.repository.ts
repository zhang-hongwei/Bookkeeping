/**
 * 交易数据仓库（读为主）。
 *
 * - 全部操作按 userId 作用域（FR-013）。
 * - 列表/明细带分录（entries）；分录写入（记账/改/删）由 ledger.service 在事务内原子完成。
 * - 支持按账户/分类/类型/时间区间/来源筛选与分页。
 */
import { and, eq, gte, lte, inArray, desc, count } from 'drizzle-orm';
import {
  transactions,
  entries,
  type TransactionItem,
  type TransactionType,
  type TransactionSource,
  type EntryItem,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface ListTransactionsFilter {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  from?: Date;
  to?: Date;
  source?: TransactionSource;
}

export interface ListTransactionsOptions extends ListTransactionsFilter {
  page?: number; // 1-based
  pageSize?: number;
}

export interface TransactionWithEntries extends TransactionItem {
  entries: EntryItem[];
}

export class TransactionRepository extends FinanceRepository {
  /** 列表（带 entries），按 occurredAt 倒序分页。 */
  async list(
    options: ListTransactionsOptions = {},
  ): Promise<{ items: TransactionWithEntries[]; total: number; page: number }> {
    const {
      accountId,
      categoryId,
      type,
      from,
      to,
      source,
      page = 1,
      pageSize = 20,
    } = options;

    const conditions = [
      eq(transactions.userId, this.requireUserId()),
      ...(categoryId ? [eq(transactions.categoryId, categoryId)] : []),
      ...(type ? [eq(transactions.type, type)] : []),
      ...(source ? [eq(transactions.source, source)] : []),
      ...(from ? [gte(transactions.occurredAt, from)] : []),
      ...(to ? [lte(transactions.occurredAt, to)] : []),
      ...(accountId
        ? [
            inArray(
              transactions.id,
              this.db
                .select({ id: entries.transactionId })
                .from(entries)
                .where(eq(entries.accountId, accountId)),
            ),
          ]
        : []),
    ];

    const where = and(...conditions);
    const offset = Math.max(0, (page - 1) * pageSize);

    const rows = await this.db
      .select()
      .from(transactions)
      .where(where)
      .orderBy(desc(transactions.occurredAt), desc(transactions.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [totalRow] = await this.db
      .select({ total: count() })
      .from(transactions)
      .where(where);
    const total = Number(totalRow?.total ?? 0);

    const items = rows.length
      ? await this.attachEntries(rows)
      : rows.map((t) => ({ ...t, entries: [] }));
    return { items, total, page };
  }

  /** 单笔交易（带 entries，scoped）。 */
  async findById(id: string): Promise<TransactionWithEntries | null> {
    const [txn] = await this.db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.userId, this.requireUserId()),
        ),
      )
      .limit(1);
    if (!txn) return null;
    const [withEntries] = await this.attachEntries([txn]);
    return withEntries;
  }

  /** 批量为交易挂载其 entries（避免 N+1）。 */
  private async attachEntries(
    txns: TransactionItem[],
  ): Promise<TransactionWithEntries[]> {
    const ids = txns.map((t) => t.id);
    const entryRows = await this.db
      .select()
      .from(entries)
      .where(inArray(entries.transactionId, ids))
      .orderBy(entries.createdAt);
    const byTxn = new Map<string, EntryItem[]>();
    for (const e of entryRows) {
      const arr = byTxn.get(e.transactionId) ?? [];
      arr.push(e);
      byTxn.set(e.transactionId, arr);
    }
    return txns.map((t) => ({ ...t, entries: byTxn.get(t.id) ?? [] }));
  }
}

/** 工厂：绑定请求 userId 的交易仓库实例。 */
export function transactionRepository(userId: string): TransactionRepository {
  return new TransactionRepository(userId);
}
