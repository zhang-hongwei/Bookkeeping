"use client";

import { IconButton, Tooltip, Avatar, Stack } from "@mui/material";
import { useState } from "react";
import { SettingsDrawer } from "./SettingsDrawer";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { SettingsButton } from "@/components/common/SettingsButton";
import UserInfoDrawer from "./UserInfoDrawer";

export function HeaderActions() {
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [userInfoDrawerOpen, setUserInfoDrawerOpen] = useState(false);

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        {/* Language Selector */}
        <LanguageSelector />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Settings Button */}
        <SettingsButton onClick={() => setSettingsDrawerOpen(true)} />

        {/* User Avatar */}
        <Tooltip title="Account">
          <IconButton
            sx={{
              p: 0.5,
              ml: 1,
            }}
            onClick={() => setUserInfoDrawerOpen(true)}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              U
            </Avatar>
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Settings Drawer */}
      <SettingsDrawer
        open={settingsDrawerOpen}
        onClose={() => setSettingsDrawerOpen(false)}
      />

      {/* User Info Drawer */}
      <UserInfoDrawer
        open={userInfoDrawerOpen}
        onClose={() => setUserInfoDrawerOpen(false)}
      />
    </>
  );
}
