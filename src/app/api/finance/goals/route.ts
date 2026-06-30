/**
 * 目标 API（Phase 5，US2，FR-005/006/007）。
 * - POST /api/finance/goals   创建目标（linked 须账号属当前用户，否则 422 INVARIANT）
 * - GET  /api/finance/goals   我的目标列表（含 ETA）
 *
 * currentAmount/progressRate/eta 均派生自账目/净资产（单一事实源，I1）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import {
  createGoalSchema,
  progressQuerySchema,
} from '@/app/api/finance/_lib/validation';
import { toGoalDto } from '@/app/api/finance/_lib/serialize';
import {
  createGoal,
  listGoalsWithProgress,
} from '@/services/finance/goal.service';
import { LedgerInvariantError } from '@/services/finance/ledger.service';

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const status = (request.nextUrl.searchParams.get('status') ?? 'active') as
      | 'active'
      | 'archived';
    const q = progressQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const windowMonths = q.success ? q.data.windowMonths : undefined;
    const goals = await listGoalsWithProgress(userId, {
      status: ['active', 'archived'].includes(status) ? status : 'active',
      windowMonths,
    });
    return NextResponse.json({ goals: goals.map(toGoalDto) });
  } catch (error) {
    console.error('GET /api/finance/goals error:', error);
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
    const parsed = createGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    try {
      const goal = await createGoal(userId, parsed.data);
      return NextResponse.json({ goal: toGoalDto(goal) }, { status: 201 });
    } catch (err) {
      if (err instanceof LedgerInvariantError) {
        return NextResponse.json({ error: err.message, code: 'INVARIANT' }, { status: 422 });
      }
      throw err;
    }
  } catch (error) {
    console.error('POST /api/finance/goals error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
