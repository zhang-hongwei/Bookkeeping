"use client";

import { useState, useCallback } from "react";
import type { ChatMessage } from "../types";

interface UseDeviceChatOptions {
  javaUrl: string;
}

interface DeviceChatResult {
  reply: string;
  conversationHistory: Array<{ role: string; content: string }>;
}

/**
 * Device mode chat hook
 * Non-streaming POST to Java IoT backend via /api/chat/device proxy
 */
export function useDeviceChat({ javaUrl }: UseDeviceChatOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (
      message: string,
      historyMessages: Array<{ role: string; content: string }>
    ): Promise<DeviceChatResult | null> => {
      if (!message.trim()) return null;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/chat/device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            historyMessages,
            javaUrl,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(errData.error || `Request failed (${res.status})`);
        }

        const data: DeviceChatResult = await res.json();
        return data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [javaUrl]
  );

  return { sendMessage, isLoading, error };
}

/**
 * Convert chat messages to device history format
 * Filters out empty assistant messages and maps to {role, content} shape
 */
export function toDeviceHistory(
  messages: ChatMessage[]
): Array<{ role: string; content: string }> {
  return messages
    .filter((m) => m.role === "user" || (m.role === "assistant" && m.content))
    .map((m) => {
      const textPart = m.parts?.find((p) => p.type === "text");
      return {
        role: m.role,
        content: textPart && textPart.type === "text" ? textPart.text : "",
      };
    })
    .filter((m) => m.content);
}
