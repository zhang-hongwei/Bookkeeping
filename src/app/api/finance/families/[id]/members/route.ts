/**
 * 家庭成员（列表 / 添加）API（Phase 4 / US1）。
 * - GET   /api/finance/families/:id/members   成员列表（默认仅 active）
 * - POST  /api/finance/families/:id/members   添加成员（邀请 userId 或预占槽位）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../../_lib/auth';
import { requireFamilyMembership } from '../../../_lib/family-auth';
import { addMemberSchema } from '../../../_lib/validation';
import { toFamilyMemberDto } from '../../../_lib/serialize';
import { addMember, getFamilyWithMembers } from '@/services/finance/family.service';
import { ShareScopeError } from '@/services/finance/balance.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const membership = await requireFamilyMembership(id, userId);
    if (membership instanceof NextResponse) return membership;

    const includeLeft = request.nextUrl.searchParams.get('include_left') === '1';
    const { members } = await getFamilyWithMembers(id, userId, { includeLeft });
    return NextResponse.json({ members: members.map(toFamilyMemberDto) });
  } catch (error) {
    if (error instanceof ShareScopeError) {
      return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 });
    }
    console.error('GET /api/finance/families/[id]/members error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const member = await addMember({
      familyId: id,
      actorUserId: userId,
      userId: parsed.data.userId,
      displayName: parsed.data.displayName,
      role: parsed.data.role,
      shareMode: parsed.data.shareMode,
    });
    return NextResponse.json({ member: toFamilyMemberDto(member) }, { status: 201 });
  } catch (error) {
    if (error instanceof ShareScopeError) {
      return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 });
    }
    console.error('POST /api/finance/families/[id]/members error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL' }, { status: 500 });
  }
}
