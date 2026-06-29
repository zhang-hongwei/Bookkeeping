import { memo } from "react";
import { Box, Paper } from "@mui/material";
import MarkdownContent from "./MarkdownContent";
import type { ChatMessagePart } from "../types";

interface MessageBubbleProps {
  message: {
    role: "user" | "assistant" | "system";
    parts: ChatMessagePart[];
  };
  isFirst: boolean;
}

export const MessageBubble = memo(function MessageBubble({ message, isFirst }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <Box
      sx={{
        px: 2,
        pt: isFirst ? 3 : 1,
        pb: 1,
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1.25,
          borderRadius: 2,
          fontSize: 14,
          lineHeight: 1.6,
          ...(isUser
            ? {
              bgcolor: "primary.main",
              color: "primary.contrastText",
              whiteSpace: "pre-wrap",
              maxWidth: "80%",
            }
            : {
              bgcolor: "action.hover",
              color: "text.primary",
              width: "100%",
            }),
        }}
      >
        {message.parts.map((part: ChatMessagePart, i: number) =>
          part.type === "text" ? (
            isUser ? (
              <span key={i}>{part.text}</span>
            ) : (
              <MarkdownContent key={i} content={part.text} />
            )
          ) : part.type === "image" ? (
            <Box
              key={i}
              component="img"
              src={part.image instanceof URL ? part.image.toString() : String(part.image)}
              alt="uploaded"
              sx={{ maxWidth: 300, maxHeight: 300, borderRadius: 1, mt: 0.5 }}
            />
          ) : null,
        )}
      </Paper>
    </Box>
  );
});
