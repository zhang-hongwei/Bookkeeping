/**
 * 净资产仪表盘 API（US1）。
 * - GET /api/finance/net-worth   总资产/总负债/净资产 + 今日变化（相对昨日）
 *
 * 今日净值由当前 balance 实时推导；今日变化 = 今日 − 昨日（由 entries 重算）。
 */
import { NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import {
  computeNetWorthLive,
  computeNetWorthAtDate,
  snapshotToday,
} from '@/services/finance/net-worth.service';
import { toCents, fromCents } from '@/services/finance/money';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayStr(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const live = await computeNetWorthLive(userId);
    const yesterday = await computeNetWorthAtDate(userId, yesterdayStr());
    const todayChangeCents = toCents(live.netWorth) - toCents(yesterday.netWorth);

    // 懒写今日快照（best-effort，失败不阻断仪表盘）
    await snapshotToday(userId).catch(() => undefined);

    return NextResponse.json({
      date: todayStr(),
      totalAssets: live.totalAssets,
      totalLiabilities: live.totalLiabilities,
      netWorth: live.netWorth,
      todayChange: fromCents(todayChangeCents),
      breakdown: live.breakdown,
    });
  } catch (error) {
    console.error('GET /api/finance/net-worth error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
