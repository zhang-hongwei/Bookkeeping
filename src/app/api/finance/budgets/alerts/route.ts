/**
 * 预算预警汇总 API（Phase 5，FR-002/SC-002）。
 * - GET /api/finance/budgets/alerts?period=&status=warning|overrun
 *   所有 active 预算的当前周期 BudgetAlert（D3 纯函数现算）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { budgetAlertsQuerySchema } from '@/app/api/finance/_lib/validation';
import { toBudgetAlertDto } from '@/app/api/finance/_lib/serialize';
import { listBudgetAlerts } from '@/services/finance/budget.service';
import type { BudgetStatus } from '@/database/schema/finance';

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const parsed = budgetAlertsQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const period = parsed.data.period;
    const alerts = await listBudgetAlerts(userId, {
      refDate: period ? new Date(period + 'T00:00:00Z') : new Date(),
      status: parsed.data.status as BudgetStatus | undefined,
    });
    return NextResponse.json({ alerts: alerts.map(toBudgetAlertDto) });
  } catch (error) {
    console.error('GET /api/finance/budgets/alerts error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
