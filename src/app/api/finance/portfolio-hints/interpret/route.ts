/**
 * 组合优化方向 LLM 解读 API（Phase 7，US4，NC5 零编造）。
 * - POST /api/finance/portfolio-hints/interpret
 *
 * 仅解读方向建议（偏低/偏高/合理）；不得新增数字，严禁给出具体品种或买卖数量（I11）。
 * LLM 不可用 → { text: "" }（200）。无持仓 → { text: "" }（无可解读）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { requireFamilyMembership } from '@/app/api/finance/_lib/family-auth';
import { familyBodySchema } from '@/app/api/finance/_lib/validation';
import {
  interpretStructured,
  ZERO_FABRICATION_SYSTEM,
} from '@/app/api/finance/_lib/analysis-common';
import {
  computeHintsForUser,
  getLatestStoredHints,
} from '@/services/finance/portfolio-hint.service';

export async function POST(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const parsed = familyBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    if (parsed.data.familyId) {
      const m = await requireFamilyMembership(parsed.data.familyId, userId);
      if (m instanceof NextResponse) return m;
    }

    // 取最近落表批次；无则即时计算一次（保证 interpret 有结构化结果可消费）
    let stored = await getLatestStoredHints(userId);
    if (!stored) {
      const fresh = await computeHintsForUser({ userId });
      stored = {
        batchId: fresh.batchId,
        hints: fresh.hints,
        targetBandsVersion: fresh.targetBandsVersion,
        engineVersion: fresh.engineVersion,
      };
    }
    if (stored.hints.length === 0) {
      return NextResponse.json({ text: '' }); // 无持仓，无可解读
    }

    const userPrompt = `组合优化方向（band 版本 ${stored.targetBandsVersion}，引擎 ${stored.engineVersion}）。
各资产类别方向建议（仅方向，非买卖指令）：
${stored.hints
  .map(
    (h) =>
      `  ${h.assetClass}: 当前占比 ${h.currentRatio}，目标区间 ${(h.targetBand.min * 100).toFixed(0)}%–${(h.targetBand.max * 100).toFixed(0)}%，方向 ${h.direction}（${h.reason}）`,
  )
  .join('\n')}
免责：${stored.hints[0]?.disclaimers.join(' / ') ?? ''}`;

    const text = await interpretStructured({
      systemPrompt: `${ZERO_FABRICATION_SYSTEM} 你在解读投资组合资产类别配置偏离的方向建议（仅方向，严禁给出具体品种或买卖数量）。`,
      userPrompt,
    });
    return NextResponse.json({ text });
  } catch (error) {
    console.error('POST /api/finance/portfolio-hints/interpret error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
