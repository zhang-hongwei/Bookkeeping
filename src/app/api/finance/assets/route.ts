/**
 * 资产 API（Phase 2）。
 * - GET  /api/finance/assets           列表（带明细 + 当前价值=balance + 估值置信度）
 * - POST /api/finance/assets           登记 real_asset/investment 账户 + 明细
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../_lib/auth';
import { createAssetSchema } from '../_lib/validation';
import { toAssetDto } from '../_lib/serialize';
import { listAssets, registerAsset } from '@/services/finance/asset.service';

export async function GET() {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const items = await listAssets(userId);
    return NextResponse.json({ items: items.map(toAssetDto) });
  } catch (error) {
    console.error('GET /api/finance/assets error:', error);
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

    const parsed = createAssetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const v = parsed.data;

    const asset = await registerAsset({
      userId,
      name: v.name,
      type: v.type,
      currentValue: v.currentValue,
      costBasis: v.costBasis,
      valuationSource: v.valuationSource,
      estimateConfidence: v.estimateConfidence,
      valuationDate: v.valuationDate ?? null,
      currency: v.currency,
      includeInNetWorth: v.includeInNetWorth,
    });
    return NextResponse.json({ asset: toAssetDto(asset) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/finance/assets error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
