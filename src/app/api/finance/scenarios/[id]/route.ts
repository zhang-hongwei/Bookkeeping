/**
 * What-if 情景详情 API（Phase 7，US1）。
 * - GET /api/finance/scenarios/[id]  详情（含全部投影点）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { toScenarioDto } from '@/app/api/finance/_lib/serialize';
import { getScenario } from '@/services/finance/scenario.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { id } = await params;

    const result = await getScenario(userId, id);
    if (!result) {
      return NextResponse.json(
        { error: '情景不存在或不属于当前用户', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    return NextResponse.json({
      scenario: toScenarioDto(result.scenario, result.projections),
    });
  } catch (error) {
    console.error('GET /api/finance/scenarios/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
