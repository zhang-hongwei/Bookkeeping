/**
 * 成员支出画像 API（Phase 4 / US2）。
 * - GET /api/finance/families/:id/members/:memberId/profile?from=&to=
 *   按 memberId 聚合收支/结余/支出分类 Top5（归属口径，与账号 owner 正交；I6）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../../../../_lib/auth';
import { requireFamilyMembership } from '../../../../../_lib/family-auth';
import { memberProfileQuerySchema } from '../../../../../_lib/validation';
import { getMemberProfile } from '@/services/finance/family-attribution.service';
import { ShareScopeError } from '@/services/finance/balance.service';

export async function GET(
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

    const sp = request.nextUrl.searchParams;
    const parsed = memberProfileQuerySchema.safeParse({
      from: sp.get('from') ?? undefined,
      to: sp.get('to') ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const profile = await getMemberProfile({
      familyId: id,
      userId,
      memberId,
      from: parsed.data.from,
      to: parsed.data.to,
    });
    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof ShareScopeError) {
      return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 });
    }
    console.error('GET /api/finance/families/[id]/members/[memberId]/profile error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL' }, { status: 500 });
  }
}
