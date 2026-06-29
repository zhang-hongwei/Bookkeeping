/**
 * 月报详情 API（US3）。
 * - GET /api/finance/reports/:id   报告元数据 + 正文；比对 sourceDataHash，数据已变化 → stale:true
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { getReport } from '@/services/finance/report.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const view = await getReport(userId, id);
    if (!view) {
      return NextResponse.json({ error: '报告不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json(view);
  } catch (error) {
    console.error('GET /api/finance/reports/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
