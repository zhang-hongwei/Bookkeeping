/**
 * 资产处置 API（Phase 2，Edge Case）。
 * - POST /api/finance/assets/:id/dispose   disposal 交易（现金 + 资产清零 + 实现损益）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../../_lib/auth';
import { disposeSchema } from '../../../_lib/validation';
import { toAssetDto } from '../../../_lib/serialize';
import { disposeAsset } from '@/services/finance/asset.service';
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

    const parsed = disposeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const v = parsed.data;

    const asset = await disposeAsset({
      userId,
      assetAccountId: id,
      cashAccountId: v.cashAccountId,
      proceeds: v.proceeds,
      occurredAt: v.occurredAt ? new Date(v.occurredAt) : undefined,
      note: v.note,
    });
    return NextResponse.json({ asset: toAssetDto(asset) });
  } catch (error) {
    if (error instanceof LedgerInvariantError) {
      return NextResponse.json({ error: error.message, code: 'LEDGER_INVARIANT' }, { status: 400 });
    }
    console.error('POST /api/finance/assets/[id]/dispose error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
