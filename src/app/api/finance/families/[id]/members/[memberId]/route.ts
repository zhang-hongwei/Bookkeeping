/**
 * 家庭成员（单个）API（Phase 4 / US2）。
 * - PATCH   /api/finance/families/:id/members/:memberId   更新（displayName/role/shareMode/defaultView）
 * - DELETE  /api/finance/families/:id/members/:memberId   退出（软删除，US3 语义）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../../../_lib/auth';
import { requireFamilyMembership } from '../../../../_lib/family-auth';
import { updateMemberSchema } from '../../../../_lib/validation';
import { toFamilyMemberDto } from '../../../../_lib/serialize';
import { updateMember, leaveFamily } from '@/services/finance/family.service';
import { ShareScopeError } from '@/services/finance/balance.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    const { id, memberId } = await params;
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const membership = await requireFamilyMembership(id, userId);
    if (membership instanceof NextResponse) return membership;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: '请求体不是合法 JSON', code: 'BAD_BODY' }, { status: 400 });
    }
    const parsed = updateMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const member = await updateMember({
      familyId: id,
      actorUserId: userId,
      memberId,
      displayName: parsed.data.displayName,
      role: parsed.data.role,
      shareMode: parsed.data.shareMode,
      defaultView: parsed.data.defaultView,
    });
    return NextResponse.json({ member: toFamilyMemberDto(member) });
  } catch (error) {
    if (error instanceof ShareScopeError) {
      return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 });
    }
    console.error('PATCH /api/finance/families/[id]/members/[memberId] error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    const { id, memberId } = await params;
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const membership = await requireFamilyMembership(id, userId);
    if (membership instanceof NextResponse) return membership;

    const member = await leaveFamily(id, userId, memberId);
    return NextResponse.json({ member: toFamilyMemberDto(member) });
  } catch (error) {
    if (error instanceof ShareScopeError) {
      return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 });
    }
    console.error('DELETE /api/finance/families/[id]/members/[memberId] error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL' }, { status: 500 });
  }
}
