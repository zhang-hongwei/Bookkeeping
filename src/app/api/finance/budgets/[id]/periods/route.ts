/**
 * 预算历史周期 API（Phase 5，FR-003/SC-005）。
 * - GET /api/finance/budgets/[id]/periods?from=&to=
 *   读 finance_budget_periods 不可变快照（I3；当前周期不在此列，用详情现算）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { periodRangeSchema } from '@/app/api/finance/_lib/validation';
import { toBudgetPeriodDto } from '@/app/api/finance/_lib/serialize';
import { listPeriodHistory } from '@/services/finance/budget.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { id } = await params;

    const parsed = periodRangeSchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    // 归属校验：listPeriodHistory 经 userId-scoped 仓库，非本人预算返回空（不泄漏存在性）。
    const periods = await listPeriodHistory(userId, id, parsed.data.from, parsed.data.to);
    return NextResponse.json({ periods: periods.map(toBudgetPeriodDto) });
  } catch (error) {
    console.error('GET /api/finance/budgets/[id]/periods error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
