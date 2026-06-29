/**
 * 账单导入确认 API（US3）。
 * - POST /api/finance/import/:id/confirm   将选中（缺省=全部 pending）行落库为交易
 *   体：`{ rowIds?: string[], defaultAccountId?: string }`
 *   返回：`{ imported, skipped, failed }`
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { confirmImport } from '@/services/finance/import.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    let body: { rowIds?: string[]; defaultAccountId?: string } = {};
    try {
      body = await request.json();
    } catch {
      // 允许空体（缺省=全部 pending）
    }

    const result = await confirmImport(userId, id, {
      rowIds: body.rowIds,
      defaultAccountId: body.defaultAccountId,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/finance/import/[id]/confirm error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('不存在') ? 404 : 500;
    return NextResponse.json({ error: message, code: status === 404 ? 'NOT_FOUND' : 'INTERNAL' }, { status });
  }
}
