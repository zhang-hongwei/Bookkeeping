/**
 * 生成月报 API（US3）。
 * - POST /api/finance/reports/monthly   体：{ periodStart, periodEnd }
 *   findings → LLM 表达 → 写 ai_reports；LLM 失败降级模板（status=degraded）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { generateMonthly } from '@/services/finance/report.service';

export async function POST(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const body = await request.json();
    const { periodStart, periodEnd } = body ?? {};
    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { error: '需要 periodStart 与 periodEnd', code: 'VALIDATION' },
        { status: 422 },
      );
    }

    const result = await generateMonthly(userId, { start: periodStart, end: periodEnd });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST /api/finance/reports/monthly error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
