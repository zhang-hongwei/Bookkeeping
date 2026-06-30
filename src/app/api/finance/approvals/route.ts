/**
 * 审批列表 API（Phase 6，FR-004）。
 * - GET /api/finance/approvals?status=pending|approved|applied|rejected|expired|all
 *   → { approvals: ApprovalDTO[] }
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../_lib/auth';
import { toApprovalDto } from '../_lib/serialize';
import { listApprovals } from '@/services/finance/approval.service';
import type { ApprovalStatus } from '@/database/schema/finance';

const ALLOWED = ['proposed', 'pending', 'approved', 'rejected', 'applied', 'expired', 'all'];

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const raw = request.nextUrl.searchParams.get('status') ?? 'all';
    const status = ALLOWED.includes(raw)
      ? (raw as ApprovalStatus | 'all')
      : 'all';

    const approvals = await listApprovals(userId, status);
    return NextResponse.json({ approvals: approvals.map(toApprovalDto) });
  } catch (error) {
    console.error('GET /api/finance/approvals error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
