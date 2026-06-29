"use client";

import { useMediaQuery, useTheme } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useConversationStore } from "../store/chat-conversations";
import { ConversationItem } from "./ConversationItem";

const DRAWER_WIDTH = 280;

const VISITOR_KEY = "chat_visitor_id";

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(VISITOR_KEY) ?? "";
}

export function ChatSidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const {
    conversations,
    activeConversationId,
    isLoading,
    sidebarOpen,
    setSidebarOpen,
    renameConversation,
    selectConversation,
    deleteConversation,
    createConversation,
    setPendingAction,
    setSettingsDialogOpen,
  } = useConversationStore();

  const handleSelect = (id: string) => {
    if (id === activeConversationId) return;
    selectConversation(id);
    setPendingAction({ type: "select", id });
    if (isMobile) setSidebarOpen(false);
  };

  const handleDelete = async (id: string) => {
    const visitorId = getVisitorId();
    await deleteConversation(id, visitorId);
    setPendingAction({ type: "delete", id });
  };

  const handleNewChat = async () => {
    const visitorId = getVisitorId();
    await createConversation(visitorId);
    setPendingAction({ type: "new" });
  };

  const drawerContent = (
    <Stack
      sx={{
        width: DRAWER_WIDTH,
        height: "100%",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        p: '16px 4px '
      }}
    >
      <Box sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleNewChat}
          size="small"
        >
          新对话
        </Button>
        <IconButton onClick={() => setSidebarOpen(false)} size="small" sx={{ color: "text.secondary" }}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          px: 1,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {isLoading && conversations.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : conversations.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4, px: 2 }}
          >
            还没有对话记录，点击上方按钮开始
          </Typography>
        ) : (
          <List disablePadding>
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConversationId}
                visitorId={getVisitorId()}
                onSelect={handleSelect}
                onDelete={handleDelete}
                onRename={renameConversation}
              />
            ))}
          </List>
        )}
      </Box>

      <Box sx={{ p: 1, borderTop: 1, borderColor: "divider" }}>
        <IconButton
          onClick={() => setSettingsDialogOpen(true)}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <SettingsOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>
    </Stack>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            position: "absolute",
            height: "100%",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return drawerContent;
}
