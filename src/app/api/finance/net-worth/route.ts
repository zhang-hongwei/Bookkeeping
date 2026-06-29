/**
 * 净资产仪表盘 API（US1）。
 * - GET /api/finance/net-worth?view=high|all   总资产/总负债/净资产 + 今日变化（相对昨日）
 *
 * 今日净值由当前 balance 实时推导；今日变化 = 今日 − 昨日（由 entries 重算）。
 * view=high 仅高流动性资产（过滤 real_asset 估值点），view=all（默认）全部家底（FR-003）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { netWorthViewSchema } from '@/app/api/finance/_lib/validation';
import {
  computeNetWorthLive,
  computeNetWorthAtDate,
  snapshotToday,
  deriveViewNetWorth,
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

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const viewParsed = netWorthViewSchema.safeParse(
      request.nextUrl.searchParams.get('view') ?? 'all',
    );
    const view = viewParsed.success ? viewParsed.data : 'all';

    const live = deriveViewNetWorth(await computeNetWorthLive(userId), view);
    const yesterday = deriveViewNetWorth(
      await computeNetWorthAtDate(userId, yesterdayStr()),
      view,
    );
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
      view,
    });
  } catch (error) {
    console.error('GET /api/finance/net-worth error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
