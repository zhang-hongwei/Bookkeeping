/**
 * 负债更新 API（Phase 2）。
 * - PATCH /api/finance/liabilities/:id   更新元数据（不改 balance/paidAmount）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../_lib/auth';
import { patchLiabilitySchema } from '../../_lib/validation';
import { toLiabilityDto } from '../../_lib/serialize';
import { updateLiability } from '@/services/finance/liability.service';

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

    const parsed = patchLiabilitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const v = parsed.data;

    const liability = await updateLiability({
      userId,
      liabilityAccountId: id,
      name: v.name,
      includeInNetWorth: v.includeInNetWorth,
      interestRate: v.interestRate ?? undefined,
      monthlyPayment: v.monthlyPayment ?? undefined,
      dueDate: v.dueDate ?? undefined,
      statementDay: v.statementDay ?? undefined,
      repaymentDay: v.repaymentDay ?? undefined,
    });
    if (!liability) {
      return NextResponse.json({ error: '负债不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json({ liability: toLiabilityDto(liability) });
  } catch (error) {
    console.error('PATCH /api/finance/liabilities/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
