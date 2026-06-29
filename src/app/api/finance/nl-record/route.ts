/**
 * 自然语言记账 API（US4）。
 * - POST /api/finance/nl-record   一句话 → 候选交易（含 confidence），不落库。
 *
 * 返回：`{ candidate, confidence, reason? }`；解析失败 → `candidate:null` + reason。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { parseNaturalLanguage } from '@/services/finance/nl-record.service';

export async function POST(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    let body: { text?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '请求体不是合法 JSON', code: 'BAD_BODY' },
        { status: 400 },
      );
    }

    if (!body.text || body.text.trim() === '') {
      return NextResponse.json(
        { error: '请输入要解析的内容', code: 'VALIDATION' },
        { status: 422 },
      );
    }

    const result = await parseNaturalLanguage(userId, body.text.trim());
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/finance/nl-record error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
