/**
 * 退休模拟 API（Phase 7，US3，FR-003/SC-003/SC-004）。
 * - POST /api/finance/retirement   模拟（三点区间 + 可持续性判定）
 *
 * 缺累积期/月缴 → 200 + status:'degraded' + missing（NC6）。免责强制含不确定性（I9）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { requireFamilyMembership } from '@/app/api/finance/_lib/family-auth';
import { retirementSchema } from '@/app/api/finance/_lib/validation';
import { toRetirementDto } from '@/app/api/finance/_lib/serialize';
import { computeRetirement } from '@/services/finance/retirement.service';

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
    const parsed = retirementSchema.safeParse(body);
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

    const item = await computeRetirement({
      userId,
      assumptions: parsed.data.assumptions,
    });
    return NextResponse.json({ retirement: toRetirementDto(item) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/finance/retirement error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
