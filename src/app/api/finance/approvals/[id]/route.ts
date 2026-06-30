/**
 * 审批详情 / 决定 API（Phase 6，FR-004 / SC-003）。
 * - GET   /api/finance/approvals/:id                 → ApprovalDTO
 * - PATCH /api/finance/approvals/:id  { decision }   → ApprovalDTO；非法转换 422
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../_lib/auth';
import { approvalDecisionSchema } from '../../_lib/validation';
import { toApprovalDto } from '../../_lib/serialize';
import {
  getApproval,
  decideApproval,
  ApprovalStateError,
} from '@/services/finance/approval.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { id } = await params;

    const approval = await getApproval(userId, id);
    if (!approval) {
      return NextResponse.json({ error: '审批不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json(toApprovalDto(approval));
  } catch (error) {
    console.error('GET /api/finance/approvals/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}

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
    const parsed = approvalDecisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const approval = await decideApproval(userId, id, parsed.data.decision);
    if (!approval) {
      return NextResponse.json({ error: '审批不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json(toApprovalDto(approval));
  } catch (error) {
    if (error instanceof ApprovalStateError) {
      return NextResponse.json(
        { error: error.message, code: 'INVALID_TRANSITION' },
        { status: 422 },
      );
    }
    console.error('PATCH /api/finance/approvals/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
