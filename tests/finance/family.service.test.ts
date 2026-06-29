/**
 * US1 家庭与成员管理集成测试（T012，gated by FINANCE_INTEGRATION_TEST=1）。
 *
 * 覆盖：createFamily 自动生成 self+joint（决策1/5）、一人一家庭、
 * 非成员访问 → ShareScopeError（I3/SC-003）、addMember、软退出（决策6）、joint 不可退出。
 */
import { describe, it, expect } from 'vitest';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';
import {
  createFamily,
  getFamilyWithMembers,
  addMember,
  leaveFamily,
} from '@/services/finance/family.service';
import { ShareScopeError } from '@/services/finance/balance.service';

const suite = describe.skipIf(!INTEGRATION_ENABLED);

suite('US1 家庭与成员（集成）', () => {
  it('createFamily 自动生成 self + joint 成员（决策1/5）', async () => {
    const userId = uniqueUserId();
    const { family, members } = await createFamily({ userId, name: '测试家' });
    expect(family.createdByUserId).toBe(userId);
    const roles = members.map((m) => m.role).sort();
    expect(roles).toEqual(['joint', 'self']);
    const self = members.find((m) => m.role === 'self')!;
    expect(self.userId).toBe(userId);
    const joint = members.find((m) => m.role === 'joint')!;
    expect(joint.userId).toBeNull();
  });

  it('一人一家庭：重复创建抛 ShareScopeError', async () => {
    const userId = uniqueUserId();
    await createFamily({ userId, name: '家A' });
    await expect(createFamily({ userId, name: '家B' })).rejects.toBeInstanceOf(
      ShareScopeError,
    );
  });

  it('非 active 成员访问家庭 → ShareScopeError（I3/SC-003）', async () => {
    const owner = uniqueUserId();
    const intruder = uniqueUserId();
    const { family } = await createFamily({ userId: owner, name: '家' });
    await expect(getFamilyWithMembers(family.id, intruder)).rejects.toBeInstanceOf(
      ShareScopeError,
    );
  });

  it('addMember 邀请成员；leaveFamily 软退出（决策6）', async () => {
    const owner = uniqueUserId();
    const partner = uniqueUserId();
    const { family } = await createFamily({ userId: owner, name: '家' });
    const m = await addMember({
      familyId: family.id,
      actorUserId: owner,
      userId: partner,
      displayName: '伴侣',
      role: 'partner',
    });
    expect(m.status).toBe('active');
    const left = await leaveFamily(family.id, owner, m.id);
    expect(left.status).toBe('left');
    expect(left.leftAt).not.toBeNull();
  });

  it('joint 成员不可退出（决策5）', async () => {
    const owner = uniqueUserId();
    const { family, members } = await createFamily({ userId: owner, name: '家' });
    const joint = members.find((m) => m.role === 'joint')!;
    await expect(leaveFamily(family.id, owner, joint.id)).rejects.toBeInstanceOf(
      ShareScopeError,
    );
  });
});
