"use client";

import { useState, useRef, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import type { Source } from "../types";
import { useConversationStore } from "../store/chat-conversations";

interface UseRAGChatOptions {
  ragUrl: string;
  knowledgeBaseIds: string[];
  visitorId: string;
}

/**
 * RAG mode chat hook
 * Uses Vercel AI SDK's useChat with custom transport pointing to /api/chat/rag
 */
export function useRAGChat({ ragUrl, knowledgeBaseIds, visitorId }: UseRAGChatOptions) {
  const [sources, setSources] = useState<Source[]>([]);
  const settingsRef = useRef({ ragUrl, knowledgeBaseIds, visitorId });
  settingsRef.current = { ragUrl, knowledgeBaseIds, visitorId };

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat/rag",
        body: () => {
          const s = settingsRef.current;
          const body: Record<string, unknown> = {
            ragUrl: s.ragUrl,
            knowledgeBaseIds: s.knowledgeBaseIds,
            visitorId: s.visitorId,
          };
          const activeId = useConversationStore.getState().activeConversationId;
          if (activeId) {
            body.conversationId = activeId;
          }
          return body;
        },
      }),
    []
  );

  const chatReturn = useChat({
    transport,
    onFinish: ({ message }: { message: UIMessage }) => {
      // Extract sources from message metadata
      if (message.metadata) {
        try {
          const meta = typeof message.metadata === "string"
            ? JSON.parse(message.metadata)
            : message.metadata;
          if (meta?.sources) {
            setSources(meta.sources);
          }
        } catch {
          // ignore parse errors
        }
      }
    },
  });

  return {
    ...chatReturn,
    sources,
    setSources,
  };
}
