/**
 * Chat Page
 * 沌联 Chat - AI 聊天页面
 */

"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Stack, Typography, Box } from "@mui/material";
import { type VirtuosoHandle } from "react-virtuoso";
import SettingsDialog from "./components/SettingsDialog";
import {
  MessageList,
  ChatInput,
  useImageHandling,
  useAutoScroll,
} from "@/features/chat-shared";
import type { ChatMessagePart, SendMessageOptions } from "@/features/chat-shared/types";
import { useVoiceRecording } from "./hooks/useVoiceRecording";
import { useChatSettings, getBaseUrl } from "./hooks/useChatSettings";
import { useConversationStore } from "./store/chat-conversations";
import SmartAIWidget from "@/components/SmartAIWidget";

const VISITOR_KEY = "chat_visitor_id";
const ACTIVE_CONV_KEY = "chat_active_conversation_id";

function randomUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export default function Chat() {
  const { settings, models, saveSettings } = useChatSettings();
  const [loaded, setLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [switchingConversation, setSwitchingConversation] = useState(false);

  const {
    fetchConversations,
    updateConversationTitleLocal,
    pendingAction,
    setPendingAction,
    settingsDialogOpen,
    setSettingsDialogOpen,
  } = useConversationStore();

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const visitorIdRef = useRef("");
  if (typeof window !== "undefined" && !visitorIdRef.current) {
    visitorIdRef.current = getVisitorId();
  }

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => {
          const s = settingsRef.current;
          const body: Record<string, unknown> = {
            baseUrl: getBaseUrl(s),
            authToken: s.authToken,
            model: s.model,
            temperature: s.temperature,
            topP: s.topP,
            topK: s.topK,
            maxTokens: s.maxTokens,
            frequencyPenalty: s.frequencyPenalty,
            presencePenalty: s.presencePenalty,
            enableThinking: s.enableThinking,
            visitorId: visitorIdRef.current,
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

  const { messages, sendMessage, status, setMessages } = useChat({ transport });
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const loadConversationMessages = useCallback(
    async (conversationId: string) => {
      setSwitchingConversation(true);
      try {
        const res = await fetch(
          `/api/chat/conversations/${conversationId}/messages?visitorId=${visitorIdRef.current}`
        );
        const data = await res.json();
        if (data.messages?.length) {
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
      } catch {
        setMessages([]);
      } finally {
        setSwitchingConversation(false);
        setLoaded(true);
      }
    },
    [setMessages]
  );

  // Load conversations and restore active on mount
  useEffect(() => {
    const vid = visitorIdRef.current;
    if (!vid) return;

    fetchConversations(vid).then(() => {
      const savedId = localStorage.getItem(ACTIVE_CONV_KEY);
      const store = useConversationStore.getState();
      const exists = savedId && store.conversations.some((c) => c.id === savedId);

      if (exists) {
        store.selectConversation(savedId);
        loadConversationMessages(savedId!);
      } else if (store.conversations.length > 0) {
        const firstId = store.conversations[0].id;
        store.selectConversation(firstId);
        loadConversationMessages(firstId);
      } else {
        setLoaded(true);
      }
    });
  }, [fetchConversations]);

  // Handle pending actions from sidebar (in layout)
  useEffect(() => {
    if (!pendingAction || !loaded) return;

    switch (pendingAction.type) {
      case "select":
        loadConversationMessages(pendingAction.id);
        break;
      case "new":
        setMessages([]);
        break;
      case "delete": {
        const store = useConversationStore.getState();
        if (store.activeConversationId) {
          loadConversationMessages(store.activeConversationId);
        } else {
          setMessages([]);
        }
        break;
      }
    }

    setPendingAction(null);
  }, [pendingAction, loaded, loadConversationMessages, setMessages, setPendingAction]);

  // Custom hooks
  const { selectedImages, fileInputRef, handleImageSelect, removeImage, clearImages } = useImageHandling();
  const { isRecording, isTranscribing, toggleRecording } = useVoiceRecording({
    onTranscript: (text) => setInput((prev) => (prev ? prev + " " + text : text)),
  });
  useAutoScroll({ messages, virtuosoRef });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if ((!input.trim() && selectedImages.length === 0) || isLoading) return;
      const parts: ChatMessagePart[] = [];
      for (const img of selectedImages) {
        parts.push({ type: "image", image: img });
      }
      if (input.trim()) {
        parts.push({ type: "text", text: input.trim() });
      }

      // Auto-generate title from first message text
      const activeId = useConversationStore.getState().activeConversationId;
      const conv = useConversationStore.getState().conversations.find((c) => c.id === activeId);
      if (conv && !conv.title) {
        const textPart = parts.find((p) => p.type === "text");
        if (textPart && textPart.type === "text") {
          const title = textPart.text.slice(0, 30);
          updateConversationTitleLocal(conv.id, title);
        }
      }

      (sendMessage as (options: SendMessageOptions) => void)({ parts });
      setInput("");
      clearImages();
    },
    [input, selectedImages, isLoading, sendMessage, clearImages, updateConversationTitleLocal]
  );

  // Loading state
  if (!loaded) {
    return (
      <Stack sx={{ height: "100vh", maxWidth: 800, mx: "auto", alignItems: "center", justifyContent: "center" }}>
        <Typography color="text.secondary">Loading...</Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ flex: 1, height: "100%", maxWidth: 800, mx: "auto", overflow: "visible", minWidth: 0 }}>
      {switchingConversation ? (
        <Stack sx={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Typography color="text.secondary">Loading...</Typography>
        </Stack>
      ) : (
        <Stack sx={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
          {messages.length > 40 && (
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ textAlign: "center", py: 0.5, fontSize: "0.7rem" }}
            >
              对话较长，部分早期消息未包含在当前 AI 上下文中
            </Typography>
          )}
          <MessageList messages={messages as any} virtuosoRef={virtuosoRef} isLoading={isLoading} />
        </Stack>
      )}

      <Box sx={{ mb: '24px' }}>
        <ChatInput
          input={input}
          setInput={setInput}
          selectedImages={selectedImages}
          onRemoveImage={removeImage}
          onImageSelect={handleImageSelect}
          fileInputRef={fileInputRef}
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          isLoading={isLoading}
          onToggleRecording={toggleRecording}
          onSubmit={handleSubmit}
        />
      </Box>

      <SettingsDialog
        open={settingsDialogOpen}
        settings={settings}
        models={models}
        onClose={(s, m) => {
          saveSettings(s, m);
          setSettingsDialogOpen(false);
        }}
      />

      <SmartAIWidget />
    </Stack>
  );
}

