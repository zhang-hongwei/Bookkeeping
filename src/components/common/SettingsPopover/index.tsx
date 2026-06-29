"use client";

import { useState } from "react";
import { IconButton, Box, Typography, Stack } from "@mui/material";
import { SettingsOutlined, LightModeOutlined, DarkModeOutlined } from "@mui/icons-material";
import { useColorScheme } from "@mui/material/styles";
import Popover from "@/components/ui/Popover";

export function SettingsPopover() {
  const { mode, setMode } = useColorScheme();
  const [open, setOpen] = useState(false);

  const themeOptions = [
    {
      label: "Light",
      value: "light" as const,
      icon: <LightModeOutlined fontSize="small" />,
    },
    {
      label: "Dark",
      value: "dark" as const,
      icon: <DarkModeOutlined fontSize="small" />,
    },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        right: 24,
        zIndex: 1100,
      }}
    >
      <Popover
        open={open}
        onOpenChange={setOpen}
        placement="bottom-end"
        content={
          <Box sx={{ p: 2, minWidth: 160 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1,
                mb: 1,
                display: "block",
                fontWeight: 600,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                fontSize: 11,
              }}
            >
              Theme
            </Typography>
            <Stack spacing={0.5}>
              {themeOptions.map((option) => {
                const isActive = mode === option.value;
                return (
                  <Box
                    key={option.value}
                    component="button"
                    onClick={() => {
                      setMode(option.value);
                      setOpen(false);
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      width: "100%",
                      px: 1.5,
                      py: 1,
                      border: "none",
                      borderRadius: 1,
                      cursor: "pointer",
                      bgcolor: isActive ? "action.selected" : "transparent",
                      color: isActive ? "primary.main" : "text.primary",
                      fontWeight: isActive ? 600 : 400,
                      fontSize: 14,
                      fontFamily: "inherit",
                      transition: "background-color 0.15s",
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    {option.icon}
                    {option.label}
                  </Box>
                );
              })}
            </Stack>
          </Box>
        }
      >
        <IconButton
          sx={{
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            boxShadow: 1,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <SettingsOutlined />
        </IconButton>
      </Popover>
    </Box>
  );
}
