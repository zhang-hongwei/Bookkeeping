/**
 * 投资持仓 API（Phase 3，US1）。
 * - GET  /api/finance/positions          列表（带派生指标：市值/成本/盈亏/收益率）
 * - POST /api/finance/positions          登记 investment 账户 + 1:1 positions
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../_lib/auth';
import { createPositionSchema } from '../_lib/validation';
import { toPositionDto } from '../_lib/serialize';
import {
  listPositions,
  registerPosition,
} from '@/services/finance/investment.service';
import type { InstrumentType } from '@/database/schema/finance';
import { LedgerInvariantError } from '@/services/finance/balance.service';

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const sp = request.nextUrl.searchParams;
    const instrumentType = sp.get('instrumentType') as InstrumentType | null;
    const includeClosed = sp.get('includeClosed') === 'true';

    const items = await listPositions(userId, {
      instrumentType: instrumentType ?? undefined,
      includeClosed,
    });
    return NextResponse.json({ items: items.map(toPositionDto) });
  } catch (error) {
    console.error('GET /api/finance/positions error:', error);
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

    const parsed = createPositionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const v = parsed.data;

    const position = await registerPosition({
      userId,
      name: v.name,
      instrumentCode: v.instrumentCode,
      instrumentType: v.instrumentType,
      currency: v.currency,
      includeInNetWorth: v.includeInNetWorth,
    });
    return NextResponse.json({ position: toPositionDto(position) }, { status: 201 });
  } catch (error) {
    if (error instanceof LedgerInvariantError) {
      return NextResponse.json({ error: error.message, code: 'LEDGER_INVARIANT' }, { status: 400 });
    }
    console.error('POST /api/finance/positions error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
