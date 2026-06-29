/**
 * US1 集成测试（T012）：记录 income/expense/transfer → 余额正确 + Σdebit==Σcredit + 转账不改净资产。
 *
 * 覆盖 SC-001（账目不平衡发生率=0）、SC-002（转账不改净资产）。
 * 需真实 DB：FINANCE_INTEGRATION_TEST=1。
 */
import { describe, it, expect } from 'vitest';
import { INTEGRATION_ENABLED, uniqueUserId, assertEntriesBalanced } from './_helpers';
import { createTransaction } from '@/services/finance/ledger.service';
import { accountRepository } from '@/repositories/finance/account.repository';
import { transactionRepository } from '@/repositories/finance/transaction.repository';
import { netWorthCents, fromCents } from '@/services/finance/balance.service';
import { toCents } from '@/services/finance/money';

const suite = describe.skipIf(!INTEGRATION_ENABLED);

suite('US1 记账平衡（集成）', () => {
  it('支出：资产账户余额减少且分录平衡', async () => {
    const userId = uniqueUserId();
    const cash = await accountRepository(userId).create({
      name: '现金',
      type: 'cash',
      openingBalance: '1000.00',
    });

    const { transaction } = await createTransaction({
      userId,
      type: 'expense',
      amount: '100.00',
      fromAccountId: cash.id,
    });

    const [updated] = await accountRepository(userId)
      .list()
      .then((rows) => rows.filter((a) => a.id === cash.id));
    expect(toCents(updated!.balance)).toBe(toCents('900.00')); // 1000 - 100

    const detail = await transactionRepository(userId).findById(transaction.id);
    const check = assertEntriesBalanced(detail!.entries);
    expect(check.balanced).toBe(true); // SC-001
  });

  it('收入：资产账户余额增加且分录平衡', async () => {
    const userId = uniqueUserId();
    const savings = await accountRepository(userId).create({
      name: '招行储蓄',
      type: 'savings',
      openingBalance: '5000.00',
    });

    const { transaction } = await createTransaction({
      userId,
      type: 'income',
      amount: '10000.00',
      toAccountId: savings.id,
    });

    const accounts = await accountRepository(userId).list();
    const updated = accounts.find((a) => a.id === savings.id)!;
    expect(toCents(updated.balance)).toBe(toCents('15000.00')); // 5000 + 10000

    const detail = await transactionRepository(userId).findById(transaction.id);
    expect(assertEntriesBalanced(detail!.entries).balanced).toBe(true);
  });

  it('转账：两端余额此消彼长，净资产不变（SC-002）', async () => {
    const userId = uniqueUserId();
    const cash = await accountRepository(userId).create({
      name: '现金',
      type: 'cash',
      openingBalance: '1000.00',
    });
    const savings = await accountRepository(userId).create({
      name: '招行储蓄',
      type: 'savings',
      openingBalance: '5000.00',
    });

    const before = await accountRepository(userId).list();
    const netBefore = netWorthCents(
      before.map((a) => ({
        type: a.type,
        balance: a.balance,
        includeInNetWorth: a.includeInNetWorth,
      })),
    );

    const { transaction } = await createTransaction({
      userId,
      type: 'transfer',
      amount: '500.00',
      fromAccountId: cash.id,
      toAccountId: savings.id,
    });

    const after = await accountRepository(userId).list();
    const updatedCash = after.find((a) => a.id === cash.id)!;
    const updatedSavings = after.find((a) => a.id === savings.id)!;
    expect(toCents(updatedCash.balance)).toBe(toCents('500.00')); // 1000 - 500
    expect(toCents(updatedSavings.balance)).toBe(toCents('5500.00')); // 5000 + 500

    const netAfter = netWorthCents(
      after.map((a) => ({
        type: a.type,
        balance: a.balance,
        includeInNetWorth: a.includeInNetWorth,
      })),
    );
    expect(netAfter).toBe(netBefore); // SC-002：转账不改净资产

    const detail = await transactionRepository(userId).findById(transaction.id);
    expect(assertEntriesBalanced(detail!.entries).balanced).toBe(true);
  });

  it('连续录入多笔后，各账户余额 = 初始 + 交易汇总', async () => {
    const userId = uniqueUserId();
    const cash = await accountRepository(userId).create({
      name: '现金',
      type: 'cash',
      openingBalance: '1000.00',
    });
    const savings = await accountRepository(userId).create({
      name: '储蓄',
      type: 'savings',
      openingBalance: '0.00',
    });

    await createTransaction({ userId, type: 'income', amount: '500.00', toAccountId: savings.id });
    await createTransaction({ userId, type: 'expense', amount: '200.00', fromAccountId: cash.id });
    await createTransaction({ userId, type: 'transfer', amount: '300.00', fromAccountId: savings.id, toAccountId: cash.id });

    const accounts = await accountRepository(userId).list();
    const cashNow = accounts.find((a) => a.id === cash.id)!;
    const savingsNow = accounts.find((a) => a.id === savings.id)!;
    // cash: 1000 - 200 + 300 = 1100
    expect(fromCents(toCents(cashNow.balance))).toBe('1100.00');
    // savings: 0 + 500 - 300 = 200
    expect(fromCents(toCents(savingsNow.balance))).toBe('200.00');
  });
});
