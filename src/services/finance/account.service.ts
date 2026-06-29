/**
 * 账户业务服务（US2）：归档/恢复、配置（额度/计入净资产）、带守卫的删除。
 *
 * - 归档：保留历史与余额，仅不进新交易默认选项（FR-002）。
 * - 删除：仅在无关联分录时硬删；否则抛 AccountConflictError（API → 409 建议归档）。
 * - 不改 balance（余额只能由交易驱动）。
 */
import {
  accountRepository,
  type UpdateAccountPatch,
} from '@/repositories/finance/account.repository';
import type { AccountItem } from '@/database/schema/finance';

export class AccountConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountConflictError';
  }
}

export const accountService = {
  async update(
    userId: string,
    id: string,
    patch: UpdateAccountPatch,
  ): Promise<AccountItem | null> {
    return accountRepository(userId).update(id, patch);
  },

  async archive(userId: string, id: string): Promise<AccountItem | null> {
    return accountRepository(userId).archive(id);
  },

  async restore(userId: string, id: string): Promise<AccountItem | null> {
    return accountRepository(userId).restore(id);
  },

  /** 硬删；存在关联交易则抛冲突（建议归档）。 */
  async delete(userId: string, id: string): Promise<void> {
    const repo = accountRepository(userId);
    if (await repo.hasTransactions(id)) {
      throw new AccountConflictError('账户存在关联交易，建议归档而非删除');
    }
    await repo.delete(id);
  },
};
