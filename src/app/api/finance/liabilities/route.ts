/**
 * 负债 API（Phase 2）。
 * - GET  /api/finance/liabilities   列表（带明细 + 剩余本金=balance + 已还）
 * - POST /api/finance/liabilities   登记 credit/贷款账户 + 明细
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../_lib/auth';
import { createLiabilitySchema } from '../_lib/validation';
import { toLiabilityDto } from '../_lib/serialize';
import { listLiabilities, registerLiability } from '@/services/finance/liability.service';

export async function GET() {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const items = await listLiabilities(authed);
    return NextResponse.json({ items: items.map(toLiabilityDto) });
  } catch (error) {
    console.error('GET /api/finance/liabilities error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}

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

    const parsed = createLiabilitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const v = parsed.data;

    const liability = await registerLiability({
      userId,
      name: v.name,
      type: v.type,
      openingBalance: v.openingBalance,
      principal: v.principal,
      interestRate: v.interestRate ?? null,
      monthlyPayment: v.monthlyPayment ?? null,
      dueDate: v.dueDate ?? null,
      statementDay: v.statementDay ?? null,
      repaymentDay: v.repaymentDay ?? null,
      currency: v.currency,
      includeInNetWorth: v.includeInNetWorth,
    });
    return NextResponse.json({ liability: toLiabilityDto(liability) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/finance/liabilities error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
