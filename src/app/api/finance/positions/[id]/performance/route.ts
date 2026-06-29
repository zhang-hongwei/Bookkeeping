/**
 * 持仓表现 API（Phase 3，US2/US3）—— 市值/成本/盈亏/收益率 + XIRR。
 * - GET /api/finance/positions/:id/performance?asOf=YYYY-MM-DD
 *   不收敛 → irr:{annualizedRate:null, converged:false, reason}
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../../_lib/auth';
import { toPerformanceDto } from '../../../_lib/serialize';
import { getPerformance } from '@/services/finance/investment.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { id } = await params;

    const asOfParam = request.nextUrl.searchParams.get('asOf');
    const asOf = asOfParam ? new Date(asOfParam) : undefined;

    const perf = await getPerformance(userId, id, asOf);
    if (!perf) {
      return NextResponse.json({ error: '持仓不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json(toPerformanceDto(perf));
  } catch (error) {
    console.error('GET /api/finance/positions/[id]/performance error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
