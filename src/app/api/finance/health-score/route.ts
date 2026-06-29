/**
 * 财务健康分 API（US4）。
 * - GET /api/finance/health-score?periodStart=&periodEnd=   findings 加权 0–100 + 各维度（缺失降权标注）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { computeFindings, computeHealthScore } from '@/services/finance/rules-engine.service';

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

    const findings = await computeFindings(userId, { start: periodStart, end: periodEnd });
    const health = computeHealthScore(findings);
    return NextResponse.json({ total: health.total, dimensions: health.dimensions });
  } catch (error) {
    console.error('GET /api/finance/health-score error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
