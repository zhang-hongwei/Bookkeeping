"use client";

import { Box, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { ChatSidebar } from "./chat/components/ChatSidebar";
import { SettingsPopover } from "@/components/common/SettingsPopover";
import { useConversationStore } from "./chat/store/chat-conversations";

export default function AiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarOpen = useConversationStore((s) => s.sidebarOpen);
  const toggleSidebar = useConversationStore((s) => s.toggleSidebar);

  return (
    <Box sx={{ height: "100vh", overflow: "hidden" }}>
      <Box
        sx={{
          height: "100%",
          display: "grid",
          gridTemplateColumns: sidebarOpen ? "280px 1fr" : "0px 1fr",
          transition: "grid-template-columns 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Box sx={{ overflow: "hidden" }}>
          <ChatSidebar />
        </Box>
        <Box
          component="main"
          sx={{
            position: "relative",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {!sidebarOpen && (
            <IconButton
              onClick={toggleSidebar}
              sx={{ position: "absolute", left: 8, top: 8, zIndex: 1, color: "text.secondary" }}
            >
              <MenuIcon />
            </IconButton>
          )}
          {children}
        </Box>
      </Box>
      <SettingsPopover />
    </Box>
  );
}
