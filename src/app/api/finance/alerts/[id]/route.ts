/**
 * 智能预警单条 API（Phase 6，FR-002 / FR-008）。
 * - PATCH /api/finance/alerts/:id  { status: acknowledged | silenced }  → 200 AlertDTO
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../_lib/auth';
import { patchAlertSchema } from '../../_lib/validation';
import { toAlertDto } from '../../_lib/serialize';
import { patchAlertStatus } from '@/services/finance/alert.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '请求体不是合法 JSON', code: 'BAD_BODY' },
        { status: 400 },
      );
    }
    const parsed = patchAlertSchema.safeParse(body);
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

    const updated = await patchAlertStatus(userId, id, parsed.data.status);
    if (!updated) {
      return NextResponse.json(
        { error: '预警不存在', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    return NextResponse.json(toAlertDto(updated));
  } catch (error) {
    console.error('PATCH /api/finance/alerts/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
