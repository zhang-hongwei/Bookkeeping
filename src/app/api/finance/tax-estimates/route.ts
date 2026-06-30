/**
 * 个税估算 API（Phase 7，US2，FR-002/SC-002/SC-004）。
 * - POST /api/finance/tax-estimates           估算（支持年终奖 separate/merged 对比）
 * - GET  /api/finance/tax-estimates?taxYear=   取最近一次估算
 *
 * 收入缺失 → 200 + status:'degraded' + missing（NC6）。免责强制注入（I6）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { requireFamilyMembership } from '@/app/api/finance/_lib/family-auth';
import {
  taxEstimateSchema,
  taxYearQuerySchema,
} from '@/app/api/finance/_lib/validation';
import { toTaxEstimateDto } from '@/app/api/finance/_lib/serialize';
import {
  computeTaxEstimate,
  getLatestTaxEstimate,
} from '@/services/finance/tax.service';

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const parsed = taxYearQuerySchema.safeParse(
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
    const item = await getLatestTaxEstimate(userId, parsed.data.taxYear);
    return NextResponse.json({ taxEstimate: item ? toTaxEstimateDto(item) : null });
  } catch (error) {
    console.error('GET /api/finance/tax-estimates error:', error);
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
    const parsed = taxEstimateSchema.safeParse(body);
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

    const item = await computeTaxEstimate({
      userId,
      taxYear: parsed.data.taxYear,
      inputs: parsed.data.inputs,
    });
    return NextResponse.json(
      { taxEstimate: toTaxEstimateDto(item) },
      { status: 201 },
    );
  } catch (error) {
    console.error('POST /api/finance/tax-estimates error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
