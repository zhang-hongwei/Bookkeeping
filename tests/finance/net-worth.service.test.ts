/**
 * US1 单元测试（T010/T011）：净资产推导口径 + 历史重算 + 转账不改净资产。
 *
 * 覆盖 SC-001（快照净值=余额推导净值）、SC-002（转账不改净资产）的纯函数逻辑。
 * DB 集成（快照写/回填/自愈）见 gated suite。
 */
import { describe, it, expect } from 'vitest';
import {
  computeNetWorthFromAccounts,
  computeNetWorthAtDatePure,
} from '@/services/finance/net-worth.service';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';
import {
  snapshotForDate,
  snapshotRange,
  backfillHistory,
  verifySnapshots,
  computeNetWorthLive,
} from '@/services/finance/net-worth.service';

describe('computeNetWorthFromAccounts（净资产口径，R1）', () => {
  it('资产类余额计入总资产，credit 欠款计入总负债，净值=差', () => {
    const nw = computeNetWorthFromAccounts([
      { id: 'a', type: 'cash', openingBalance: '0', balance: '1000', includeInNetWorth: true },
      { id: 'b', type: 'savings', openingBalance: '0', balance: '5000', includeInNetWorth: true },
      { id: 'c', type: 'credit', openingBalance: '0', balance: '200', includeInNetWorth: true },
    ]);
    expect(nw.totalAssets).toBe('6000.00');
    expect(nw.totalLiabilities).toBe('200.00');
    expect(nw.netWorth).toBe('5800.00');
  });

  it('include_in_net_worth=false 的资产不计入总资产', () => {
    const nw = computeNetWorthFromAccounts([
      { id: 'a', type: 'cash', openingBalance: '0', balance: '1000', includeInNetWorth: true },
      { id: 'r', type: 'real_asset', openingBalance: '0', balance: '9999', includeInNetWorth: false },
    ]);
    expect(nw.totalAssets).toBe('1000.00');
  });

  it('breakdown 按账户类型汇总', () => {
    const nw = computeNetWorthFromAccounts([
      { id: 'a', type: 'cash', openingBalance: '0', balance: '300', includeInNetWorth: true },
      { id: 'b', type: 'cash', openingBalance: '0', balance: '700', includeInNetWorth: true },
      { id: 'c', type: 'savings', openingBalance: '0', balance: '500', includeInNetWorth: true },
    ]);
    expect(nw.breakdown.cash).toBe('1000.00');
    expect(nw.breakdown.savings).toBe('500.00');
  });
});

describe('computeNetWorthAtDatePure（历史重算 + SC-002 转账不改净资产）', () => {
  const accounts = [
    { id: 'cash', type: 'cash', openingBalance: '1000', balance: '600', includeInNetWorth: true },
    { id: 'sav', type: 'savings', openingBalance: '0', balance: '300', includeInNetWorth: true },
  ];

  it('截止某日 = opening + 该日及之前分录 delta', () => {
    const entries = [
      { accountId: 'cash', side: 'credit', amount: '100', occurredAt: '2026-06-01' }, // 支出
      { accountId: 'cash', side: 'credit', amount: '300', occurredAt: '2026-06-02' }, // 转账出
      { accountId: 'sav', side: 'debit', amount: '300', occurredAt: '2026-06-02' }, // 转账入
    ];
    // 06-01: cash=1000-100=900, sav=0 → 净资产 900
    expect(computeNetWorthAtDatePure(accounts, entries, '2026-06-01').netWorth).toBe('900.00');
    // 06-02: cash=600, sav=300 → 总资产 900，转账不改净资产
    expect(computeNetWorthAtDatePure(accounts, entries, '2026-06-02').netWorth).toBe('900.00');
  });

  it('未来日期的分录不计入', () => {
    const entries = [
      { accountId: 'cash', side: 'credit', amount: '500', occurredAt: '2026-12-31' },
    ];
    expect(computeNetWorthAtDatePure(accounts, entries, '2026-06-01').netWorth).toBe('1000.00');
  });
});

// ===== DB 集成（gated）=====
const suite = describe.skipIf(!INTEGRATION_ENABLED);
suite('US1 净资产快照（集成）', () => {
  it('snapshotForDate 写入后净值=余额推导值（SC-001）', async () => {
    const userId = uniqueUserId();
    const live = await computeNetWorthLive(userId);
    const today = new Date().toISOString().slice(0, 10);
    await snapshotForDate(userId, today);
    const range = await snapshotRange(userId, today, today);
    expect(range[0].netWorth).toBe(live.netWorth);
  });

  it('backfillHistory + verifySnapshots 自愈一致', async () => {
    const userId = uniqueUserId();
    await backfillHistory(userId);
    const mismatches = await verifySnapshots(userId);
    expect(mismatches).toEqual([]);
  });
});
