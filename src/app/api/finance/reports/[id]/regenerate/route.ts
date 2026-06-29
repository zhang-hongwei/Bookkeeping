/**
 * 重新生成月报 API（US3）。
 * - POST /api/finance/reports/:id/regenerate   以最新数据重新生成，刷新 sourceDataHash
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { regenerate } from '@/services/finance/report.service';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const result = await regenerate(userId, id);
    if (!result) {
      return NextResponse.json({ error: '报告不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/finance/reports/[id]/regenerate error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
