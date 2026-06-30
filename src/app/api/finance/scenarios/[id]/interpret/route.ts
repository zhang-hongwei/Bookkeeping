/**
 * What-if 情景 LLM 解读 API（Phase 7，US1，NC5 零编造）。
 * - POST /api/finance/scenarios/[id]/interpret
 *
 * 仅消费该情景的结构化结果，输出自然语言解读；LLM 不可用 → { text: "" }（200）。
 * 红线：LLM 不得新增/修改/推断数字（前端始终渲染结构化数字）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import {
  interpretStructured,
  ZERO_FABRICATION_SYSTEM,
} from '@/app/api/finance/_lib/analysis-common';
import { toScenarioDto } from '@/app/api/finance/_lib/serialize';
import { getScenario } from '@/services/finance/scenario.service';

export async function POST(
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
    const dto = toScenarioDto(result.scenario, result.projections);
    const userPrompt = `情景「${dto.name}」（${dto.kind}），时长 ${dto.horizonMonths} 月，状态 ${dto.status}。
假设：${JSON.stringify(dto.assumptions)}
逐月投影（baseline/scenario/delta/应急金月数）：
${dto.projections
  .map(
    (p) =>
      `  month${p.monthOffset}: baseline=${p.baselineNetWorth}, scenario=${p.scenarioNetWorth}, delta=${p.netWorthDelta}, 应急金 baseline/scenario=${p.baselineEmergencyMonths ?? 'N/A'}/${p.scenarioEmergencyMonths ?? 'N/A'}`,
  )
  .join('\n')}
免责：${dto.disclaimers.join(' / ')}`;

    const text = await interpretStructured({
      systemPrompt: `${ZERO_FABRICATION_SYSTEM} 你在解读一个 what-if 财务情景模拟结果。`,
      userPrompt,
    });
    return NextResponse.json({ text });
  } catch (error) {
    console.error('POST /api/finance/scenarios/[id]/interpret error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
