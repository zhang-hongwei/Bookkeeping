/**
 * 投资交易语义层数据仓库（Phase 3）—— IRR 现金流 / 加权成本 / 已实现盈亏历史的真相源。
 *
 * 钱在 finance_transactions + finance_entries；本表只承载投资语义（research.md R2）。
 * 全部操作按 userId 作用域（FR-009）。
 */
import { and, asc, eq } from 'drizzle-orm';
import {
  financeInvestmentTrades,
  type InvestmentTradeItem,
  type NewInvestmentTrade,
  type TradeAction,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface CreateInvestmentTradeInput {
  positionId: string;
  action: TradeAction;
  shares?: string;
  price?: string;
  fee?: string;
  tax?: string;
  amount: string;
  transactionId?: string | null;
  dcaPlanId?: string | null;
  occurredAt?: Date;
  note?: string;
}

export class InvestmentTradeRepository extends FinanceRepository {
  /** 新增一条投资交易记录（scoped）。 */
  async create(input: CreateInvestmentTradeInput): Promise<InvestmentTradeItem> {
    const values: NewInvestmentTrade = {
      userId: this.requireUserId(),
      positionId: input.positionId,
      action: input.action,
      shares: input.shares,
      price: input.price,
      fee: input.fee,
      tax: input.tax,
      amount: input.amount,
      transactionId: input.transactionId,
      dcaPlanId: input.dcaPlanId,
      occurredAt: input.occurredAt,
      note: input.note,
    };
    const [row] = await this.db
      .insert(financeInvestmentTrades)
      .values(values)
      .returning();
    if (!row) throw new Error('投资交易写入失败');
    return row;
  }

  /** 列出某持仓的全部交易（按时间升序，IRR 现金流用，scoped）。 */
  async listByPosition(positionId: string): Promise<InvestmentTradeItem[]> {
    return this.db
      .select()
      .from(financeInvestmentTrades)
      .where(
        and(
          eq(financeInvestmentTrades.positionId, positionId),
          eq(financeInvestmentTrades.userId, this.requireUserId()),
        ),
      )
      .orderBy(asc(financeInvestmentTrades.occurredAt));
  }
}

/** 工厂：绑定请求 userId 的投资交易仓库实例。 */
export function investmentTradeRepository(userId: string): InvestmentTradeRepository {
  return new InvestmentTradeRepository(userId);
}
