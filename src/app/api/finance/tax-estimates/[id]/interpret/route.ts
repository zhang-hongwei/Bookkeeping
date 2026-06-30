/**
 * 个税估算 LLM 解读 API（Phase 7，US2，NC5 零编造）。
 * - POST /api/finance/tax-estimates/[id]/interpret
 *
 * 仅解读计税方式差异与规则化节税方向；不得新增数字。LLM 不可用 → { text: "" }（200）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import {
  interpretStructured,
  ZERO_FABRICATION_SYSTEM,
} from '@/app/api/finance/_lib/analysis-common';
import { toTaxEstimateDto } from '@/app/api/finance/_lib/serialize';
import { getTaxEstimate } from '@/services/finance/tax.service';

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { id } = await params;

    const item = await getTaxEstimate(userId, id);
    if (!item) {
      return NextResponse.json(
        { error: '估算不存在或不属于当前用户', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    const dto = toTaxEstimateDto(item);
    const userPrompt = `纳税年度 ${dto.taxYear}，规则版本 ${dto.ruleVintage}。
输入：${JSON.stringify(dto.inputs)}
计税对比：单独计税合计 ¥${dto.methodComparison.separate.taxAmount}，并入综合合计 ¥${dto.methodComparison.merged.taxAmount}，差额 ¥${dto.methodComparison.diff}（较优：${dto.methodComparison.better}）。
较优方向应纳税额 ¥${dto.totalTaxAmount}，实际税率 ${dto.effectiveRate ?? 'N/A'}。
规则化提示：${dto.hints.map((h) => h.text).join(' / ')}
免责：${dto.disclaimers.join(' / ')}`;

    const text = await interpretStructured({
      systemPrompt: `${ZERO_FABRICATION_SYSTEM} 你在解读中国个税估算结果（年终奖单独/并入计税对比）。`,
      userPrompt,
    });
    return NextResponse.json({ text });
  } catch (error) {
    console.error('POST /api/finance/tax-estimates/[id]/interpret error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
