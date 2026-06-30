/**
 * 多期趋势对比 API（Phase 6，FR-005 / SC-004）。
 * - GET /api/finance/trends?metric=savings_rate,debt_ratio,score&periods=12
 *   纯函数聚合 listReports + 各期 findings → 时序 + 方向 + deteriorating（决策 13）。
 * 响应统一 DisclaimerEnvelope<TrendDTO>（FR-009/SC-002）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../_lib/auth';
import { trendQuerySchema } from '../_lib/validation';
import {
  toTrendDto,
  trendSourceRefs,
  withDisclaimer,
} from '../_lib/serialize';
import { getTrends, TREND_METRICS, type TrendMetricParam } from '@/services/finance/trend.service';

const ALLOWED_METRICS = new Set<string>(TREND_METRICS);

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const parsed = trendQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: '参数校验失败',
          code: 'VALIDATION',
          details: parsed.error.flatten(),
        },
        { status: 422 },
      );
    }

    // 解析 metric 列表并过滤白名单（非法指标忽略，不报错）
    const requested = (parsed.data.metric ?? '')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    const metrics = (
      requested.length > 0 ? requested : [...TREND_METRICS]
    ).filter((m) => ALLOWED_METRICS.has(m)) as TrendMetricParam[];

    const view = await getTrends(userId, {
      metrics,
      periods: parsed.data.periods,
    });
    return NextResponse.json(
      withDisclaimer(toTrendDto(view), trendSourceRefs(view.series)),
    );
  } catch (error) {
    console.error('GET /api/finance/trends error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
