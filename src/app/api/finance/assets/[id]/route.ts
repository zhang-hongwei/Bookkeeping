/**
 * 资产更新 API（Phase 2）。
 * - PATCH /api/finance/assets/:id   更新资产元数据（不改 balance）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../_lib/auth';
import { patchAssetSchema } from '../../_lib/validation';
import { toAssetDto } from '../../_lib/serialize';
import { updateAsset } from '@/services/finance/asset.service';

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

    const parsed = patchAssetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const v = parsed.data;

    const asset = await updateAsset({
      userId,
      assetAccountId: id,
      name: v.name,
      includeInNetWorth: v.includeInNetWorth,
      costBasis: v.costBasis,
      valuationSource: v.valuationSource,
      estimateConfidence: v.estimateConfidence,
      valuationDate: v.valuationDate ?? undefined,
    });
    if (!asset) {
      return NextResponse.json({ error: '资产不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json({ asset: toAssetDto(asset) });
  } catch (error) {
    console.error('PATCH /api/finance/assets/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
