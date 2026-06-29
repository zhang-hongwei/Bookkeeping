/**
 * 账户 API。
 * - GET  /api/finance/accounts   列表（带余额，可按 type 过滤、是否含归档）
 * - POST /api/finance/accounts   建账（balance 初始化为 openingBalance）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../_lib/auth';
import { createAccountSchema } from '../_lib/validation';
import { accountRepository } from '@/repositories/finance/account.repository';
import type { AccountType } from '@/database/schema/finance';

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const { searchParams } = request.nextUrl;
    const accounts = await accountRepository(userId).list({
      type: (searchParams.get('type') as AccountType | null) ?? undefined,
      includeArchived: searchParams.get('include_archived') === 'true',
    });
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('GET /api/finance/accounts error:', error);
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

    const parsed = createAccountSchema.safeParse(body);
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
    const v = parsed.data;

    const account = await accountRepository(userId).create({
      name: v.name,
      type: v.type,
      openingBalance: v.openingBalance,
      currency: v.currency,
      creditLimit: v.creditLimit,
      includeInNetWorth: v.includeInNetWorth,
    });
    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error('POST /api/finance/accounts error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
