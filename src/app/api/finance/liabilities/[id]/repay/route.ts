/**
 * 贷款/信用卡还款 API（Phase 2，FR-004）。
 * - POST /api/finance/liabilities/:id/repay   本金/利息拆分 3 腿还款
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../../_lib/auth';
import { repaySchema } from '../../../_lib/validation';
import { recordRepayment } from '@/services/finance/ledger.service';
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

    const parsed = repaySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const v = parsed.data;

    const result = await recordRepayment({
      userId,
      liabilityAccountId: id,
      cashAccountId: v.cashAccountId,
      principal: v.principal,
      interest: v.interest,
      occurredAt: v.occurredAt ? new Date(v.occurredAt) : undefined,
      note: v.note,
      earlyRepayment: v.earlyRepayment,
    });
    return NextResponse.json({
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        amount: result.transaction.amount,
        principalAmount: result.transaction.principalAmount,
        interestAmount: result.transaction.interestAmount,
        occurredAt: result.transaction.occurredAt.toISOString(),
      },
      remainingPrincipal: result.remainingPrincipal,
      paidAmount: result.paidAmount,
    });
  } catch (error) {
    if (error instanceof LedgerInvariantError) {
      return NextResponse.json({ error: error.message, code: 'LEDGER_INVARIANT' }, { status: 400 });
    }
    console.error('POST /api/finance/liabilities/[id]/repay error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
