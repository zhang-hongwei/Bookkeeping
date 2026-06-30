/**
 * 财务健康分 API（US4 / Phase 6 FR-006）。
 * - GET /api/finance/health-score?periodStart=&periodEnd=
 *   findings 加权 0–100 + 各维度（缺失降权标注）。
 * - Phase 6：investmentRate 接 Phase 3 持仓、cashflow 为方差稳定性评分（决策 12）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { computeHealthScoreForUser } from '@/services/finance/rules-engine.service';

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const { searchParams } = request.nextUrl;
    const periodStart = searchParams.get('periodStart');
    const periodEnd = searchParams.get('periodEnd');
    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { error: '需要 periodStart 与 periodEnd', code: 'VALIDATION' },
        { status: 422 },
      );
    }

    const health = await computeHealthScoreForUser(userId, { start: periodStart, end: periodEnd });
    return NextResponse.json({ total: health.total, dimensions: health.dimensions });
  } catch (error) {
    console.error('GET /api/finance/health-score error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
