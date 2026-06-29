/**
 * US1 家庭合并净资产集成测试（T025，gated by FINANCE_INTEGRATION_TEST=1）。
 *
 * 覆盖：家庭 live 净资产 = Σ 成员共享账号（SC-001/I1）、
 * 私有账号不并入（I2/SC-002，US3 前置）、非成员 → ShareScopeError（I3/SC-003）、
 * 家庭曲线区间（含回填）。
 */
import { describe, it, expect } from 'vitest';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';
import { db } from '@/database/client';
import { financeAccounts } from '@/database/schema/finance';
import { createFamily, addMember } from '@/services/finance/family.service';
import {
  computeFamilyNetWorthLive,
  getFamilyCurve,
} from '@/services/finance/family-net-worth.service';
import { ShareScopeError } from '@/services/finance/balance.service';

/** 直接插入账户（设 openingBalance=balance，便于净值断言）。 */
async function makeAccount(
  userId: string,
  balance: string,
  visibility: 'shared' | 'private' = 'shared',
) {
  const [a] = await db
    .insert(financeAccounts)
    .values({
      userId,
      name: `acct-${userId.slice(-4)}`,
      type: 'cash',
      openingBalance: balance,
      balance,
      visibility,
      includeInNetWorth: true,
    })
    .returning();
  return a!;
}

const suite = describe.skipIf(!INTEGRATION_ENABLED);

suite('US1 家庭合并净资产（集成）', () => {
  it('家庭 live 净资产 = Σ 成员共享账号（SC-001/I1）', async () => {
    const owner = uniqueUserId();
    const partner = uniqueUserId();
    const { family } = await createFamily({ userId: owner, name: '家' });
    await addMember({
      familyId: family.id,
      actorUserId: owner,
      userId: partner,
      displayName: '伴侣',
      role: 'partner',
    });
    await makeAccount(owner, '500.00', 'shared');
    await makeAccount(partner, '300.00', 'shared');
    const nw = await computeFamilyNetWorthLive(family.id, owner);
    expect(nw.netWorth).toBe('800.00');
    expect(Object.keys(nw.memberBreakdown).length).toBeGreaterThanOrEqual(2);
  });

  it('私有账号不并入家庭净资产（I2/SC-002）', async () => {
    const owner = uniqueUserId();
    const { family } = await createFamily({ userId: owner, name: '家' });
    await makeAccount(owner, '1000.00', 'shared');
    await makeAccount(owner, '9999.00', 'private'); // 私房钱
    const nw = await computeFamilyNetWorthLive(family.id, owner);
    expect(nw.netWorth).toBe('1000.00');
  });

  it('非成员访问家庭净资产 → ShareScopeError（I3/SC-003）', async () => {
    const owner = uniqueUserId();
    const intruder = uniqueUserId();
    const { family } = await createFamily({ userId: owner, name: '家' });
    await expect(computeFamilyNetWorthLive(family.id, intruder)).rejects.toBeInstanceOf(
      ShareScopeError,
    );
  });

  it('家庭曲线区间返回点（含回填）', async () => {
    const owner = uniqueUserId();
    const { family } = await createFamily({ userId: owner, name: '家' });
    await makeAccount(owner, '200.00', 'shared');
    const today = new Date().toISOString().slice(0, 10);
    const points = await getFamilyCurve(family.id, owner, today, today);
    expect(points.length).toBeGreaterThanOrEqual(1);
    expect(points[0].netWorth).toBe('200.00');
  });
});
