/**
 * 现金流预测 API（Phase 6，FR-001）。
 * - GET /api/finance/forecasts?months=&target=YYYY-MM  读取/即时生成预测缓存
 * - POST /api/finance/forecasts  以最新数据重算并覆盖缓存（幂等）
 * 响应统一 DisclaimerEnvelope<ForecastDTO>（FR-009/SC-002）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import {
  forecastQuerySchema,
  forecastPostSchema,
} from '@/app/api/finance/_lib/validation';
import {
  toForecastDto,
  withDisclaimer,
  forecastSourceRefs,
} from '@/app/api/finance/_lib/serialize';
import {
  getForecast,
  generateForecast,
} from '@/services/finance/forecast.service';
import { monthPeriod } from '@/services/finance/rules-engine.service';

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const parsed = forecastQuerySchema.safeParse(
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
    const targetMonth = parsed.data.target ?? currentMonth();
    const view = await getForecast(userId, {
      targetMonth,
      horizon: parsed.data.months,
      period: monthPeriod(targetMonth),
    });
    return NextResponse.json(
      withDisclaimer(toForecastDto(view), forecastSourceRefs(view.history)),
    );
  } catch (error) {
    console.error('GET /api/finance/forecasts error:', error);
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
    const parsed = forecastPostSchema.safeParse(body ?? {});
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
    const targetMonth = parsed.data.targetMonth ?? currentMonth();
    const view = await generateForecast(userId, {
      targetMonth,
      horizon: parsed.data.months,
      period: monthPeriod(targetMonth),
    });
    return NextResponse.json(
      withDisclaimer(toForecastDto(view), forecastSourceRefs(view.history)),
    );
  } catch (error) {
    console.error('POST /api/finance/forecasts error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
