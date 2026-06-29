import { ChatConversationService } from "@/services/chat-conversation-service";
import { z } from "zod";

const renameSchema = z.object({
  visitorId: z.string().min(1),
  title: z.string().min(1).max(200),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = renameSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { visitorId, title } = parsed.data;
    const updated = await ChatConversationService.rename(id, visitorId, title);

    if (!updated) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return Response.json(updated);
  } catch (err) {
    console.error("[chat/conversations/[id]] rename error:", err);
    return Response.json({ error: "Failed to rename conversation" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get("visitorId");

    if (!visitorId) {
      return Response.json({ error: "visitorId is required" }, { status: 400 });
    }

    const deleted = await ChatConversationService.remove(id, visitorId);

    if (!deleted) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return Response.json({ deleted: true });
  } catch (err) {
    console.error("[chat/conversations/[id]] delete error:", err);
    return Response.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
