/**
 * 账单导入批次详情 API（US3）。
 * - GET /api/finance/import/:id   批次详情 + 候选行（预览/调整用）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { getImport } from '@/services/finance/import.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const detail = await getImport(userId, id);
    if (!detail) {
      return NextResponse.json({ error: '导入批次不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json(detail);
  } catch (error) {
    console.error('GET /api/finance/import/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
