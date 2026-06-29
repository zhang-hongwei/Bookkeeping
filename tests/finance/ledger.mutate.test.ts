/**
 * US1 集成测试（T013）：编辑/删除历史交易 → 相关账户余额一次同步正确（SC-007）。
 *
 * 需真实 DB：FINANCE_INTEGRATION_TEST=1。
 */
import { describe, it, expect } from 'vitest';
import { INTEGRATION_ENABLED, uniqueUserId, assertEntriesBalanced } from './_helpers';
import {
  createTransaction,
  editTransaction,
  patchTransaction,
  deleteTransaction,
} from '@/services/finance/ledger.service';
import { accountRepository } from '@/repositories/finance/account.repository';
import { transactionRepository } from '@/repositories/finance/transaction.repository';
import { toCents, fromCents } from '@/services/finance/money';

const suite = describe.skipIf(!INTEGRATION_ENABLED);

suite('US1 编辑/删除重算余额（集成，SC-007）', () => {
  it('编辑交易金额后余额同步重算', async () => {
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

    // 改成 250
    await editTransaction(userId, transaction.id, {
      userId,
      type: 'expense',
      amount: '250.00',
      fromAccountId: cash.id,
    });

    const accounts = await accountRepository(userId).list();
    const cashNow = accounts.find((a) => a.id === cash.id)!;
    // 1000 - 250 = 750（原 100 影响被反转，250 重新应用）
    expect(fromCents(toCents(cashNow.balance))).toBe('750.00');
  });

  it('PATCH 部分更新（仅改金额）余额同步且分录平衡', async () => {
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

    const { transaction: updated } = await patchTransaction(userId, transaction.id, {
      amount: '400.00',
    });

    const detail = await transactionRepository(userId).findById(updated.id);
    expect(assertEntriesBalanced(detail!.entries).balanced).toBe(true);

    const accounts = await accountRepository(userId).list();
    const cashNow = accounts.find((a) => a.id === cash.id)!;
    expect(fromCents(toCents(cashNow.balance))).toBe('600.00'); // 1000 - 400
  });

  it('删除交易后余额回滚、账目仍平衡', async () => {
    const userId = uniqueUserId();
    const cash = await accountRepository(userId).create({
      name: '现金',
      type: 'cash',
      openingBalance: '1000.00',
    });

    const { transaction: t1 } = await createTransaction({
      userId,
      type: 'expense',
      amount: '100.00',
      fromAccountId: cash.id,
    });
    await createTransaction({ userId, type: 'expense', amount: '50.00', fromAccountId: cash.id });

    // 删除第一笔
    await deleteTransaction(userId, t1.id);

    const accounts = await accountRepository(userId).list();
    const cashNow = accounts.find((a) => a.id === cash.id)!;
    // 1000 - 50（第一笔 100 已回滚）
    expect(fromCents(toCents(cashNow.balance))).toBe('950.00');

    // 其余交易仍可读且平衡
    const list = await transactionRepository(userId).list();
    expect(list.total).toBe(1);
    for (const t of list.items) {
      expect(assertEntriesBalanced(t.entries).balanced).toBe(true);
    }
  });
});
