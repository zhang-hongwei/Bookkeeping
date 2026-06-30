/**
 * 顾问会话 API（Phase 6，FR-003）。
 * - POST /api/finance/advisor/sessions  { title? }  → 201 { sessionId }
 * - GET  /api/finance/advisor/sessions  → { sessions: AdvisorSessionDTO[] }
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { createAdvisorSessionSchema } from '@/app/api/finance/_lib/validation';
import { toAdvisorSessionDto } from '@/app/api/finance/_lib/serialize';
import { createSession, listSessions } from '@/services/finance/advisor.service';

export async function POST(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const parsed = createAdvisorSessionSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const session = await createSession(userId, parsed.data.title);
    return NextResponse.json(
      { sessionId: session.id, session: toAdvisorSessionDto(session) },
      { status: 201 },
    );
  } catch (error) {
    console.error('POST /api/finance/advisor/sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const sessions = await listSessions(userId);
    return NextResponse.json({ sessions: sessions.map(toAdvisorSessionDto) });
  } catch (error) {
    console.error('GET /api/finance/advisor/sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
