/**
 * 复式记账余额/不变式引擎 —— 单元测试（纯函数，无需 DB）。
 *
 * 覆盖 SC-001/SC-002/SC-007 的可测不变式：
 * - Σdebit == Σcredit（assertBalanced）
 * - 每条 amount > 0
 * - 资产类（借方正常余额）/ 信用类 credit（贷方正常余额）方向正确
 * - 净资产计算（转账不改净资产 = 两侧 Δ 相互抵消）
 */
import { describe, it, expect } from 'vitest';
import {
  assertBalanced,
  computeBalanceCents,
  normalBalanceIsDebit,
  signedDeltaCents,
  LedgerInvariantError,
  netWorthCents,
  liabilityIsConsistent,
} from '@/services/finance/balance.service';
import { toCents, fromCents, addCents } from '@/services/finance/money';

describe('money（分整数运算）', () => {
  it('把金额字符串解析为分', () => {
    expect(toCents('0')).toBe(0);
    expect(toCents('100')).toBe(10000);
    expect(toCents('100.00')).toBe(10000);
    expect(toCents('100.5')).toBe(10050);
    expect(toCents('100.05')).toBe(10005);
    expect(toCents('-35.50')).toBe(-3550);
    expect(toCents(0)).toBe(0);
    expect(toCents(null)).toBe(0);
    expect(toCents('1,000.00')).toBe(100000); // 千分位
  });

  it('把分格式化回金额字符串（2 位小数）', () => {
    expect(fromCents(0)).toBe('0.00');
    expect(fromCents(10000)).toBe('100.00');
    expect(fromCents(10005)).toBe('100.05');
    expect(fromCents(-3550)).toBe('-35.50');
  });

  it('toCents/fromCents 往返无损（核心：禁浮点误差）', () => {
    for (const v of ['0.01', '0.10', '0.99', '999999.99', '-0.01']) {
      expect(fromCents(toCents(v))).toBe(v);
    }
  });

  it('addCents 做整数相加', () => {
    expect(addCents('0.10', '0.20')).toBe(30);
  });
});

describe('normalBalanceIsDebit（账户正常余额方向）', () => {
  it('资产类为借方正常余额', () => {
    expect(normalBalanceIsDebit('cash')).toBe(true);
    expect(normalBalanceIsDebit('savings')).toBe(true);
    expect(normalBalanceIsDebit('investment')).toBe(true);
    expect(normalBalanceIsDebit('real_asset')).toBe(true);
  });

  it('信用类(credit)与权益类(equity)为贷方正常余额', () => {
    expect(normalBalanceIsDebit('credit')).toBe(false);
    expect(normalBalanceIsDebit('equity')).toBe(false);
  });
});

describe('signedDeltaCents（分录对账户余额的带符号增量）', () => {
  it('资产类：借方增加、贷方减少', () => {
    // 余额 = Σ(借−贷)，资产类借方正常
    expect(signedDeltaCents('cash', 'debit', '100.00')).toBe(10000);
    expect(signedDeltaCents('cash', 'credit', '100.00')).toBe(-10000);
  });

  it('信用类：贷方增加欠款、借方减少欠款', () => {
    // credit 贷方正常 → 贷方增加余额(=欠款)
    expect(signedDeltaCents('credit', 'credit', '200.00')).toBe(20000);
    expect(signedDeltaCents('credit', 'debit', '200.00')).toBe(-20000);
  });

  it('权益类：贷方增加（收入记贷方）', () => {
    expect(signedDeltaCents('equity', 'credit', '50.00')).toBe(5000);
    expect(signedDeltaCents('equity', 'debit', '50.00')).toBe(-5000);
  });
});

