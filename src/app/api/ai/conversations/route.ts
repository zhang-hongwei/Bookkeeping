import { NextResponse } from "next/server";
import { db } from "@/database";
import { aiWidgetConversations } from "@/database/schema/ai-widget-conversations";
import { aiWidgetApps } from "@/database/schema/ai-widget-apps";
import { eq, and, desc } from "drizzle-orm";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AI_WIDGET_JWT_SECRET ?? "dev-secret-change-in-production"
);

async function verifyAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7);
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return {
      userId: payload.sub as string,
      tenantId: payload.tid as string,
      appId: payload.appId as string,
    };
  } catch {
    return null;
  }
}

// GET /api/ai/conversations — list conversations
export async function GET(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const appId = searchParams.get("appId") ?? auth.appId;

  const conversations = await db
    .select()
    .from(aiWidgetConversations)
    .where(
      and(
        eq(aiWidgetConversations.tenantId, auth.tenantId),
        eq(aiWidgetConversations.userId, auth.userId),
        eq(aiWidgetConversations.appId, appId),
        eq(aiWidgetConversations.isActive, true)
      )
    )
    .orderBy(desc(aiWidgetConversations.lastMessageAt));

  return NextResponse.json({ conversations });
}

// POST /api/ai/conversations — create conversation
export async function POST(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { appId, title, systemContext } = body;

  const [conversation] = await db
    .insert(aiWidgetConversations)
    .values({
      appId: appId ?? auth.appId,
      tenantId: auth.tenantId,
      userId: auth.userId,
      title: title ?? null,
      systemContext: systemContext ?? null,
      isActive: true,
      messageCount: 0,
    })
    .returning();

  return NextResponse.json({
    id: conversation.id,
    appId: conversation.appId,
    title: conversation.title,
    isActive: conversation.isActive,
    createdAt: conversation.createdAt,
  });
}
