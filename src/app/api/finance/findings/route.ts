/**
 * 规则结论 API（US3）。
 * - GET /api/finance/findings?periodStart=&periodEnd=   即时确定性计算该周期 findings
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { computeFindings } from '@/services/finance/rules-engine.service';

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
    return NextResponse.json({
      findings: findings.map((f) => ({
        metric: f.metric,
        value: f.value,
        verdict: f.verdict,
        riskLevel: f.riskLevel,
      })),
    });
  } catch (error) {
    console.error('GET /api/finance/findings error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
