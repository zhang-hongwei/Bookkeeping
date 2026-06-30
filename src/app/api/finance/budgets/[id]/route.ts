/**
 * 预算详情/更新/删除 API（Phase 5，FR-001/003）。
 * - GET    /api/finance/budgets/[id]?period=   详情（含当前周期状态）
 * - PATCH  /api/finance/budgets/[id]           更新（categoryId 不可改 C6；amount 仅影响当前+未来）
 * - DELETE /api/finance/budgets/[id]           硬删（periods FK cascade）
 * 跨用户访问 → 404（C7，不泄漏存在性）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import {
  updateBudgetSchema,
  budgetQuerySchema,
} from '@/app/api/finance/_lib/validation';
import { toBudgetDto } from '@/app/api/finance/_lib/serialize';
import {
  getBudget,
  updateBudget,
  deleteBudget,
} from '@/services/finance/budget.service';
import { LedgerInvariantError } from '@/services/finance/ledger.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { id } = await params;

    const q = budgetQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const period = q.success ? q.data.period : undefined;
    const budget = await getBudget(userId, id, period ? new Date(period + 'T00:00:00Z') : new Date());
    if (!budget) {
      return NextResponse.json({ error: '预算不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json({ budget: toBudgetDto(budget) });
  } catch (error) {
    console.error('GET /api/finance/budgets/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '请求体不是合法 JSON', code: 'BAD_BODY' },
        { status: 400 },
      );
    }
    const parsed = updateBudgetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    try {
      const budget = await updateBudget(userId, id, parsed.data);
      if (!budget) {
        return NextResponse.json({ error: '预算不存在', code: 'NOT_FOUND' }, { status: 404 });
      }
      return NextResponse.json({ budget: toBudgetDto(budget) });
    } catch (err) {
      if (err instanceof LedgerInvariantError) {
        return NextResponse.json({ error: err.message, code: 'INVARIANT' }, { status: 422 });
      }
      throw err;
    }
  } catch (error) {
    console.error('PATCH /api/finance/budgets/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { id } = await params;

    const ok = await deleteBudget(userId, id);
    if (!ok) {
      return NextResponse.json({ error: '预算不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/finance/budgets/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
