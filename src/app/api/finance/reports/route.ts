/**
 * 月报 API（US3）。
 * - GET /api/finance/reports?periodStart=&periodEnd=   报告列表/历史
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { listReports } from '@/services/finance/report.service';

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const { searchParams } = request.nextUrl;
    const periodStart = searchParams.get('periodStart');
    const periodEnd = searchParams.get('periodEnd');
    const items = await listReports(
      userId,
      periodStart && periodEnd ? { start: periodStart, end: periodEnd } : undefined,
    );
    return NextResponse.json({ items });
  } catch (error) {
    console.error('GET /api/finance/reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
