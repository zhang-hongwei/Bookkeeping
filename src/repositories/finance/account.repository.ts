/**
 * 资金账户数据仓库。
 *
 * - 全部操作按 userId 作用域（FR-013）。
 * - 建账时 `balance` 初始化为 `openingBalance`（opening_balance 为账目起始值，
 *   不作为分录入账；balance = opening + Σ(entries)，见 balance.service）。
 * - 列表默认排除归档账户（includeArchived=false 时）。
 */
import { and, eq, sql } from 'drizzle-orm';
import {
  financeAccounts,
  entries,
  type AccountItem,
  type AccountType,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  openingBalance: string;
  currency?: string;
  creditLimit?: string | null;
  includeInNetWorth?: boolean;
}

export interface ListAccountsOptions {
  type?: AccountType;
  includeArchived?: boolean;
}

export interface UpdateAccountPatch {
  name?: string;
  isArchived?: boolean;
  includeInNetWorth?: boolean;
  creditLimit?: string | null;
}

export class AccountRepository extends FinanceRepository {
  /** 建账：balance 初始化为 openingBalance。 */
  async create(input: CreateAccountInput): Promise<AccountItem> {
    const [account] = await this.db
      .insert(financeAccounts)
      .values({
        userId: this.requireUserId(),
        name: input.name,
        type: input.type,
        currency: input.currency ?? 'CNY',
        openingBalance: input.openingBalance,
        balance: input.openingBalance,
        creditLimit: input.creditLimit ?? null,
        includeInNetWorth: input.includeInNetWorth ?? true,
      })
      .returning();
    if (!account) throw new Error('创建账户失败');
    return account;
  }

  /** 列表（带余额），默认排除归档账户。 */
  async list(options: ListAccountsOptions = {}): Promise<AccountItem[]> {
    const { type, includeArchived = false } = options;
    const conditions = [eq(financeAccounts.userId, this.requireUserId())];
    if (type) conditions.push(eq(financeAccounts.type, type));
    if (!includeArchived) conditions.push(eq(financeAccounts.isArchived, false));

    return this.db
      .select()
      .from(financeAccounts)
      .where(and(...conditions))
      .orderBy(financeAccounts.createdAt);
  }

  /** 单个账户（scoped，越权返回 null，不泄露存在性）。 */
  async findById(id: string): Promise<AccountItem | null> {
    const [account] = await this.db
      .select()
      .from(financeAccounts)
      .where(
        and(
          eq(financeAccounts.id, id),
          eq(financeAccounts.userId, this.requireUserId()),
        ),
      )
      .limit(1);
    return account ?? null;
  }

  /** 更新（不改 balance；余额只能由交易驱动）。 */
  async update(id: string, patch: UpdateAccountPatch): Promise<AccountItem | null> {
    const [account] = await this.db
      .update(financeAccounts)
      .set({ ...patch, updatedAt: new Date() })
      .where(
        and(
          eq(financeAccounts.id, id),
          eq(financeAccounts.userId, this.requireUserId()),
        ),
      )
      .returning();
    return account ?? null;
  }

  /** 归档（保留历史与余额，仅不进新交易默认选项）。 */
  async archive(id: string): Promise<AccountItem | null> {
    return this.update(id, { isArchived: true });
  }

  /** 恢复。 */
  async restore(id: string): Promise<AccountItem | null> {
    return this.update(id, { isArchived: false });
  }

  /** 是否存在关联分录（用于判断能否硬删）。 */
  async hasTransactions(id: string): Promise<boolean> {
    const [row] = await this.db
      .select({ one: sql<number>`1` })
      .from(entries)
      .where(eq(entries.accountId, id))
      .limit(1);
    return Boolean(row);
  }

  /** 硬删（仅无关联分录时调用；否则 API 层应建议归档返回 409）。 */
  async delete(id: string): Promise<void> {
    await this.db
      .delete(financeAccounts)
      .where(
        and(
          eq(financeAccounts.id, id),
          eq(financeAccounts.userId, this.requireUserId()),
        ),
      );
  }
}

/** 工厂：绑定请求 userId 的账户仓库实例。 */
export function accountRepository(userId: string): AccountRepository {
  return new AccountRepository(userId);
}