describe('assertBalanced（复式平衡不变式）', () => {
  it('平衡的双腿通过', () => {
    expect(() =>
      assertBalanced([
        { accountId: 'a', side: 'debit', amount: '100.00' },
        { accountId: 'b', side: 'credit', amount: '100.00' },
      ]),
    ).not.toThrow();
  });

  it('平衡的多腿（转账分摊）通过', () => {
    expect(() =>
      assertBalanced([
        { accountId: 'a', side: 'debit', amount: '30.00' },
        { accountId: 'a', side: 'debit', amount: '70.00' },
        { accountId: 'b', side: 'credit', amount: '100.00' },
      ]),
    ).not.toThrow();
  });

  it('不平衡则抛出 LedgerInvariantError', () => {
    expect(() =>
      assertBalanced([
        { accountId: 'a', side: 'debit', amount: '100.00' },
        { accountId: 'b', side: 'credit', amount: '99.00' },
      ]),
    ).toThrow(LedgerInvariantError);
  });

  it('金额 <= 0 抛出', () => {
    expect(() =>
      assertBalanced([
        { accountId: 'a', side: 'debit', amount: '0.00' },
        { accountId: 'b', side: 'credit', amount: '0.00' },
      ]),
    ).toThrow(LedgerInvariantError);
  });

  it('少于 2 条分录抛出', () => {
    expect(() =>
      assertBalanced([{ accountId: 'a', side: 'debit', amount: '1.00' }]),
    ).toThrow(LedgerInvariantError);
  });
});

describe('computeBalanceCents（余额 = 初始 + Σ分录影响）', () => {
  it('资产类账户余额随借贷正确累加', () => {
    const bal = computeBalanceCents('cash', '1000.00', [
      { side: 'debit', amount: '500.00' },
      { side: 'credit', amount: '200.00' },
    ]);
    // 1000 + 500 - 200 = 1300
    expect(bal).toBe(130000);
    expect(fromCents(bal)).toBe('1300.00');
  });

  it('信用类账户余额体现为欠款（贷方增加）', () => {
    const bal = computeBalanceCents('credit', '0.00', [
      { side: 'credit', amount: '300.00' },
    ]);
    // 欠款 300
    expect(bal).toBe(30000);
  });
});

describe('netWorthCents（净资产）', () => {
  it('资产加、信用欠款减', () => {
    const net = netWorthCents([
      { type: 'cash', balance: '1000.00', includeInNetWorth: true },
      { type: 'credit', balance: '200.00', includeInNetWorth: true },
    ]);
    // 1000 - 200 = 800
    expect(net).toBe(80000);
  });

  it('includeInNetWorth=false 的账户不计入', () => {
    const net = netWorthCents([
      { type: 'cash', balance: '1000.00', includeInNetWorth: true },
      { type: 'real_asset', balance: '5000.00', includeInNetWorth: false },
    ]);
    expect(net).toBe(100000);
  });

  it('转账不改净资产：同额借贷对资产账户净影响为 0', () => {
    // 一笔 500 转账：借目标(储蓄)+500、贷来源(现金)-500 → 净资产不变
    const cash = computeBalanceCents('cash', '1000.00', [
      { side: 'credit', amount: '500.00' },
    ]);
    const savings = computeBalanceCents('savings', '5000.00', [
      { side: 'debit', amount: '500.00' },
    ]);
    const net = netWorthCents([
      { type: 'cash', balance: fromCents(cash), includeInNetWorth: true },
      { type: 'savings', balance: fromCents(savings), includeInNetWorth: true },
    ]);
    // 1000 + 5000 = 6000，转账后仍为 6000
    expect(net).toBe(600000);
  });
});

describe('liabilityIsConsistent（负债剩余本金不变式，T047 防漂移）', () => {
  it('贷款：balance == principal − paidAmount 视为一致', () => {
    expect(liabilityIsConsistent('mortgage', '497000.00', '500000.00', '3000.00')).toBe(true);
    expect(liabilityIsConsistent('car_loan', '0.00', '100000.00', '100000.00')).toBe(true);
    expect(liabilityIsConsistent('borrowing', '500.00', '1500.00', '1000.00')).toBe(true);
  });

  it('贷款：balance ≠ principal − paidAmount 视为漂移', () => {
    // 期望 497000，实际 496000 → 漂移
    expect(liabilityIsConsistent('mortgage', '496000.00', '500000.00', '3000.00')).toBe(false);
  });

  it('信用卡（credit）：欠款随消费滚动，恒视为一致（不适用此不变式）', () => {
    // credit 无论 balance 与 principal/paid 关系如何，均不判漂移
    expect(liabilityIsConsistent('credit', '1234.56', '0.00', '0.00')).toBe(true);
    expect(liabilityIsConsistent('credit', '999.00', '500.00', '100.00')).toBe(true);
  });
});
