/**
 * US1 资产测试（T012/T015）—— 资产登记/列表 + 估值更新(revaluation) + 处置(disposal)。
 *
 * - 纯函数部分（buildRevaluationEntries / buildDisposalEntries）：验证复式分录结构正确且
 *   Σdebit==Σcredit、金额>0（SC-001 资产生命周期不破坏账目平衡）。无 DB，立即执行。
 * - DB 集成部分（register/list/revalue/dispose）：当前价值==balance、置信度持久、
 *   includeInNetWorth 生效、revalue 后 balance=新值且估值历史追加、dispose 后清零且现金增加。
 *   需真实 DB：FINANCE_INTEGRATION_TEST=1。
 */
import { describe, it, expect } from 'vitest';
import {
  buildRevaluationEntries,
  buildDisposalEntries,
  registerAsset,
  listAssets,
  revalueAsset,
  disposeAsset,
  LedgerInvariantError,
} from '@/services/finance/asset.service';
import { accountRepository } from '@/repositories/finance/account.repository';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';
import { toCents } from '@/services/finance/money';

/** 本地复式平衡断言：≥2 条、每条金额>0、Σdebit==Σcredit（适配 EntryInput 的宽 amount 类型）。 */
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

describe('buildRevaluationEntries（估值更新分录，SC-001）', () => {
  it('升值：debit 资产 / credit 估值权益，金额为差额且平衡', () => {
    const legs = buildRevaluationEntries('asset', '1000.00', '1500.00', 'rev');
    expect(legs).toHaveLength(2);
    expect(legs[0]).toMatchObject({ accountId: 'asset', side: 'debit', amount: '500.00' });
    expect(legs[1]).toMatchObject({ accountId: 'rev', side: 'credit', amount: '500.00' });
    expect(balanced(legs)).toBe(true);
  });

  it('贬值：debit 估值权益 / credit 资产，方向反转且平衡', () => {
    const legs = buildRevaluationEntries('asset', '1500.00', '1000.00', 'rev');
    expect(legs[0]).toMatchObject({ accountId: 'rev', side: 'debit', amount: '500.00' });
    expect(legs[1]).toMatchObject({ accountId: 'asset', side: 'credit', amount: '500.00' });
    expect(balanced(legs)).toBe(true);
  });

  it('估值不变：返回空分录（仅更新元数据，不产生复式交易）', () => {
    const legs = buildRevaluationEntries('asset', '1000.00', '1000.00', 'rev');
    expect(legs).toHaveLength(0);
  });
});

describe('buildDisposalEntries（资产处置分录，SC-001）', () => {
  it('处置盈利：现金 + 资产清零 + 收益 credit __income，3 腿平衡', () => {
    // 账面 1000、回收 1200 → 收益 200
    const legs = buildDisposalEntries('asset', '1000.00', '1200.00', 'cash', 'inc', 'exp');
    expect(legs).toHaveLength(3);
    expect(legs).toContainEqual({ accountId: 'cash', side: 'debit', amount: '1200.00' });
    expect(legs).toContainEqual({ accountId: 'asset', side: 'credit', amount: '1000.00' });
    expect(legs).toContainEqual({ accountId: 'inc', side: 'credit', amount: '200.00' });
    expect(balanced(legs)).toBe(true);
  });

  it('处置亏损：现金 + 资产清零 + 损失 debit __expense，3 腿平衡', () => {
    // 账面 1000、回收 800 → 损失 200
    const legs = buildDisposalEntries('asset', '1000.00', '800.00', 'cash', 'inc', 'exp');
    expect(legs).toHaveLength(3);
    expect(legs).toContainEqual({ accountId: 'cash', side: 'debit', amount: '800.00' });
    expect(legs).toContainEqual({ accountId: 'asset', side: 'credit', amount: '1000.00' });
    expect(legs).toContainEqual({ accountId: 'exp', side: 'debit', amount: '200.00' });
    expect(balanced(legs)).toBe(true);
  });

  it('平价处置：仅 2 腿（现金 + 资产清零），不产生损益腿', () => {
    const legs = buildDisposalEntries('asset', '1000.00', '1000.00', 'cash', 'inc', 'exp');
    expect(legs).toHaveLength(2);
    expect(balanced(legs)).toBe(true);
  });

  it('处置款非正：抛 LedgerInvariantError（复式不变式前置校验）', () => {
    expect(() =>
      buildDisposalEntries('asset', '1000.00', '0', 'cash', 'inc', 'exp'),
    ).toThrow(LedgerInvariantError);
  });
});

// ===== DB 集成（gated）=====
const suite = describe.skipIf(!INTEGRATION_ENABLED);

suite('US1 资产登记与生命周期（集成）', () => {
  it('登记资产：当前价值==balance、置信度持久、includeInNetWorth 生效（T012）', async () => {
    const userId = uniqueUserId();
    const asset = await registerAsset({
      userId,
      name: '自住房',
      type: 'real_asset',
      currentValue: '2000000.00',
      costBasis: '1800000.00',
      valuationSource: 'estimate',
      estimateConfidence: 'low',
    });
    expect(asset.currentValue).toBe('2000000.00'); // 当前价值 = 账户 balance
    expect(asset.estimateConfidence).toBe('low'); // 置信度持久化
    expect(asset.isDisposed).toBe(false);

    const list = await listAssets(userId);
    expect(list).toHaveLength(1);
    expect(list[0].currentValue).toBe('2000000.00');

    // includeInNetWorth=false 的资产标记持久
    await registerAsset({
      userId,
      name: '不计入净资产',
      type: 'real_asset',
      currentValue: '500.00',
      includeInNetWorth: false,
    });
    const all = await listAssets(userId);
    const excluded = all.find((a) => a.account.name === '不计入净资产');
    expect(excluded?.account.includeInNetWorth).toBe(false);
  });

  it('估值更新：balance=新值、估值历史追加、不破坏平衡（T015）', async () => {
    const userId = uniqueUserId();
    const asset = await registerAsset({
      userId,
      name: '私家车',
      type: 'real_asset',
      currentValue: '100000.00',
    });
    const before = asset.valuationHistory.length;

    const revalued = await revalueAsset({
      userId,
      assetAccountId: asset.account.id,
      newValue: '90000.00',
      confidence: 'medium',
    });
    expect(revalued.currentValue).toBe('90000.00'); // balance 更新为新估值
    expect(revalued.valuationHistory.length).toBe(before + 1); // 追加本次估值点
    expect(revalued.estimateConfidence).toBe('medium');
  });

  it('处置：资产清零、现金增加 proceeds、isDisposed 置位（T015）', async () => {
    const userId = uniqueUserId();
    const asset = await registerAsset({
      userId,
      name: '基金',
      type: 'investment',
      currentValue: '10000.00',
    });
    const cash = await accountRepository(userId).create({
      name: '现金',
      type: 'cash',
      openingBalance: '0.00',
    });

    const disposed = await disposeAsset({
      userId,
      assetAccountId: asset.account.id,
      cashAccountId: cash.id,
      proceeds: '10000.00',
    });
    expect(toCents(disposed.currentValue)).toBe(0); // 资产清零
    expect(disposed.isDisposed).toBe(true);

    const cashNow = await accountRepository(userId).findById(cash.id);
    expect(toCents(cashNow!.balance)).toBe(toCents('10000.00')); // 现金 +proceeds
  });
});
