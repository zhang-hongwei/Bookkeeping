/**
 * 家庭合并净资产（今日）API（Phase 4 / US1）。
 * - GET /api/finance/families/:id/net-worth?view=high|all
 *   家庭净资产 = Σ 各成员共享账号 live 净资产，含 memberBreakdown（SC-001/I1/I2）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../../_lib/auth';
import { requireFamilyMembership } from '../../../_lib/family-auth';
import { netWorthViewSchema } from '../../../_lib/validation';
import { toFamilyNetWorthDto } from '../../../_lib/serialize';
import { computeFamilyNetWorthLive } from '@/services/finance/family-net-worth.service';
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

    const viewParam = request.nextUrl.searchParams.get('view') ?? 'all';
    const viewParsed = netWorthViewSchema.safeParse(viewParam);
    const view = viewParsed.success ? viewParsed.data : 'all';

    const nw = await computeFamilyNetWorthLive(id, userId, view);
    return NextResponse.json({ netWorth: toFamilyNetWorthDto(nw) });
  } catch (error) {
    if (error instanceof ShareScopeError) {
      return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 });
    }
    console.error('GET /api/finance/families/[id]/net-worth error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL' }, { status: 500 });
  }
}
