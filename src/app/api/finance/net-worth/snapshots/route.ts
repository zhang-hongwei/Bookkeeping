/**
 * 净资产曲线 API（US1）。
 * - GET /api/finance/net-worth/snapshots?from=&to=&view=high|all   区间快照（缺口懒回填）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { netWorthViewSchema } from '@/app/api/finance/_lib/validation';
import { snapshotRange, deriveViewNetWorth } from '@/services/finance/net-worth.service';

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const { searchParams } = request.nextUrl;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (!from || !to) {
      return NextResponse.json(
        { error: '需要 from 与 to 日期参数', code: 'VALIDATION' },
        { status: 422 },
      );
    }
    const viewParsed = netWorthViewSchema.safeParse(searchParams.get('view') ?? 'all');
    const view = viewParsed.success ? viewParsed.data : 'all';

    const rows = await snapshotRange(userId, from, to);
    return NextResponse.json({
      view,
      items: rows.map((s) => {
        const v = deriveViewNetWorth(
          {
            totalAssets: s.totalAssets,
            totalLiabilities: s.totalLiabilities,
            netWorth: s.netWorth,
            breakdown: s.breakdown,
          },
          view,
        );
        return {
          date: s.date,
          totalAssets: v.totalAssets,
          totalLiabilities: v.totalLiabilities,
          netWorth: v.netWorth,
          breakdown: v.breakdown,
        };
      }),
    });
  } catch (error) {
    console.error('GET /api/finance/net-worth/snapshots error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
