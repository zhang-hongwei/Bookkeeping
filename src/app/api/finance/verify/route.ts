/**
 * 账目不变式巡检 API（Polish T035）。
 * - POST /api/finance/verify   手动触发 verifyAll：重算所有账户余额，不一致则修复并返回。
 *
 * 供手动/定时巡检接入；发现 balance 与重算不一致时自动修复（SC-007 自愈）。
 */
import { NextResponse } from 'next/server';
import { requireUserId } from '../_lib/auth';
import { verifyAll } from '@/services/finance/balance.service';

export async function POST() {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const mismatches = await verifyAll(userId);
    return NextResponse.json({
      checked: true,
      mismatchCount: mismatches.length,
      fixed: mismatches.length, // verifyAll 已自动修复
      mismatches,
    });
  } catch (error) {
    console.error('POST /api/finance/verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
