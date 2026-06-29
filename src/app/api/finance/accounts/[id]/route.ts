/**
 * 账户（单个）API（US2）。
 * - PATCH   /api/finance/accounts/:id   更新（归档/恢复、额度、计入净资产、改名；不改余额）
 * - DELETE  /api/finance/accounts/:id   硬删（仅无关联交易；否则 409 建议归档）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../_lib/auth';
import { patchAccountSchema } from '../../_lib/validation';
import {
  accountService,
  AccountConflictError,
} from '@/services/finance/account.service';

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

    const parsed = patchAccountSchema.safeParse(body);
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

    const account = await accountService.update(userId, id, {
      name: v.name,
      isArchived: v.isArchived,
      includeInNetWorth: v.includeInNetWorth,
      creditLimit: v.creditLimit,
      visibility: v.visibility,
    });
    if (!account) {
      return NextResponse.json({ error: '账户不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    // Phase 4：可见性切换影响家庭合并净资产，best-effort 刷新家庭快照
    if (v.visibility) {
      try {
        const { refreshFamilySnapshotsForUser } = await import(
          '@/services/finance/family-net-worth.service'
        );
        const today = new Date().toISOString().slice(0, 10);
        await refreshFamilySnapshotsForUser(userId, today);
      } catch {
        // 家庭快照刷新为可选增强，不阻断账号更新
      }
    }
    return NextResponse.json({ account });
  } catch (error) {
    console.error('PATCH /api/finance/accounts/[id] error:', error);
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
      await accountService.delete(userId, id);
      return new NextResponse(null, { status: 204 });
    } catch (err) {
      if (err instanceof AccountConflictError) {
        return NextResponse.json(
          { error: err.message, code: 'CONFLICT' },
          { status: 409 },
        );
      }
      throw err;
    }
  } catch (error) {
    console.error('DELETE /api/finance/accounts/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
