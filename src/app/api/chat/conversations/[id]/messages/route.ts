import { ChatConversationService } from "@/services/chat-conversation-service";

export async function GET(
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

    const messages = await ChatConversationService.getMessages(id, visitorId);

    if (messages === null) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const uiMessages = messages.map((m) => ({
      id: m.id,
      role: m.role,
      parts: m.content,
      createdAt: m.createdAt,
    }));

    return Response.json({ messages: uiMessages });
  } catch (err) {
    console.error("[chat/conversations/[id]/messages] error:", err);
    return Response.json({ messages: [] });
  }
}
