/**
 * 预警偏好/静默 API（Phase 6，FR-008）。
 * - GET /api/finance/alerts/preferences          → { preferences: AlertPreferenceDTO[] }
 * - PATCH /api/finance/alerts/preferences        { kind, muted?, mutedUntil?, channel? }
 *   按 (userId, kind) upsert。
 *
 * 注：contracts/api.md §2.3 与 quickstart.md 记载路径为 `/alert-preferences`，
 * 本实现遵循 tasks.md/plan.md 的 `alerts/preferences`（实现权威）；前端 api.ts 同步。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../../_lib/auth';
import { patchAlertPreferenceSchema } from '../../_lib/validation';
import {
  listPreferences,
  upsertPreference,
} from '@/services/finance/alert.service';

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const prefs = await listPreferences(userId);
    return NextResponse.json({ preferences: prefs });
  } catch (error) {
    console.error('GET /api/finance/alerts/preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const parsed = patchAlertPreferenceSchema.safeParse(body);
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

    const pref = await upsertPreference(userId, parsed.data);
    return NextResponse.json(pref);
  } catch (error) {
    console.error('PATCH /api/finance/alerts/preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
