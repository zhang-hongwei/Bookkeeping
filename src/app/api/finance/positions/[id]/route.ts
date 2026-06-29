/**
 * 投资持仓明细 API（Phase 3，US1）。
 * - PATCH /api/finance/positions/:id   更新元数据（name/estimateConfidence/includeInNetWorth；不改 balance/份额/成本）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../_lib/auth';
import { patchPositionSchema } from '../../_lib/validation';
import { accountRepository } from '@/repositories/finance/account.repository';
import { positionRepository } from '@/repositories/finance/position.repository';
import { getPosition } from '@/services/finance/investment.service';
import { toPositionDto } from '../../_lib/serialize';

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

    const parsed = patchPositionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const v = parsed.data;

    // 持仓归属校验（scoped，越权 404）
    const position = await positionRepository(userId).findById(id);
    if (!position) {
      return NextResponse.json({ error: '持仓不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    // 账户元数据更新（name/includeInNetWorth）
    const accountPatch: { name?: string; includeInNetWorth?: boolean } = {};
    if (v.name !== undefined) accountPatch.name = v.name;
    if (v.includeInNetWorth !== undefined) accountPatch.includeInNetWorth = v.includeInNetWorth;
    if (Object.keys(accountPatch).length > 0) {
      await accountRepository(userId).update(position.accountId, accountPatch);
    }
    // 持仓元数据更新（estimateConfidence）
    const positionPatch: { estimateConfidence?: 'high' | 'medium' | 'low' } = {};
    if (v.estimateConfidence !== undefined) positionPatch.estimateConfidence = v.estimateConfidence;
    if (Object.keys(positionPatch).length > 0) {
      await positionRepository(userId).update(id, positionPatch);
    }

    const refreshed = await getPosition(userId, id);
    if (!refreshed) {
      return NextResponse.json({ error: '持仓不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json({ position: toPositionDto(refreshed) });
  } catch (error) {
    console.error('PATCH /api/finance/positions/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
