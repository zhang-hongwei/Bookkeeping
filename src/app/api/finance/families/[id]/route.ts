/**
 * 家庭（单个）API（Phase 4 / US1）。
 * - GET    /api/finance/families/:id   家庭详情 + 成员列表（须为 active 成员）
 * - PATCH  /api/finance/families/:id   更新（仅创建者 self）
 * - DELETE /api/finance/families/:id   解散（仅创建者；成员 status→left，保留历史）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../_lib/auth';
import { requireFamilyMembership } from '../../_lib/family-auth';
import { updateFamilySchema } from '../../_lib/validation';
import { toFamilyDto, toFamilyMemberDto } from '../../_lib/serialize';
import {
  getFamilyWithMembers,
  updateFamily,
  dissolveFamily,
} from '@/services/finance/family.service';
import { familyRepository } from '@/repositories/finance/family.repository';
import { ShareScopeError } from '@/services/finance/balance.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const membership = await requireFamilyMembership(id, userId);
    if (membership instanceof NextResponse) return membership;

    const includeLeft = _request.nextUrl.searchParams.get('include_left') === '1';
    const { family, members } = await getFamilyWithMembers(id, userId, { includeLeft });
    const memberCount = await familyRepository.countHumanActiveMembers(id);
    return NextResponse.json({
      family: toFamilyDto(family, memberCount),
      members: members.map(toFamilyMemberDto),
    });
  } catch (error) {
    if (error instanceof ShareScopeError) {
      return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 });
    }
    console.error('GET /api/finance/families/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL' }, { status: 500 });
  }
}

export async function PATCH(
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
    const parsed = updateFamilySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const family = await updateFamily(id, userId, { name: parsed.data.name });
    const memberCount = await familyRepository.countHumanActiveMembers(id);
    return NextResponse.json({ family: toFamilyDto(family, memberCount) });
  } catch (error) {
    if (error instanceof ShareScopeError) {
      return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 });
    }
    console.error('PATCH /api/finance/families/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const membership = await requireFamilyMembership(id, userId);
    if (membership instanceof NextResponse) return membership;

    await dissolveFamily(id, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ShareScopeError) {
      return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 });
    }
    console.error('DELETE /api/finance/families/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL' }, { status: 500 });
  }
}
