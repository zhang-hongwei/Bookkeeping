/**
 * 家庭 API 鉴权辅助（Phase 4）。
 *
 * finance 全域此前无 403 路径（research.md 决策9）。家庭端点（路径含 families/[id]）
 * 在 requireUserId 之后须再校验调用者为该家庭的 active 成员，否则 403 FORBIDDEN。
 *
 * 用法：
 * ```ts
 * const authed = await requireUserId();
 * if (authed instanceof NextResponse) return authed;
 * const userId = authed;
 * const membership = await requireFamilyMembership(familyId, userId);
 * if (membership instanceof NextResponse) return membership;
 * ```
 */
import { NextResponse } from 'next/server';
import { familyRepository } from '@/repositories/finance/family.repository';
import type { FamilyMemberItem } from '@/database/schema/finance';

export { ShareScopeError } from '@/services/finance/balance.service';

/**
 * 要求调用者为指定家庭的 active 成员。
 * 返回成员关系，或一个可直接 return 的 403 响应。
 */
export async function requireFamilyMembership(
  familyId: string,
  userId: string,
): Promise<FamilyMemberItem | NextResponse> {
  const member = await familyRepository.findActiveMember(familyId, userId);
  if (!member) {
    return NextResponse.json(
      { error: '无权访问该家庭数据', code: 'FORBIDDEN' },
      { status: 403 },
    );
  }
  return member;
}
