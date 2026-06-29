import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { db } from "@/database";
import { aiWidgetApps } from "@/database/schema/ai-widget-apps";
import { eq } from "drizzle-orm";
import type { AuthVerifyRequest, AuthVerifyResponse } from "@/types/ai-widget";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AI_WIDGET_JWT_SECRET ?? "dev-secret-change-in-production"
);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AuthVerifyRequest;
    const { token } = body;

    if (!token) {
      return NextResponse.json<AuthVerifyResponse>(
        { valid: false, error: "missing_token" },
        { status: 400 }
      );
    }

    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    const userId = payload.sub as string;
    const tenantId = payload.tid as string;
    const appId = payload.appId as string;

    if (!userId || !tenantId || !appId) {
      return NextResponse.json<AuthVerifyResponse>(
        { valid: false, error: "invalid_payload" },
        { status: 401 }
      );
    }

    // Fetch app config
    const [app] = await db
      .select()
      .from(aiWidgetApps)
      .where(eq(aiWidgetApps.id, appId))
      .limit(1);

    return NextResponse.json<AuthVerifyResponse>({
      valid: true,
      user: {
        id: userId,
        name: (payload.name as string) ?? userId,
        tenantId,
      },
      app: app
        ? {
            id: app.id,
            name: app.name,
            features: app.features ?? {},
          }
        : undefined,
    });
  } catch {
    return NextResponse.json<AuthVerifyResponse>(
      { valid: false, error: "token_invalid" },
      { status: 401 }
    );
  }
}
