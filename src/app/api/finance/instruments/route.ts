/**
 * 投资品种行情 API（Phase 3，US2）。
 * - GET  /api/finance/instruments?type=fund          行情缓存列表
 * - POST /api/finance/instruments                     手动录入/修正现价（source='manual'，FR-004 降级兜底）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../_lib/auth';
import { upsertManualPriceSchema } from '../_lib/validation';
import { toInstrumentDto } from '../_lib/serialize';
import { listInstruments, upsertManualPrice } from '@/services/finance/market-data.service';
import type { InstrumentType } from '@/database/schema/finance';

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const type = request.nextUrl.searchParams.get('type') as InstrumentType | null;
    const items = await listInstruments(userId, type ?? undefined);
    return NextResponse.json({ items: items.map(toInstrumentDto) });
  } catch (error) {
    console.error('GET /api/finance/instruments error:', error);
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
    const parsed = upsertManualPriceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const v = parsed.data;
    const instrument = await upsertManualPrice(userId, {
      code: v.code,
      type: v.type,
      name: v.name,
      latestPrice: v.latestPrice,
    });
    return NextResponse.json({ instrument: toInstrumentDto(instrument) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/finance/instruments error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
