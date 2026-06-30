/**
 * 退休模拟最近一次 API（Phase 7，US3）。
 * - GET /api/finance/retirement/latest  取最近一次模拟（无则 null）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { requireFamilyMembership } from '@/app/api/finance/_lib/family-auth';
import { familyQuerySchema } from '@/app/api/finance/_lib/validation';
import { toRetirementDto } from '@/app/api/finance/_lib/serialize';
import { getLatestRetirement } from '@/services/finance/retirement.service';

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
    const item = await getLatestRetirement(userId);
    return NextResponse.json({ retirement: item ? toRetirementDto(item) : null });
  } catch (error) {
    console.error('GET /api/finance/retirement/latest error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
