/**
 * 资产估值更新 API（Phase 2，FR-008）。
 * - POST /api/finance/assets/:id/revalue   revaluation 交易（资产 ↔ __revaluation）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../../_lib/auth';
import { revalueSchema } from '../../../_lib/validation';
import { toAssetDto } from '../../../_lib/serialize';
import { revalueAsset } from '@/services/finance/asset.service';
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

    const parsed = revalueSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const v = parsed.data;

    const asset = await revalueAsset({
      userId,
      assetAccountId: id,
      newValue: v.newValue,
      confidence: v.confidence,
      source: v.source,
      occurredAt: v.occurredAt ? new Date(v.occurredAt) : undefined,
    });
    return NextResponse.json({ asset: toAssetDto(asset) });
  } catch (error) {
    if (error instanceof LedgerInvariantError) {
      return NextResponse.json({ error: error.message, code: 'LEDGER_INVARIANT' }, { status: 400 });
    }
    console.error('POST /api/finance/assets/[id]/revalue error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
