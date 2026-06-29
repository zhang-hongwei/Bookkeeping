/**
 * US1/US3 负债测试（T013/T038）—— 负债登记/列表 + 信用卡账单周期聚合。
 *
 * - 纯函数部分（computeBillingPeriod / aggregateBillingFromEntries）：验证账单周期跨月滚动
 *   边界与本期账单/已还/待还聚合（SC-004）。无 DB，立即执行。
 * - DB 集成部分（register/list + getCreditCardPeriod）：剩余本金==balance、贷款参数持久、
 *   信用卡账单周期聚合正确。需真实 DB：FINANCE_INTEGRATION_TEST=1。
 */
import { describe, it, expect } from 'vitest';
import {
  registerLiability,
  listLiabilities,
  computeBillingPeriod,
  aggregateBillingFromEntries,
  getCreditCardPeriod,
} from '@/services/finance/liability.service';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';
import { toCents, fromCents } from '@/services/finance/money';

/** 构造 UTC 零点 Date，避免本地时区干扰 computeBillingPeriod。 */
function utc(year: number, month1Based: number, day: number): Date {
  return new Date(Date.UTC(year, month1Based - 1, day));
}

describe('computeBillingPeriod（账单周期边界，跨月滚动，SC-004）', () => {
  it('参考日 >= 本月账单日：当前周期 = [本月账单日, 下月账单日)', () => {
    const p = computeBillingPeriod(5, utc(2026, 6, 10));
    expect(p.periodStart).toBe('2026-06-05');
    expect(p.periodEnd).toBe('2026-07-05');
  });

  it('参考日 < 本月账单日：当前周期 = [上月账单日, 本月账单日)', () => {
    const p = computeBillingPeriod(5, utc(2026, 6, 3));
    expect(p.periodStart).toBe('2026-05-05');
    expect(p.periodEnd).toBe('2026-06-05');
  });

  it('账单日 31 在 2 月自动 clamp 到月末（跨月滚动不越界）', () => {
    // 2026-02 只有 28 天；参考日 02-15 < 本月账单日（clamp 28）→ 起于 01-31，止于 02-28
    const p = computeBillingPeriod(31, utc(2026, 2, 15));
    expect(p.periodStart).toBe('2026-01-31');
    expect(p.periodEnd).toBe('2026-02-28');
  });
});

describe('aggregateBillingFromEntries（账单聚合，SC-004）', () => {
  const periodStart = '2026-06-05';
  const periodEnd = '2026-07-05';

  it('statementAmount=Σcredit(消费)、paidAmount=Σdebit(还款)、remaining=差', () => {
    const agg = aggregateBillingFromEntries(
      [
        { side: 'credit', amount: '100.00', occurredAt: '2026-06-10' },
        { side: 'credit', amount: '50.00', occurredAt: '2026-06-20' },
        { side: 'debit', amount: '80.00', occurredAt: '2026-06-25' },
        // 周期外（>= periodEnd）不计
        { side: 'credit', amount: '999.00', occurredAt: '2026-07-10' },
        // 周期外（< periodStart）不计
        { side: 'credit', amount: '888.00', occurredAt: '2026-06-01' },
      ],
      periodStart,
      periodEnd,
    );
    expect(agg.statementAmount).toBe('150.00'); // 100 + 50
    expect(agg.paidAmount).toBe('80.00');
    expect(agg.remaining).toBe('70.00'); // 150 - 80
  });

  it('周期边界：起始日计入、截止日不计（左闭右开）', () => {
    const agg = aggregateBillingFromEntries(
      [
        { side: 'credit', amount: '10.00', occurredAt: '2026-06-05' }, // == start，计入
        { side: 'credit', amount: '20.00', occurredAt: '2026-07-05' }, // == end，不计
      ],
      periodStart,
      periodEnd,
    );
    expect(agg.statementAmount).toBe('10.00');
  });
});

// ===== DB 集成（gated）=====
const suite = describe.skipIf(!INTEGRATION_ENABLED);

suite('US1/US3 负债登记与账单周期（集成）', () => {
  it('登记贷款：剩余本金==balance、参数持久、初始已还为 0（T013）', async () => {
    const userId = uniqueUserId();
    const liab = await registerLiability({
      userId,
      name: '房贷',
      type: 'mortgage',
      openingBalance: '500000.00',
      principal: '500000.00',
      interestRate: '0.045',
      monthlyPayment: '3000.00',
      dueDate: '2036-06-29',
    });
    // 剩余本金 / 当前欠款 = 账户 balance
    expect(fromCents(toCents(liab.remainingPrincipal))).toBe('500000.00');
    expect(fromCents(toCents(liab.principal))).toBe('500000.00');
    expect(fromCents(toCents(liab.monthlyPayment!))).toBe('3000.00');
    expect(fromCents(toCents(liab.paidAmount))).toBe('0.00'); // 初始已还为 0
    expect(Number(liab.interestRate)).toBeCloseTo(0.045, 5);
    expect(String(liab.dueDate)).toContain('2036'); // 到期日持久（date 序列化形态不限）
    expect(liab.kind).toBe('mortgage');

    const list = await listLiabilities(userId);
    expect(list).toHaveLength(1);
  });

  it('登记信用卡：账单日/还款日持久（T013）', async () => {
    const userId = uniqueUserId();
    const cc = await registerLiability({
      userId,
      name: '招行信用卡',
      type: 'credit',
      openingBalance: '0.00',
      statementDay: 5,
      repaymentDay: 25,
    });
    expect(cc.kind).toBe('credit');
    expect(cc.statementDay).toBe(5);
    expect(cc.repaymentDay).toBe(25);
  });

  it('信用卡账单周期：聚合本期账单/已还/待还（T038）', async () => {
    const userId = uniqueUserId();
    const cc = await registerLiability({
      userId,
      name: '信用卡',
      type: 'credit',
      openingBalance: '0.00',
      statementDay: 5,
      repaymentDay: 25,
    });
    // 用 reference 锚定周期，避免依赖「今天」
    const ref = utc(2026, 6, 10); // 周期 [2026-06-05, 2026-07-05)
    const billing = await getCreditCardPeriod(userId, cc.account.id, ref);
    expect(billing.statementDay).toBe(5);
    expect(billing.periodStart).toBe('2026-06-05');
    expect(billing.periodEnd).toBe('2026-07-05');
    // 无分录：账单/已还/待还均为 0；临近还款日前 daysUntilDue 为正
    expect(fromCents(toCents(billing.remaining))).toBe('0.00');
    expect(billing.daysUntilDue).toBeGreaterThan(0);
  });
});
