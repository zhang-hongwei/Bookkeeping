"use client";

import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Stack,
} from "@mui/material";
import { NotificationsOutlined } from "@mui/icons-material";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { SettingsDrawer } from "./SettingsDrawer";

export function AppHeader() {
  const pathname = usePathname();
  const [notifMenuAnchor, setNotifMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  // Generate breadcrumb based on pathname
  const getBreadcrumb = () => {
    const paths = pathname.split("/").filter(Boolean);
    const lastPath = paths[paths.length - 1] || "home";
    const pageName = lastPath.charAt(0).toUpperCase() + lastPath.slice(1);

    return {
      path: `Home / ${pageName}`,
      title: pageName,
    };
  };

  const breadcrumb = getBreadcrumb();

  const handleNotifMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifMenuAnchor(event.currentTarget);
  };

  const handleNotifMenuClose = () => {
    setNotifMenuAnchor(null);
  };

  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
      }}
    >
      {/* Left: Breadcrumb and Title */}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 0.5, fontSize: "13px" }}
        >
          {breadcrumb.path}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
          {breadcrumb.title}
        </Typography>
      </Box>

      {/* Right: Actions */}
      <Stack direction="row" spacing={1} alignItems="center">
        {/* Language Selector */}
        <Tooltip title="Language">
          <IconButton
            size="medium"
            sx={{
              "&:hover": { bgcolor: "#e8e8e8" },
              fontSize: "20px",
            }}
          >
            🇺🇸
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            size="medium"
            onClick={handleNotifMenuOpen}
            sx={{
              "&:hover": { bgcolor: "#e8e8e8" },
            }}
          >
            <Badge badgeContent={3} color="error" variant="dot">
              <NotificationsOutlined />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Avatar */}
        <Tooltip title="Account">
          <IconButton
            onClick={() => setSettingsDrawerOpen(true)}
            sx={{
              p: 0.5,
              ml: 1,
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                // bgcolor: "#FF9500",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              U
            </Avatar>
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notifMenuAnchor}
        open={Boolean(notifMenuAnchor)}
        onClose={handleNotifMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{ mt: 1 }}
        slotProps={{
          paper: {
            sx: { width: 320, maxHeight: 400 },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #e0e0e0" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        <MenuItem onClick={handleNotifMenuClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              New API request
            </Typography>
            <Typography variant="caption" color="text.secondary">
              2 minutes ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotifMenuClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Usage limit warning
            </Typography>
            <Typography variant="caption" color="text.secondary">
              1 hour ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotifMenuClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Payment successful
            </Typography>
            <Typography variant="caption" color="text.secondary">
              1 day ago
            </Typography>
          </Box>
        </MenuItem>
      </Menu>

      {/* Settings Drawer */}
      <SettingsDrawer
        open={settingsDrawerOpen}
        onClose={() => setSettingsDrawerOpen(false)}
      />
    </Box>
  );
}
