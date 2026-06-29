/**
 * US2 成员归属与画像集成测试（T026/T033，gated by FINANCE_INTEGRATION_TEST=1）。
 *
 * 覆盖：按 memberId 聚合收支（FR-002/FR-004）、joint 不计入个人画像（I6）、
 * 退出后历史 memberId 保留（I4/SC-004）、伪造他人家庭 memberId 被拒（决策9）。
 */
import { describe, it, expect } from 'vitest';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';
import { db } from '@/database/client';
import { financeAccounts } from '@/database/schema/finance';
import {
  createFamily,
  addMember,
  leaveFamily,
  assertMemberBelongsToCallerFamily,
} from '@/services/finance/family.service';
import { createTransaction } from '@/services/finance/ledger.service';
import { getMemberProfile } from '@/services/finance/family-attribution.service';
import { ShareScopeError } from '@/services/finance/balance.service';

async function makeCashAccount(userId: string, balance: string) {
  const [a] = await db
    .insert(financeAccounts)
    .values({
      userId,
      name: 'cash',
      type: 'cash',
      openingBalance: balance,
      balance,
      includeInNetWorth: true,
    })
    .returning();
  return a!;
}

const suite = describe.skipIf(!INTEGRATION_ENABLED);

suite('US2 成员归属与画像（集成）', () => {
  it('按 memberId 聚合支出；joint 不计入个人画像（I6）', async () => {
    const owner = uniqueUserId();
    const { family, members } = await createFamily({ userId: owner, name: '家' });
    const joint = members.find((m) => m.role === 'joint')!;
    const partnerMember = await addMember({
      familyId: family.id,
      actorUserId: owner,
      userId: uniqueUserId(),
      displayName: '伴侣',
      role: 'partner',
    });
    const acc = await makeCashAccount(owner, '10000.00');
    // 伴侣支出 200（归属 partner）
    await createTransaction({
      userId: owner,
      type: 'expense',
      amount: '200.00',
      fromAccountId: acc.id,
      memberId: partnerMember.id,
    });
    // 共同支出 500（归属 joint）
    await createTransaction({
      userId: owner,
      type: 'expense',
      amount: '500.00',
      fromAccountId: acc.id,
      memberId: joint.id,
    });

    const partnerProfile = await getMemberProfile({
      familyId: family.id,
      userId: owner,
      memberId: partnerMember.id,
    });
    expect(partnerProfile.expense).toBe('200.00'); // 仅 partner 的，joint 的 500 不计入个人

    const jointProfile = await getMemberProfile({
      familyId: family.id,
      userId: owner,
      memberId: joint.id,
    });
    expect(jointProfile.expense).toBe('500.00'); // 共同消费在 joint 桶
  });

  it('成员退出后历史 memberId 保留（I4/SC-004）', async () => {
    const owner = uniqueUserId();
    const { family, members } = await createFamily({ userId: owner, name: '家' });
    const partnerMember = await addMember({
      familyId: family.id,
      actorUserId: owner,
      userId: uniqueUserId(),
      displayName: '伴侣',
      role: 'partner',
    });
    const acc = await makeCashAccount(owner, '10000.00');
    await createTransaction({
      userId: owner,
      type: 'expense',
      amount: '300.00',
      fromAccountId: acc.id,
      memberId: partnerMember.id,
    });

    const left = await leaveFamily(family.id, owner, partnerMember.id);
    expect(left.status).toBe('left');

    // 退出后按 memberId 仍可聚合（历史归属保留）
    const profile = await getMemberProfile({
      familyId: family.id,
      userId: owner,
      memberId: partnerMember.id,
    });
    expect(profile.expense).toBe('300.00');
  });

  it('伪造他人家庭 memberId 被拒（决策9）', async () => {
    const ownerA = uniqueUserId();
    const ownerB = uniqueUserId();
    const { members: membersA } = await createFamily({ userId: ownerA, name: '家A' });
    await createFamily({ userId: ownerB, name: '家B' });
    const partnerInA = membersA.find((m) => m.role === 'self')!;
    // ownerB 不在 家A，使用 家A 的成员 id 应被拒
    await expect(
      assertMemberBelongsToCallerFamily(ownerB, partnerInA.id),
    ).rejects.toBeInstanceOf(ShareScopeError);
  });
});
