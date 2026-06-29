/**
 * 资产配置 API（Phase 3，US4，FR-007/SC-005）。
 * - GET /api/finance/allocation?view=by_type   按品种类型占比 + 集中度预警（advisory）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../_lib/auth';
import { toAllocationDto } from '../_lib/serialize';
import { getAllocation } from '@/services/finance/investment.service';

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const view = request.nextUrl.searchParams.get('view') ?? 'by_type';

    const alloc = await getAllocation(userId, view);
    return NextResponse.json(toAllocationDto(alloc));
  } catch (error) {
    console.error('GET /api/finance/allocation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
