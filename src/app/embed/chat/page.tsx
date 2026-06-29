"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  CircularProgress,
  Typography,
  Stack,
} from "@mui/material";
import { ErrorBoundary } from "@/features/ai-widget/components/ErrorBoundary";
import ChatHeader from "@/features/ai-widget/components/ChatHeader";
import {
  MessageList,
  ChatInput,
  useImageHandling,
} from "@/features/chat-shared";
import type { ChatMessagePart } from "@/features/chat-shared/types";
import { useWidgetMessages } from "@/features/ai-widget/hooks/useWidgetMessages";
import { useTheme } from "@/features/ai-widget/hooks/useTheme";
import { useChatSettings, getBaseUrl } from "@/app/(ai)/chat/hooks/useChatSettings";
import type { ReadyPayload, ThemeConfig } from "@/types/ai-widget";
import type { VirtuosoHandle } from "react-virtuoso";

export default function EmbedChatPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const { theme, updateTheme, resolvedMode } = useTheme();
  const { settings } = useChatSettings();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedMode,
          primary: {
            main: theme.primaryColor ?? "#1677ff",
          },
        },
        shape: { borderRadius: 8 },
        typography: {
          fontSize: 14,
        },
      }),
    [resolvedMode, theme.primaryColor]
  );

  const { sendFullscreen, sendClose, sendAuthExpired } = useWidgetMessages({
    onReady: (payload: ReadyPayload) => {
      setIsConnected(true);
    },
    onThemeChange: (newTheme: ThemeConfig) => {
      updateTheme(newTheme);
    },
    onInit: (payload) => {
      // Derive a stable visitorId from the SDK-provided user info
      if (payload.user?.id) {
        setVisitorId(`widget_${payload.user.id}`);
      }
    },
  });

  const visitorIdRef = useRef("");
  visitorIdRef.current = visitorId;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => {
          const s = settingsRef.current;
          return {
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
        },
      }),
    []
  );

  const { messages, sendMessage, status, setMessages } = useChat({ transport });
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const isLoading = status === "submitted" || status === "streaming";

  const handleToggleFullscreen = () => {
    const next = !isFullscreen;
    setIsFullscreen(next);
    sendFullscreen(next);
  };

  // Image handling
  const {
    selectedImages,
    fileInputRef,
    handleImageSelect,
    removeImage,
    clearImages,
  } = useImageHandling();

  const [input, setInput] = useState("");

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

      (sendMessage as (opts: { parts: ChatMessagePart[] }) => void)({ parts });
      setInput("");
      clearImages();
    },
    [input, selectedImages, isLoading, sendMessage, clearImages]
  );

  if (!isConnected) {
    return (
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <CircularProgress size={32} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ErrorBoundary>
        <Stack sx={{ height: "100vh", overflow: "hidden", p: '8px', background: '#fff', }}>
          <ChatHeader
            assistantName="AI Assistant"
            isConnected={isConnected}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            onClose={sendClose}
          />

          {messages.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography color="text.secondary">
                Start a conversation...
              </Typography>
            </Box>
          ) : (
            <MessageList
              messages={messages as any}
              virtuosoRef={virtuosoRef}
              isLoading={isLoading}
            />
          )}

          <ChatInput
            compact
            input={input}
            setInput={setInput}
            selectedImages={selectedImages}
            onRemoveImage={removeImage}
            onImageSelect={handleImageSelect}
            fileInputRef={fileInputRef}
            isLoading={isLoading}
            onSubmit={handleSubmit}
          />
        </Stack>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
