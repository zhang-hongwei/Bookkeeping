/**
 * 目标进度与 ETA 明细 API（Phase 5，US2/US3，FR-006/SC-003）。
 * - GET /api/finance/goals/[id]/progress?windowMonths=3
 *   返回 goal + progress（currentAmount/progressRate/completed/eta）+ surplusSeries（可解释可追溯）。
 * - avgMonthlySurplus≤0 → etaStatus='unreachable'、etaDate=null（I5，无虚假乐观）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { progressQuerySchema } from '@/app/api/finance/_lib/validation';
import { toGoalDto, toGoalProgressDto } from '@/app/api/finance/_lib/serialize';
import { getGoalProgressDetail } from '@/services/finance/goal.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { id } = await params;

    const parsed = progressQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const detail = await getGoalProgressDetail(userId, id, parsed.data.windowMonths);
    if (!detail) {
      return NextResponse.json({ error: '目标不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json(
      toGoalProgressDto(
        toGoalDto(detail.goal),
        detail.progress,
        detail.surplusSeries,
      ),
    );
  } catch (error) {
    console.error('GET /api/finance/goals/[id]/progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
