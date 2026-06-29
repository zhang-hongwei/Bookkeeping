/**
 * 品种实时行情 API（Phase 3，US2，D3/SC-004）。
 * - GET /api/finance/instruments/:code/quote?type=fund
 *   成功 200 {latestPrice, priceSource:'market'|'estimate', priceUpdatedAt, isStale:false}
 *   行情不可用 → 503 MARKET_UNAVAILABLE（提示手动输入，绝不伪造价格）。
 *
 * Node 运行时（外部 fetch + 文本解析，非 Edge）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../../_lib/auth';
import { getQuote, MarketDataUnavailableError } from '@/services/finance/market-data.service';
import type { InstrumentType } from '@/database/schema/finance';

// 强制 Node 运行时（外部 HTTP 行情源 + 文本解析，Edge 不支持）。
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { code } = await params;
    const type = (request.nextUrl.searchParams.get('type') ?? 'fund') as InstrumentType;

    const quote = await getQuote(userId, code, type);
    return NextResponse.json(quote);
  } catch (error) {
    if (error instanceof MarketDataUnavailableError) {
      return NextResponse.json(
        { error: error.message, code: 'MARKET_UNAVAILABLE', details: { suggestion: 'manual' } },
        { status: 503 },
      );
    }
    console.error('GET /api/finance/instruments/[code]/quote error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
