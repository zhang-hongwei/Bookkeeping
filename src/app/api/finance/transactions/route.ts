/**
 * 交易 API（复式核心）。
 * - GET  /api/finance/transactions   列表（按账户/分类/类型/时间/来源筛选 + 分页）
 * - POST /api/finance/transactions   记账（服务层展开为平衡 entries，原子维护余额）
 *
 * 金额为字符串；落库后 Σdebit==Σcredit，不平衡 → 422。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../_lib/auth';
import { createTransactionSchema } from '../_lib/validation';
import {
  createTransaction,
  LedgerInvariantError,
} from '@/services/finance/ledger.service';
import { assertMemberBelongsToCallerFamily } from '@/services/finance/family.service';
import { ShareScopeError } from '@/services/finance/balance.service';
import { transactionRepository } from '@/repositories/finance/transaction.repository';
import type { TransactionType, TransactionSource } from '@/database/schema/finance';

function parseDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function toNum(value: string | null, fallback: number): number {
  const n = value ? Number(value) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const { searchParams } = request.nextUrl;
    const result = await transactionRepository(userId).list({
      accountId: searchParams.get('accountId') ?? undefined,
      categoryId: searchParams.get('categoryId') ?? undefined,
      type: (searchParams.get('type') as TransactionType | null) ?? undefined,
      source: (searchParams.get('source') as TransactionSource | null) ?? undefined,
      from: parseDate(searchParams.get('from')),
      to: parseDate(searchParams.get('to')),
      page: Math.max(1, toNum(searchParams.get('page'), 1)),
      pageSize: Math.min(100, Math.max(1, toNum(searchParams.get('pageSize'), 20))),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/finance/transactions error:', error);
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

    const parsed = createTransactionSchema.safeParse(body);
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

    try {
      // Phase 4：校验 memberId 归属调用者所在家庭（防伪造）
      if (v.memberId) {
        await assertMemberBelongsToCallerFamily(userId, v.memberId);
      }
      const { transaction } = await createTransaction({
        userId,
        type: v.type,
        amount: v.amount,
        fromAccountId: v.fromAccountId ?? undefined,
        toAccountId: v.toAccountId ?? undefined,
        categoryId: v.categoryId ?? undefined,
        occurredAt: parseDate(v.occurredAt),
        note: v.note,
        source: v.source,
        memberId: v.memberId ?? undefined,
      });
      const withEntries = await transactionRepository(userId).findById(transaction.id);
      return NextResponse.json(
        { transaction: withEntries ?? { ...transaction, entries: [] } },
        { status: 201 },
      );
    } catch (err) {
      if (err instanceof ShareScopeError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      if (err instanceof LedgerInvariantError) {
        return NextResponse.json(
          { error: err.message, code: 'INVARIANT' },
          { status: 422 },
        );
      }
      throw err;
    }
  } catch (error) {
    console.error('POST /api/finance/transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
