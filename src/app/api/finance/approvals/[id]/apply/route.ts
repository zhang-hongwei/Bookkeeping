/**
 * 审批落库 API（Phase 6，FR-004 / SC-003 / I8）。
 * - POST /api/finance/approvals/:id/apply
 *   前置：必须 approved；apply 时规则再校验（defensive，I2）。
 *   成功 → 200 { status:'applied', appliedResult }；重复 apply → 200 幂等返回当前态（I8）。
 *   未 approved / 过期 / 规则再校验失败 → 422（带 code）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../../_lib/auth';
import { toApprovalDto } from '../../../_lib/serialize';
import {
  applyApproval,
  ApprovalApplyError,
} from '@/services/finance/approval.service';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { id } = await params;

    const result = await applyApproval(userId, id);
    if (!result) {
      return NextResponse.json({ error: '审批不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json({
      status: result.approval.status,
      appliedResult: result.approval.appliedResult,
      approval: toApprovalDto(result.approval),
      idempotent: result.idempotent,
    });
  } catch (error) {
    if (error instanceof ApprovalApplyError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 422 },
      );
    }
    console.error('POST /api/finance/approvals/[id]/apply error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
