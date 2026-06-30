/**
 * 目标详情/更新/删除 API（Phase 5，FR-005/007）。
 * - GET    /api/finance/goals/[id]   详情（含 ETA）
 * - PATCH  /api/finance/goals/[id]   更新（首次达标记 completedAt，C4）
 * - DELETE /api/finance/goals/[id]   删除
 * 跨用户访问 → 404（C7）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { updateGoalSchema } from '@/app/api/finance/_lib/validation';
import { toGoalDto } from '@/app/api/finance/_lib/serialize';
import {
  getGoalWithProgress,
  updateGoal,
  deleteGoal,
} from '@/services/finance/goal.service';
import { LedgerInvariantError } from '@/services/finance/ledger.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { id } = await params;

    const goal = await getGoalWithProgress(userId, id);
    if (!goal) {
      return NextResponse.json({ error: '目标不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json({ goal: toGoalDto(goal) });
  } catch (error) {
    console.error('GET /api/finance/goals/[id] error:', error);
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
    const parsed = updateGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    try {
      const goal = await updateGoal(userId, id, parsed.data);
      if (!goal) {
        return NextResponse.json({ error: '目标不存在', code: 'NOT_FOUND' }, { status: 404 });
      }
      return NextResponse.json({ goal: toGoalDto(goal) });
    } catch (err) {
      if (err instanceof LedgerInvariantError) {
        return NextResponse.json({ error: err.message, code: 'INVARIANT' }, { status: 422 });
      }
      throw err;
    }
  } catch (error) {
    console.error('PATCH /api/finance/goals/[id] error:', error);
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

    const ok = await deleteGoal(userId, id);
    if (!ok) {
      return NextResponse.json({ error: '目标不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/finance/goals/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
