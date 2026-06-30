/**
 * 智能预警 API（Phase 6，FR-002 / FR-008）。
 * - GET /api/finance/alerts?status=active|acknowledged|silenced|all
 *   active 列表过滤已静默 kind（FR-008）；含 disclaimer + 聚合 sourceRefs（SC-002）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../_lib/auth';
import { toAlertDto, withDisclaimer, type SourceRef } from '../_lib/serialize';
import { listAlerts } from '@/services/finance/alert.service';

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const raw = request.nextUrl.searchParams.get('status') ?? 'active';
    const status = ['active', 'acknowledged', 'silenced', 'all'].includes(raw)
      ? (raw as 'active' | 'acknowledged' | 'silenced' | 'all')
      : 'active';

    const alerts = await listAlerts(userId, status);
    const dtos = alerts.map(toAlertDto);
    // 聚合去重 sourceRefs（按 metric+period）
    const seen = new Set<string>();
    const sourceRefs: SourceRef[] = [];
    for (const a of dtos) {
      for (const r of a.ruleFindingRefs) {
        const key = `${r.metric}|${r.period}`;
        if (!seen.has(key)) {
          seen.add(key);
          sourceRefs.push(r);
        }
      }
    }
    return NextResponse.json(withDisclaimer({ alerts: dtos }, sourceRefs));
  } catch (error) {
    console.error('GET /api/finance/alerts error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
