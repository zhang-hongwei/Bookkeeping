import { NextResponse } from "next/server";
import { db } from "@/database";
import { aiWidgetConversations } from "@/database/schema/ai-widget-conversations";
import { eq, and } from "drizzle-orm";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AI_WIDGET_JWT_SECRET ?? "dev-secret-change-in-production"
);

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

// GET /api/ai/conversations/:id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [conversation] = await db
    .select()
    .from(aiWidgetConversations)
    .where(
      and(
        eq(aiWidgetConversations.id, id),
        eq(aiWidgetConversations.tenantId, auth.tenantId)
      )
    )
    .limit(1);

  if (!conversation) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Verify user owns this conversation
  if (conversation.userId !== auth.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json(conversation);
}
