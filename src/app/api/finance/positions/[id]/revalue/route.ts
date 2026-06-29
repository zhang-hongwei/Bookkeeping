/**
 * 投资估值同步 API（Phase 3，US2，FR-008）。
 * - POST /api/finance/positions/:id/revalue   revaluation 2 腿（持仓 ↔ __revaluation）+ 更新现价缓存
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../../_lib/auth';
import { revaluePositionSchema } from '../../../_lib/validation';
import { toPositionDto } from '../../../_lib/serialize';
import { revalue } from '@/services/finance/investment.service';
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

    const parsed = revaluePositionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const v = parsed.data;

    const result = await revalue({
      userId,
      positionId: id,
      currentPrice: v.currentPrice,
      source: v.source,
      fetchedAt: v.fetchedAt ? new Date(v.fetchedAt) : undefined,
    });
    return NextResponse.json({
      transaction: result.transaction
        ? {
            id: result.transaction.id,
            type: result.transaction.type,
            amount: result.transaction.amount,
            occurredAt: result.transaction.occurredAt.toISOString(),
          }
        : null,
      position: toPositionDto(result.position),
    });
  } catch (error) {
    if (error instanceof LedgerInvariantError) {
      return NextResponse.json({ error: error.message, code: 'LEDGER_INVARIANT' }, { status: 400 });
    }
    console.error('POST /api/finance/positions/[id]/revalue error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
