import { Box, Paper, Typography } from "@mui/material";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { MessageBubble } from "./MessageBubble";
import type { ChatMessage } from "../types";

interface MessageListProps {
  messages: ChatMessage[];
  virtuosoRef: React.RefObject<VirtuosoHandle | null>;
  isLoading: boolean;
}

export function MessageList({ messages, virtuosoRef, isLoading }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <Box sx={{ flex: 1, textAlign: "center", color: "text.secondary", mt: 10 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Hello!
        </Typography>
        <Typography>Type a message to start chatting</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        overflow: "hidden",
        "& ::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
      }}
    >
      <Virtuoso
        ref={virtuosoRef}
        data={messages}
        initialTopMostItemIndex={messages.length - 1}
        computeItemKey={(_index, m) => m.id}
        overscan={200}
        followOutput="smooth"
        itemContent={(index, m) => (
          <MessageBubble message={m} isFirst={index === 0} />
        )}
        components={{
          Footer: () =>
            isLoading && messages[messages.length - 1]?.role === "user" ? (
              <Box sx={{ px: 2, py: 1, display: "flex", justifyContent: "flex-start" }}>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: "action.hover",
                    color: "text.secondary",
                    borderRadius: 2,
                    px: 2,
                    py: 1.25,
                    fontSize: 14,
                  }}
                >
                  Thinking...
                </Paper>
              </Box>
            ) : null,
        }}
        style={{ height: "100%" }}
      />
    </Box>
  );
}
