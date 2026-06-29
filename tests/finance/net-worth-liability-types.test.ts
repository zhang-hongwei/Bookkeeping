/**
 * Phase 2 回归测试（T010）：净资产负债识别扩展为 LIABILITY_ACCOUNT_TYPES。
 *
 * 验证新增贷款类型（mortgage/car_loan/consumer_loan/borrowing）正确计入总负债，
 * 且既有 credit 行为不变。纯函数，无需 DB。
 */
import { describe, it, expect } from 'vitest';
import { computeNetWorthFromAccounts } from '@/services/finance/net-worth.service';
import { netWorthCents } from '@/services/finance/balance.service';
import { fromCents } from '@/services/finance/money';

describe('Phase 2：新增贷款类型计入负债（T010 回归）', () => {
  it('mortgage 账户欠款计入总负债', () => {
    const nw = computeNetWorthFromAccounts([
      { id: 'a', type: 'cash', openingBalance: '0', balance: '500000.00', includeInNetWorth: true },
      { id: 'm', type: 'mortgage', openingBalance: '0', balance: '2000000.00', includeInNetWorth: true },
    ]);
    expect(nw.totalAssets).toBe('500000.00');
    expect(nw.totalLiabilities).toBe('2000000.00');
    expect(nw.netWorth).toBe('-1500000.00'); // 资不抵债
  });

  it('car_loan / consumer_loan / borrowing 均计入负债', () => {
    const nw = computeNetWorthFromAccounts([
      { id: 'a', type: 'savings', openingBalance: '0', balance: '100000.00', includeInNetWorth: true },
      { id: 'c', type: 'car_loan', openingBalance: '0', balance: '80000.00', includeInNetWorth: true },
      { id: 'd', type: 'consumer_loan', openingBalance: '0', balance: '30000.00', includeInNetWorth: true },
      { id: 'e', type: 'borrowing', openingBalance: '0', balance: '5000.00', includeInNetWorth: true },
    ]);
    expect(nw.totalLiabilities).toBe('115000.00');
    expect(nw.netWorth).toBe('-15000.00');
  });

  it('credit 既有行为不变（仍计入负债）', () => {
    const nw = computeNetWorthFromAccounts([
      { id: 'a', type: 'cash', openingBalance: '0', balance: '1000.00', includeInNetWorth: true },
      { id: 'c', type: 'credit', openingBalance: '0', balance: '200.00', includeInNetWorth: true },
    ]);
    expect(nw.totalLiabilities).toBe('200.00');
    expect(nw.netWorth).toBe('800.00');
  });

  it('breakdown 按贷款类型分项汇总', () => {
    const nw = computeNetWorthFromAccounts([
      { id: 'm', type: 'mortgage', openingBalance: '0', balance: '1000000.00', includeInNetWorth: true },
      { id: 'c', type: 'car_loan', openingBalance: '0', balance: '50000.00', includeInNetWorth: true },
    ]);
    expect(nw.breakdown.mortgage).toBe('1000000.00');
    expect(nw.breakdown.car_loan).toBe('50000.00');
  });

  it('netWorthCents：贷款类型为负贡献', () => {
    const net = netWorthCents([
      { type: 'cash', balance: '100000.00', includeInNetWorth: true },
      { type: 'mortgage', balance: '60000.00', includeInNetWorth: true },
    ]);
    // 100000 - 60000 = 40000
    expect(fromCents(net)).toBe('40000.00');
  });
});
