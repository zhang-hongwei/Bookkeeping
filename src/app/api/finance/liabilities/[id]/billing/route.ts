/**
 * 信用卡账单周期 API（Phase 2，FR-006）。
 * - GET /api/finance/liabilities/:id/billing   本期账单/已还/待还 + 还款日提示（仅 credit）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../../_lib/auth';
import { getCreditCardPeriod } from '@/services/finance/liability.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { id } = await params;

    const billing = await getCreditCardPeriod(userId, id);
    return NextResponse.json(billing);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    // 非 credit 账户
    if (message.startsWith('NOT_CREDIT')) {
      return NextResponse.json({ error: '仅信用卡账户支持账单周期', code: 'NOT_CREDIT' }, { status: 400 });
    }
    console.error('GET /api/finance/liabilities/[id]/billing error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
