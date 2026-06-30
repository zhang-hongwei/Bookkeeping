/**
 * 顾问消息 API（Phase 6，FR-003 / FR-007）。
 * - GET  /api/finance/advisor/sessions/:id/messages  → DisclaimerEnvelope<{messages}>
 * - POST /api/finance/advisor/sessions/:id/messages  { content } → DisclaimerEnvelope<AdvisorMessageDTO>
 *   LLM 失败降级（200，degraded=true，SC-005）；高风险提议返回 proposalId（不落库，FR-004）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { sendMessageSchema } from '@/app/api/finance/_lib/validation';
import { toAdvisorMessageDto, withDisclaimer } from '@/app/api/finance/_lib/serialize';
import { listMessages, sendMessage } from '@/services/finance/advisor.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;
    const { id } = await params;

    const messages = await listMessages(userId, id);
    if (messages === null) {
      return NextResponse.json({ error: '会话不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json(
      withDisclaimer({ messages: messages.map(toAdvisorMessageDto) }),
    );
  } catch (error) {
    console.error('GET /api/finance/advisor/sessions/[id]/messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}

export async function POST(
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
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const result = await sendMessage(userId, id, parsed.data.content);
    if (!result) {
      return NextResponse.json({ error: '会话不存在', code: 'NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json(
      withDisclaimer(toAdvisorMessageDto(result.message)),
    );
  } catch (error) {
    console.error('POST /api/finance/advisor/sessions/[id]/messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
