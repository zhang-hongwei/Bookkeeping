/**
 * 投资分红 API（Phase 3）。
 * - POST /api/finance/positions/:id/dividend   kind=cash（income 2 腿，持仓不变）/ kind=reinvest（份额+成本稀释+revaluation）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../../_lib/auth';
import { dividendSchema } from '../../../_lib/validation';
import { toPositionDto } from '../../../_lib/serialize';
import { dividend } from '@/services/finance/investment.service';
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

    const parsed = dividendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const v = parsed.data;

    const result = await dividend(
      v.kind === 'cash'
        ? {
            userId,
            positionId: id,
            kind: 'cash',
            cashAccountId: v.cashAccountId,
            amount: v.amount,
            occurredAt: v.occurredAt ? new Date(v.occurredAt) : undefined,
            note: v.note,
          }
        : {
            userId,
            positionId: id,
            kind: 'reinvest',
            shares: v.shares,
            price: v.price,
            occurredAt: v.occurredAt ? new Date(v.occurredAt) : undefined,
            note: v.note,
          },
    );
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
    console.error('POST /api/finance/positions/[id]/dividend error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
