/**
 * 投资买入 API（Phase 3，US1-AC1，SC-001）。
 * - POST /api/finance/positions/:id/buy   transfer 2 腿（借持仓 / 贷现金），净资产不变
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../../_lib/auth';
import { buySchema } from '../../../_lib/validation';
import { toPositionDto } from '../../../_lib/serialize';
import { buy } from '@/services/finance/investment.service';
import { LedgerInvariantError } from '@/services/finance/balance.service';

export async function POST(
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

    const parsed = buySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const v = parsed.data;

    const result = await buy({
      userId,
      positionId: id,
      cashAccountId: v.cashAccountId,
      shares: v.shares,
      price: v.price,
      fee: v.fee,
      occurredAt: v.occurredAt ? new Date(v.occurredAt) : undefined,
      note: v.note,
      dcaPlanId: v.dcaPlanId,
    });
    return NextResponse.json({
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        amount: result.transaction.amount,
        occurredAt: result.transaction.occurredAt.toISOString(),
      },
      position: toPositionDto(result.position),
    });
  } catch (error) {
    if (error instanceof LedgerInvariantError) {
      return NextResponse.json({ error: error.message, code: 'LEDGER_INVARIANT' }, { status: 400 });
    }
    console.error('POST /api/finance/positions/[id]/buy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
