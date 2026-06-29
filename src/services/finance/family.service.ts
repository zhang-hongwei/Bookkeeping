/**
 * 家庭与成员管理服务（Phase 4 / US1）。
 *
 * - 创建家庭 = 单事务写 family + self 成员 + joint 成员（决策1/5）。
 * - 本阶段约束：一人仅可在一个 active 家庭（防止多家庭复杂度）。
 * - 成员退出软删除（status='left'），不删行、不动个人数据（决策6）。
 * - 鉴权：非 active 成员访问 → ShareScopeError（API 层映射 403）。
 */
import { familyRepository } from '@/repositories/finance/family.repository';
import { ShareScopeError } from './balance.service';
import type {
  FamilyItem,
  FamilyMemberItem,
  FamilyMemberRole,
  ShareMode,
  DefaultView,
} from '@/database/schema/finance';

export interface CreateFamilyInput {
  userId: string;
  name: string;
  defaultCurrency?: string;
}

export interface AddMemberInput {
  familyId: string;
  actorUserId: string;
  userId?: string | null;
  displayName: string;
  role: Exclude<FamilyMemberRole, 'self' | 'joint'>;
  shareMode?: ShareMode;
}

export interface UpdateMemberInput {
  familyId: string;
  actorUserId: string;
  memberId: string;
  displayName?: string;
  role?: Exclude<FamilyMemberRole, 'self' | 'joint'>;
  shareMode?: ShareMode;
  defaultView?: DefaultView;
}

export interface FamilyWithMembers {
  family: FamilyItem;
  members: FamilyMemberItem[];
}

/** 创建家庭（创建者自动成为 self；joint 行自动生成）。 */
export async function createFamily(
  input: CreateFamilyInput,
): Promise<{ family: FamilyItem; members: FamilyMemberItem[] }> {
  // 一人一家庭 active（本阶段约束）
  const existing = await familyRepository.findFamiliesByUser(input.userId);
  if (existing.length > 0) {
    throw new ShareScopeError('已在家庭中，本阶段仅支持加入一个家庭');
  }
  const { family, selfMember, jointMember } =
    await familyRepository.createFamilyWithFoundingMembers({
      name: input.name,
      createdByUserId: input.userId,
      defaultCurrency: input.defaultCurrency,
    });
  return { family, members: [selfMember, jointMember] };
}

/** 当前用户的家庭列表（active 成员；本阶段通常 ≤1）。 */
export async function listMyFamilies(userId: string): Promise<FamilyItem[]> {
  return familyRepository.findFamiliesByUser(userId);
}

async function assertMember(
  familyId: string,
  userId: string,
): Promise<FamilyMemberItem> {
  const member = await familyRepository.findActiveMember(familyId, userId);
  if (!member) throw new ShareScopeError('无权访问该家庭数据');
  return member;
}

/** 家庭详情 + 成员列表（须为 active 成员）。 */
export async function getFamilyWithMembers(
  familyId: string,
  userId: string,
  { includeLeft = false }: { includeLeft?: boolean } = {},
): Promise<FamilyWithMembers> {
  await assertMember(familyId, userId);
  const family = await familyRepository.findFamilyById(familyId);
  if (!family) throw new ShareScopeError('家庭不存在');
  const members = await familyRepository.listMembers(familyId, { includeLeft });
  return { family, members };
}

/** 更新家庭（仅创建者 self）。 */
export async function updateFamily(
  familyId: string,
  userId: string,
  patch: { name: string },
): Promise<FamilyItem> {
  const member = await assertMember(familyId, userId);
  if (member.role !== 'self') throw new ShareScopeError('仅家庭创建者可修改');
  const family = await familyRepository.updateFamily(familyId, patch);
  if (!family) throw new ShareScopeError('家庭不存在');
  return family;
}

/** 解散家庭（仅创建者）：所有成员 status='left'，家庭对成员不再可见（软删，保留历史快照）。 */
export async function dissolveFamily(
  familyId: string,
  userId: string,
): Promise<void> {
  const member = await assertMember(familyId, userId);
  if (member.role !== 'self') throw new ShareScopeError('仅家庭创建者可解散');
  const members = await familyRepository.listMembers(familyId, {
    includeLeft: false,
  });
  for (const m of members) {
    if (m.role === 'joint') continue; // joint 保留为系统锚（家庭已无人可见即可）
    await familyRepository.softLeaveMember(m.id);
  }
}

/** 添加成员（须为 active 成员；role 不可为 self/joint；防重复 active 加入）。 */
export async function addMember(input: AddMemberInput): Promise<FamilyMemberItem> {
  await assertMember(input.familyId, input.actorUserId);
  // 防止同一 userId 重复 active 加入本家庭
  if (input.userId) {
    const dup = await familyRepository.findActiveMember(
      input.familyId,
      input.userId,
    );
    if (dup) throw new ShareScopeError('该用户已是家庭成员');
  }
  return familyRepository.addMember({
    familyId: input.familyId,
    userId: input.userId,
    displayName: input.displayName,
    role: input.role,
    shareMode: input.shareMode,
  });
}

/** 更新成员（本人改自己，或 self 改他人；role 不可改为 self/joint）。 */
export async function updateMember(
  input: UpdateMemberInput,
): Promise<FamilyMemberItem> {
  await assertMember(input.familyId, input.actorUserId);
  const target = await familyRepository.findMemberById(input.memberId);
  if (!target || target.familyId !== input.familyId)
    throw new ShareScopeError('成员不存在');
  if (target.role === 'joint')
    throw new ShareScopeError('共同(joint)成员不可修改角色');
  return (
    (await familyRepository.updateMember(input.memberId, {
      displayName: input.displayName,
      role: input.role,
      shareMode: input.shareMode,
      defaultView: input.defaultView,
    })) ?? target
  );
}

/**
 * 成员退出（软删除）：status='left'。joint 不可退出；不动个人数据、不清 memberId。
 * 允许本人退出自己，或 self 移除他人。
 */
export async function leaveFamily(
  familyId: string,
  actorUserId: string,
  memberId: string,
): Promise<FamilyMemberItem> {
  await assertMember(familyId, actorUserId);
  const target = await familyRepository.findMemberById(memberId);
  if (!target || target.familyId !== familyId)
    throw new ShareScopeError('成员不存在');
  if (target.role === 'joint')
    throw new ShareScopeError('共同(joint)成员不可退出');
  const left = await familyRepository.softLeaveMember(memberId);
  if (!left) throw new ShareScopeError('成员不存在');
  return left;
}

/**
 * 校验归属 memberId 属于调用者所在 active 家庭（防伪造他人家庭 memberId）。
 * 用于交易标记 memberId 时的鉴权（contracts/api.md §6）。
 */
export async function assertMemberBelongsToCallerFamily(
  userId: string,
  memberId: string,
): Promise<FamilyMemberItem> {
  const member = await familyRepository.findMemberById(memberId);
  if (!member) throw new ShareScopeError('归属成员不存在');
  const caller = await familyRepository.findActiveMember(member.familyId, userId);
  if (!caller) throw new ShareScopeError('无权使用该归属成员');
  return member;
}
