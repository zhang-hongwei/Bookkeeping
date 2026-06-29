/**
 * ChatHeader Component
 * 聊天页面头部组件
 */

import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";

interface ChatHeaderProps {
  onSettingsClick: () => void;
  onToggleSidebar?: () => void;
}

export function ChatHeader({ onSettingsClick, onToggleSidebar }: ChatHeaderProps) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: 1,
        borderColor: "divider",
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {onToggleSidebar && (
          <IconButton onClick={onToggleSidebar} sx={{ color: "text.secondary" }}>
            <MenuIcon />
          </IconButton>
        )}
        <Tooltip title="返回工具页">
          <IconButton component={Link} href="/" sx={{ color: "text.secondary" }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            沌联 Chat
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Alpha Preview v1.0
          </Typography>
        </Box>
      </Box>
      <IconButton onClick={onSettingsClick} sx={{ color: "text.secondary" }}>
        <SettingsIcon />
      </IconButton>
    </Box>
  );
}
