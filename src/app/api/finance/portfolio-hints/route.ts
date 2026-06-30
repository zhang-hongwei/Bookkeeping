/**
 * 组合优化方向 API（Phase 7，US4，FR-004/SC-004/SC-005）。
 * - GET /api/finance/portfolio-hints  当前持仓的方向建议（随持仓重算覆盖）
 *
 * 无持仓/总市值 0 → hints: []（NC6，不编造）。免责强制含「非投资建议」（I11）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { requireFamilyMembership } from '@/app/api/finance/_lib/family-auth';
import { familyQuerySchema } from '@/app/api/finance/_lib/validation';
import { toPortfolioHintsDto } from '@/app/api/finance/_lib/serialize';
import { computeHintsForUser } from '@/services/finance/portfolio-hint.service';

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const parsed = familyQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
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

    // 随持仓重算覆盖（落新批次），返回当前方向建议
    const result = await computeHintsForUser({ userId });
    return NextResponse.json({
      portfolioHints: toPortfolioHintsDto(
        result.batchId,
        result.hints,
        result.totalMarketValue,
        result.targetBandsVersion,
        result.engineVersion,
        result.disclaimers,
      ),
    });
  } catch (error) {
    console.error('GET /api/finance/portfolio-hints error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
