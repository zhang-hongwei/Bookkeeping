/**
 * US2 贷款还款正确性测试（T032）—— recordRepayment。
 *
 * 核心不变式（SC-001）：记一笔还款（本金 + 利息）后——
 *   负债 −principal、现金 −(principal+interest)、净资产仅因利息变化（本金对冲不扭曲）、
 *   Σdebit==Σcredit、资产端不变。
 *
 * - 纯函数部分（buildRepaymentEntries + signedDeltaCents/netWorthCents 数学）：验证分录结构、
 *   余额方向、净资产 −interest。无 DB，立即执行。
 * - DB 集成部分（recordRepayment 端到端）：需真实 DB：FINANCE_INTEGRATION_TEST=1。
 */
import { describe, it, expect } from 'vitest';
import { buildRepaymentEntries, recordRepayment } from '@/services/finance/ledger.service';
import { signedDeltaCents, netWorthCents, LedgerInvariantError } from '@/services/finance/balance.service';
import { registerLiability } from '@/services/finance/liability.service';
import { accountRepository } from '@/repositories/finance/account.repository';
import { transactionRepository } from '@/repositories/finance/transaction.repository';
import { INTEGRATION_ENABLED, uniqueUserId, assertEntriesBalanced } from './_helpers';
import { toCents, fromCents } from '@/services/finance/money';

/** 本地复式平衡断言（适配 EntryInput 的宽 amount 类型）。 */
function balanced(
  legs: Array<{ side: 'debit' | 'credit'; amount: string | number }>,
): boolean {
  if (legs.length < 2) return false;
  let debit = 0;
  let credit = 0;
  for (const e of legs) {
    const cents = toCents(e.amount);
    if (cents <= 0) return false;
    if (e.side === 'debit') debit += cents;
    else credit += cents;
  }
  return debit === credit;
}

describe('buildRepaymentEntries（还款分录结构，SC-001）', () => {
  it('含利息：debit 负债 principal、debit __expense interest、credit 现金 (p+i)，3 腿平衡', () => {
    const legs = buildRepaymentEntries('liab', 'cash', 'exp', '3000.00', '2000.00');
    expect(legs).toHaveLength(3);
    expect(legs).toContainEqual({ accountId: 'liab', side: 'debit', amount: '3000.00' });
    expect(legs).toContainEqual({ accountId: 'exp', side: 'debit', amount: '2000.00' });
    expect(legs).toContainEqual({ accountId: 'cash', side: 'credit', amount: '5000.00' });
    expect(balanced(legs)).toBe(true); // Σdebit(3000+2000) == Σcredit(5000)
  });

  it('无利息：仅 2 腿（debit 负债、credit 现金），平衡', () => {
    const legs = buildRepaymentEntries('liab', 'cash', 'exp', '3000.00', '0.00');
    expect(legs).toHaveLength(2);
    expect(legs).toContainEqual({ accountId: 'cash', side: 'credit', amount: '3000.00' });
    expect(balanced(legs)).toBe(true);
  });

  it('还款本金非正：抛 LedgerInvariantError', () => {
    expect(() => buildRepaymentEntries('liab', 'cash', 'exp', '0', '100')).toThrow(LedgerInvariantError);
  });

  it('还款利息为负：抛 LedgerInvariantError', () => {
    expect(() => buildRepaymentEntries('liab', 'cash', 'exp', '100', '-1')).toThrow(LedgerInvariantError);
  });
});

describe('recordRepayment 余额方向与净资产效应（SC-001/SC-003 数学）', () => {
  it('负债（贷方正常余额）：debit principal → balance 减少 principal', () => {
    const delta = signedDeltaCents('mortgage', 'debit', '3000.00');
    expect(delta).toBe(-toCents('3000.00')); // 负债减少
  });

  it('现金（借方正常余额）：credit (principal+interest) → balance 减少 (p+i)', () => {
    const delta = signedDeltaCents('cash', 'credit', '5000.00');
    expect(delta).toBe(-toCents('5000.00')); // 现金减少
  });

  it('净资产仅因利息变化：本金对冲不扭曲（−interest）', () => {
    // 还款前：现金 10000、房贷 500000 → 净资产 10000 − 500000 = −490000
    const before = netWorthCents([
      { type: 'cash', balance: '10000.00', includeInNetWorth: true },
      { type: 'mortgage', balance: '500000.00', includeInNetWorth: true },
    ]);
    // 还款本金 3000 + 利息 2000 后：现金 5000、房贷 497000 → 净资产 −492000（减少 2000 = 利息）
    const after = netWorthCents([
      { type: 'cash', balance: '5000.00', includeInNetWorth: true },
      { type: 'mortgage', balance: '497000.00', includeInNetWorth: true },
    ]);
    expect(before - after).toBe(toCents('2000.00')); // 净资产减少 = 利息
  });
});

// ===== DB 集成（gated）=====
const suite = describe.skipIf(!INTEGRATION_ENABLED);

suite('US2 贷款还款（集成，SC-001）', () => {
  it('recordRepayment：负债−principal、现金−(p+i)、paidAmount+=principal、分录平衡、净资产−interest', async () => {
    const userId = uniqueUserId();
    const liab = await registerLiability({
      userId,
      name: '房贷',
      type: 'mortgage',
      openingBalance: '500000.00',
      principal: '500000.00',
    });
    const cash = await accountRepository(userId).create({
      name: '现金',
      type: 'cash',
      openingBalance: '10000.00',
    });

    const result = await recordRepayment({
      userId,
      liabilityAccountId: liab.account.id,
      cashAccountId: cash.id,
      principal: '3000.00',
      interest: '2000.00',
    });

    // 负债减少 principal；累计已还本金 += principal
    expect(fromCents(toCents(result.remainingPrincipal))).toBe('497000.00');
    expect(fromCents(toCents(result.paidAmount))).toBe('3000.00');

    // 现金减少 (principal + interest)
    const cashNow = await accountRepository(userId).findById(cash.id);
    expect(fromCents(toCents(cashNow!.balance))).toBe('5000.00');

    // Σdebit==Σcredit
    const detail = await transactionRepository(userId).findById(result.transaction.id);
    expect(assertEntriesBalanced(detail!.entries).balanced).toBe(true);

    // 净资产 −interest：10000−500000 = −490000 → 5000−497000 = −492000（分）
    const accounts = await accountRepository(userId).list();
    const net = netWorthCents(
      accounts.map((a) => ({
        type: a.type,
        balance: a.balance,
        includeInNetWorth: a.includeInNetWorth,
      })),
    );
    expect(net).toBe(-toCents('492000.00'));
  });
});
