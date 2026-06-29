import { NextResponse } from "next/server";
import { db } from "@/database";
import { aiWidgetMessages } from "@/database/schema/ai-widget-messages";
import { aiWidgetConversations } from "@/database/schema/ai-widget-conversations";
import { eq, and, lt, asc, desc } from "drizzle-orm";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AI_WIDGET_JWT_SECRET ?? "dev-secret-change-in-production"
);

const DEFAULT_LIMIT = 50;

async function verifyAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const { payload } = await jwtVerify(
      authHeader!.slice(7),
      JWT_SECRET,
      { algorithms: ["HS256"] }
    );
    return {
      userId: payload.sub as string,
      tenantId: payload.tid as string,
    };
  } catch {
    return null;
  }
}

// GET /api/ai/conversations/:id/messages
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;
  const { searchParams } = new URL(request.url);
  const before = searchParams.get("before");
  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10)),
    100
  );

  // Verify conversation belongs to user
  const [conversation] = await db
    .select({ userId: aiWidgetConversations.userId })
    .from(aiWidgetConversations)
    .where(
      and(
        eq(aiWidgetConversations.id, conversationId),
        eq(aiWidgetConversations.tenantId, auth.tenantId)
      )
    )
    .limit(1);

  if (!conversation) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (conversation.userId !== auth.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Build query
  const conditions = [eq(aiWidgetMessages.conversationId, conversationId)];
  if (before) {
    // Cursor: fetch messages created before the given message ID
    const [cursorMsg] = await db
      .select({ createdAt: aiWidgetMessages.createdAt })
      .from(aiWidgetMessages)
      .where(eq(aiWidgetMessages.id, before))
      .limit(1);
    if (cursorMsg) {
      conditions.push(lt(aiWidgetMessages.createdAt, cursorMsg.createdAt));
    }
  }

  const messages = await db
    .select()
    .from(aiWidgetMessages)
    .where(and(...conditions))
    .orderBy(desc(aiWidgetMessages.createdAt))
    .limit(limit + 1); // +1 to detect hasMore

  const hasMore = messages.length > limit;
  const result = hasMore ? messages.slice(0, limit) : messages;

  // Reverse to get chronological order (oldest first)
  result.reverse();

  return NextResponse.json({
    messages: result,
    hasMore,
    nextCursor: hasMore && result.length > 0 ? result[0].id : null,
  });
}
