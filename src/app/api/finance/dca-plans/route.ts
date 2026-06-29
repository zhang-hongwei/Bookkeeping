/**
 * 定投计划 API（Phase 3，US3）—— 仅配置/标记（IRR 真相源是 investment_trades）。
 * - GET  /api/finance/dca-plans    列表
 * - POST /api/finance/dca-plans    创建计划
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../_lib/auth';
import { createDcaPlanSchema } from '../_lib/validation';
import { createDcaPlan, listDcaPlans } from '@/services/finance/dca-plan.service';
import type { DcaPlanItem } from '@/database/schema/finance';

function toDcaPlanDto(p: DcaPlanItem) {
  return {
    id: p.id,
    instrumentCode: p.instrumentCode,
    instrumentType: p.instrumentType,
    amount: p.amount,
    frequency: p.frequency,
    dayOfPeriod: p.dayOfPeriod,
    cashAccountId: p.cashAccountId,
    active: p.active,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function GET() {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const items = await listDcaPlans(userId);
    return NextResponse.json({ items: items.map(toDcaPlanDto) });
  } catch (error) {
    console.error('GET /api/finance/dca-plans error:', error);
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
    const parsed = createDcaPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const v = parsed.data;
    const plan = await createDcaPlan(userId, { ...v });
    return NextResponse.json({ plan: toDcaPlanDto(plan) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/finance/dca-plans error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
