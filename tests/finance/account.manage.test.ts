/**
 * US2 集成测试（T021）：创建/归档/恢复账户、余额持久、归档账户不被新交易默认选中。
 *
 * 需真实 DB：FINANCE_INTEGRATION_TEST=1。
 */
import { describe, it, expect } from 'vitest';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';
import { accountRepository } from '@/repositories/finance/account.repository';
import { accountService, AccountConflictError } from '@/services/finance/account.service';
import { createTransaction } from '@/services/finance/ledger.service';
import { toCents, fromCents } from '@/services/finance/money';

const suite = describe.skipIf(!INTEGRATION_ENABLED);

suite('US2 账户管理（集成）', () => {
  it('创建现金/储蓄/信用三类账户，初始余额正确显示', async () => {
    const userId = uniqueUserId();
    const cash = await accountRepository(userId).create({ name: '微信零钱', type: 'cash', openingBalance: '800.00' });
    const savings = await accountRepository(userId).create({ name: '招商银行', type: 'savings', openingBalance: '5000.00' });
    const credit = await accountRepository(userId).create({ name: '招行信用卡', type: 'credit', openingBalance: '200.00' });

    expect(fromCents(toCents(cash.balance))).toBe('800.00');
    expect(fromCents(toCents(savings.balance))).toBe('5000.00');
    expect(fromCents(toCents(credit.balance))).toBe('200.00'); // 欠款方向
  });

  it('归档账户后：历史余额保留，默认列表不包含', async () => {
    const userId = uniqueUserId();
    const cash = await accountRepository(userId).create({ name: '现金', type: 'cash', openingBalance: '1000.00' });
    await createTransaction({ userId, type: 'expense', amount: '100.00', fromAccountId: cash.id });

    const archived = await accountService.archive(userId, cash.id);
    expect(archived?.isArchived).toBe(true);

    // 余额仍正确（保留历史）
    const found = await accountRepository(userId).findById(cash.id);
    expect(fromCents(toCents(found!.balance))).toBe('900.00');

    // 默认列表（不含归档）不包含该账户
    const active = await accountRepository(userId).list();
    expect(active.find((a) => a.id === cash.id)).toBeUndefined();

    // 含归档列表能看到
    const withArchived = await accountRepository(userId).list({ includeArchived: true });
    expect(withArchived.find((a) => a.id === cash.id)).toBeDefined();

    // 恢复后回到默认列表
    await accountService.restore(userId, cash.id);
    const activeAgain = await accountRepository(userId).list();
    expect(activeAgain.find((a) => a.id === cash.id)).toBeDefined();
  });

  it('有关联交易的账户不可硬删（抛冲突），无关联可删', async () => {
    const userId = uniqueUserId();
    const cash = await accountRepository(userId).create({ name: '现金', type: 'cash', openingBalance: '1000.00' });
    await createTransaction({ userId, type: 'expense', amount: '50.00', fromAccountId: cash.id });

    await expect(accountService.delete(userId, cash.id)).rejects.toBeInstanceOf(AccountConflictError);

    // 无关联交易的账户可删
    const empty = await accountRepository(userId).create({ name: '空账户', type: 'savings', openingBalance: '0.00' });
    await accountService.delete(userId, empty.id);
    expect(await accountRepository(userId).findById(empty.id)).toBeNull();
  });
});
