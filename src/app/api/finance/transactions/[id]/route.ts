/**
 * 交易（单笔）API。
 * - PATCH  /api/finance/transactions/:id   编辑（事务内反转旧分录 + 写新 + 重算余额，SC-007）
 * - DELETE /api/finance/transactions/:id   删除（事务内回滚余额，保持其余账目平衡）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../_lib/auth';
import { patchTransactionSchema } from '../../_lib/validation';
import {
  patchTransaction,
  deleteTransaction,
  LedgerInvariantError,
} from '@/services/finance/ledger.service';
import { assertMemberBelongsToCallerFamily } from '@/services/finance/family.service';
import { ShareScopeError } from '@/services/finance/balance.service';
import { transactionRepository } from '@/repositories/finance/transaction.repository';

function parseDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    const parsed = patchTransactionSchema.safeParse(body);
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
      // Phase 4：若改归属，校验 memberId 属于调用者所在家庭
      if (v.memberId) {
        await assertMemberBelongsToCallerFamily(userId, v.memberId);
      }
      const { transaction } = await patchTransaction(userId, id, {
        type: v.type,
        amount: v.amount,
        fromAccountId: v.fromAccountId ?? undefined,
        toAccountId: v.toAccountId ?? undefined,
        categoryId: v.categoryId,
        occurredAt: parseDate(v.occurredAt),
        note: v.note,
        source: v.source,
        memberId: v.memberId,
      });
      const withEntries = await transactionRepository(userId).findById(transaction.id);
      return NextResponse.json({
        transaction: withEntries ?? { ...transaction, entries: [] },
      });
    } catch (err) {
      if (err instanceof ShareScopeError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      if (err instanceof LedgerInvariantError) {
        const status = err.message.includes('不存在') ? 404 : 422;
        return NextResponse.json(
          { error: err.message, code: status === 404 ? 'NOT_FOUND' : 'INVARIANT' },
          { status },
        );
      }
      throw err;
    }
  } catch (error) {
    console.error('PATCH /api/finance/transactions/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    try {
      await deleteTransaction(userId, id);
      return new NextResponse(null, { status: 204 });
    } catch (err) {
      if (err instanceof LedgerInvariantError) {
        const status = err.message.includes('不存在') ? 404 : 422;
        return NextResponse.json(
          { error: err.message, code: status === 404 ? 'NOT_FOUND' : 'INVARIANT' },
          { status },
        );
      }
      throw err;
    }
  } catch (error) {
    console.error('DELETE /api/finance/transactions/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
