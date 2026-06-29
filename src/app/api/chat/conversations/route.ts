import { ChatConversationService } from "@/services/chat-conversation-service";
import { z } from "zod";

const createSchema = z.object({
  visitorId: z.string().min(1),
  title: z.string().max(200).optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const visitorId = searchParams.get("visitorId");

  if (!visitorId) {
    return Response.json({ error: "visitorId is required" }, { status: 400 });
  }

  try {
    const conversations = await ChatConversationService.list(visitorId);
    return Response.json({ conversations });
  } catch (err) {
    console.error("[chat/conversations] list error:", err);
    return Response.json({ conversations: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { visitorId, title } = parsed.data;
    const conversation = await ChatConversationService.create(
      visitorId,
      title ?? null
    );
    return Response.json(conversation, { status: 201 });
  } catch (err) {
    console.error("[chat/conversations] create error:", err);
    return Response.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
