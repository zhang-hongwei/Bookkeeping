import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AI_WIDGET_JWT_SECRET ?? "dev-secret-change-in-production"
);

const VALID_EVENT_TYPES = new Set([
  "message_sent",
  "message_received",
  "session_start",
  "session_end",
  "error",
  "fullscreen_toggle",
]);

interface AnalyticsEvent {
  eventType: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

// POST /api/ai/analytics — batch event ingestion
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    await jwtVerify(authHeader.slice(7), JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { events: AnalyticsEvent[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!Array.isArray(body.events)) {
    return NextResponse.json({ error: "events must be an array" }, { status: 400 });
  }

  // Filter to valid event types
  const validEvents = body.events.filter(
    (e) => e.eventType && VALID_EVENT_TYPES.has(e.eventType)
  );

  // In production, store to database or send to analytics service
  // For now, log and acknowledge
  if (process.env.NODE_ENV === "development") {
    console.log("[AI Widget Analytics]", validEvents.length, "events received");
  }

  return NextResponse.json({ accepted: validEvents.length });
}
