"use client";

import { useEffect, useRef, useCallback } from "react";
import type {
  WidgetMessage,
  InitPayload,
  ReadyPayload,
  ThemeConfig,
  PageContext,
} from "@/types/ai-widget";
import { WIDGET_PROTOCOL_VERSION } from "@/types/ai-widget";

interface UseWidgetMessagesOptions {
  onReady?: (payload: ReadyPayload) => void;
  onThemeChange?: (theme: ThemeConfig) => void;
  onContextUpdate?: (context: PageContext) => void;
  onInit?: (payload: InitPayload) => void;
}

export function useWidgetMessages(options: UseWidgetMessagesOptions = {}) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const sendMessage = useCallback(
    (type: string, payload: unknown) => {
      const message: WidgetMessage = {
        version: WIDGET_PROTOCOL_VERSION,
        source: "smart-ai-widget",
        target: "smart-ai-sdk",
        type: type as WidgetMessage["type"],
        requestId: crypto.randomUUID(),
        timestamp: Date.now(),
        payload,
      };
      window.parent.postMessage(message, "*");
    },
    []
  );

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.source !== window.parent) return;

      const message = event.data as WidgetMessage;
      if (!message?.version || message.target !== "smart-ai-widget") return;

      switch (message.type) {
        case "HELLO": {
          sendMessage("HELLO_ACK", { widgetVersion: "1.0.0" });
          sendMessage("ACK", {
            originalType: "HELLO",
            requestId: message.requestId,
            success: true,
          });
          break;
        }

        case "INIT": {
          const payload = message.payload as InitPayload;
          sendMessage("ACK", {
            originalType: "INIT",
            requestId: message.requestId,
            success: true,
          });

          if (payload.theme) {
            optionsRef.current.onThemeChange?.(payload.theme);
          }

          optionsRef.current.onInit?.(payload);

          // Signal ready immediately — conversation is managed by @ai-sdk/react now
          const readyPayload: ReadyPayload = {
            conversationId: null,
            hasHistory: false,
          };
          sendMessage("READY", readyPayload);
          optionsRef.current.onReady?.(readyPayload);
          break;
        }

        case "OPEN": {
          break;
        }

        case "CLOSE": {
          break;
        }

        case "THEME_CHANGE": {
          const theme = message.payload as ThemeConfig;
          optionsRef.current.onThemeChange?.(theme);
          break;
        }

        case "CONTEXT_UPDATE": {
          const context = message.payload as PageContext;
          optionsRef.current.onContextUpdate?.(context);
          break;
        }
      }
    };

    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
    };
  }, [sendMessage]);

  return {
    sendMessage,
    sendFullscreen: (isFullscreen: boolean) => {
      sendMessage("FULLSCREEN", { isFullscreen });
    },
    sendClose: () => {
      sendMessage("CLOSE", {});
    },
    sendAuthExpired: (reason: string) => {
      sendMessage("AUTH_EXPIRED", { reason: reason as "token_expired" | "token_invalid" });
    },
  };
}
