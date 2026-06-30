/**
 * What-if 情景 API（Phase 7，US1，FR-001/SC-001/SC-004/SC-005）。
 * - POST /api/finance/scenarios   计算并保存情景（确定性投影引擎，可复现）
 * - GET  /api/finance/scenarios   我的情景列表（不含投影点明细）
 *
 * 降级（数据不足）→ HTTP 200 + status:'degraded' + missing[]（NC6，非错误）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { requireFamilyMembership } from '@/app/api/finance/_lib/family-auth';
import { createScenarioSchema, familyQuerySchema } from '@/app/api/finance/_lib/validation';
import { toScenarioDto } from '@/app/api/finance/_lib/serialize';
import {
  computeScenario,
  listScenarios,
} from '@/services/finance/scenario.service';

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const parsed = familyQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    if (parsed.data.familyId) {
      const m = await requireFamilyMembership(parsed.data.familyId, userId);
      if (m instanceof NextResponse) return m;
    }
    const items = await listScenarios(userId);
    return NextResponse.json({ scenarios: items.map((s) => toScenarioDto(s, [])) });
  } catch (error) {
    console.error('GET /api/finance/scenarios error:', error);
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
    const parsed = createScenarioSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    if (parsed.data.familyId) {
      const m = await requireFamilyMembership(parsed.data.familyId, userId);
      if (m instanceof NextResponse) return m;
    }

    const { scenario, projections } = await computeScenario({
      userId,
      name: parsed.data.name,
      kind: parsed.data.kind,
      assumptions: parsed.data.assumptions,
      horizonMonths: parsed.data.horizonMonths,
    });
    // 降级仍 200（NC6）；新建用 201
    return NextResponse.json(
      { scenario: toScenarioDto(scenario, projections) },
      { status: 201 },
    );
  } catch (error) {
    console.error('POST /api/finance/scenarios error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
