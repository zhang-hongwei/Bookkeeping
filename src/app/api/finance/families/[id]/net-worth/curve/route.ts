/**
 * 家庭净资产曲线 API（Phase 4 / US1）。
 * - GET /api/finance/families/:id/net-worth/curve?from=YYYY-MM-DD&to=YYYY-MM-DD
 *   家庭曲线 = Σ 各成员共享净资产（读 finance_family_net_worth_snapshots + 缺口回填）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../../../_lib/auth';
import { requireFamilyMembership } from '../../../../_lib/family-auth';
import { familyCurveQuerySchema } from '../../../../_lib/validation';
import { getFamilyCurve } from '@/services/finance/family-net-worth.service';
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

    const sp = request.nextUrl.searchParams;
    const parsed = familyCurveQuerySchema.safeParse({
      from: sp.get('from'),
      to: sp.get('to'),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const points = await getFamilyCurve(id, userId, parsed.data.from, parsed.data.to);
    return NextResponse.json({ points });
  } catch (error) {
    if (error instanceof ShareScopeError) {
      return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 });
    }
    console.error('GET /api/finance/families/[id]/net-worth/curve error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL' }, { status: 500 });
  }
}
