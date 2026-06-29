"use client";

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import CloseIcon from "@mui/icons-material/Close";

interface ChatHeaderProps {
  assistantName?: string;
  userName?: string;
  isConnected: boolean;
  hasHistory?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onClose?: () => void;
}

export default function ChatHeader({
  assistantName = "AI Assistant",
  userName,
  isConnected,
  hasHistory = false,
  isFullscreen = false,
  onToggleFullscreen,
  onClose,
}: ChatHeaderProps) {
  const greeting = userName
    ? hasHistory
      ? `Welcome back, ${userName}`
      : `Hello, ${userName}`
    : undefined;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: isConnected ? "success.main" : "grey.400",
          }}
        />
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {assistantName}
          </Typography>
          {greeting && (
            <Typography variant="caption" color="text.secondary">
              {greeting}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {onToggleFullscreen && (
          <IconButton
            size="small"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        )}
        {onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
