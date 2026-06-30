/**
 * 退休模拟 LLM 解读 API（Phase 7，US3，NC5 零编造）。
 * - POST /api/finance/retirement/[id]/interpret
 *
 * 仅解读三点区间与可持续性；不得新增数字。LLM 不可用 → { text: "" }（200）。
 * 红线：须保留「区间仅供方向参考、非确定预测」原意（SC-003）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import {
  interpretStructured,
  ZERO_FABRICATION_SYSTEM,
} from '@/app/api/finance/_lib/analysis-common';
import { toRetirementDto, type RetirementDTO } from '@/app/api/finance/_lib/serialize';
import { getRetirement } from '@/services/finance/retirement.service';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { id } = await params;

    const item = await getRetirement(userId, id);
    if (!item) {
      return NextResponse.json(
        { error: '模拟不存在或不属于当前用户', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    const dto = toRetirementDto(item);
    const fmt = (p: RetirementDTO['resultBaseline']) =>
      `corpus ¥${p.retirementCorpus}，月可支撑 ¥${p.monthlySustainable}，耗尽年龄 ${p.depletionAge ?? '可持续'}`;
    const userPrompt = `退休模拟（时长 ${dto.horizonMonths} 月），状态 ${dto.status}。
假设：${JSON.stringify(dto.assumptions)}
三点区间：悲观 ${fmt(dto.resultPessimistic)}；中性 ${fmt(dto.resultBaseline)}；乐观 ${fmt(dto.resultOptimistic)}。
可持续性判定（中性口径）：${dto.sustainableVerdict}。
免责：${dto.disclaimers.join(' / ')}`;

    const text = await interpretStructured({
      systemPrompt: `${ZERO_FABRICATION_SYSTEM} 你在解读一个退休模拟结果（三点区间 + 可持续性），须保留「区间仅供方向参考、非确定预测」原意。`,
      userPrompt,
    });
    return NextResponse.json({ text });
  } catch (error) {
    console.error('POST /api/finance/retirement/[id]/interpret error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
