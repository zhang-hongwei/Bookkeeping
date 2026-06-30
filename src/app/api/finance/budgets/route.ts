/**
 * 预算 API（Phase 5，US1，FR-001/002/003/004）。
 * - POST /api/finance/budgets          创建预算（建前查重，重复→422 INVARIANT）
 * - GET  /api/finance/budgets          我的预算列表（含当前周期派生状态，D1 现算）
 *
 * 金额一律 string；已用/剩余读时现算自账目（单一事实源，I1/SC-001）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import {
  createBudgetSchema,
  budgetQuerySchema,
} from '@/app/api/finance/_lib/validation';
import { toBudgetDto } from '@/app/api/finance/_lib/serialize';
import {
  createBudget,
  listBudgetsWithStatus,
} from '@/services/finance/budget.service';
import { LedgerInvariantError } from '@/services/finance/ledger.service';

function refDate(period: string | undefined): Date {
  return period ? new Date(period + 'T00:00:00Z') : new Date();
}

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const parsed = budgetQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const active =
      parsed.data.active === undefined ? undefined : parsed.data.active === 'true';
    const budgets = await listBudgetsWithStatus(userId, {
      active,
      refDate: refDate(parsed.data.period),
    });
    return NextResponse.json({ budgets: budgets.map(toBudgetDto) });
  } catch (error) {
    console.error('GET /api/finance/budgets error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '请求体不是合法 JSON', code: 'BAD_BODY' },
        { status: 400 },
      );
    }
    const parsed = createBudgetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    try {
      const budget = await createBudget(userId, {
        categoryId: parsed.data.categoryId ?? null,
        name: parsed.data.name ?? null,
        amount: parsed.data.amount,
        periodType: parsed.data.periodType,
        alertThreshold: parsed.data.alertThreshold,
      });
      return NextResponse.json({ budget: toBudgetDto(budget) }, { status: 201 });
    } catch (err) {
      if (err instanceof LedgerInvariantError) {
        return NextResponse.json({ error: err.message, code: 'INVARIANT' }, { status: 422 });
      }
      throw err;
    }
  } catch (error) {
    console.error('POST /api/finance/budgets error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
