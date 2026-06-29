"use client";

import { useState } from "react";
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  Stack,
  Switch,
  Button,
  Divider,
} from "@mui/material";
import {
  Close,
  Refresh,
  ContentCopy,
  LightModeOutlined,
  DarkModeOutlined,
  FormatListBulletedOutlined,
} from "@mui/icons-material";
import { useColorScheme } from "@mui/material/styles";
import { useLayoutStore } from "@/store/layoutStore";

interface SettingsDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

export function SettingsDrawer({
  open = false,
  onClose = () => { },
}: SettingsDrawerProps) {
  const { mode, setMode } = useColorScheme();

  // 从全局 store 获取状态
  const {
    compact,
    setCompact,
    rtl,
    setRtl,
    contrast,
    setContrast,
    layoutMode,
    setLayoutMode,
    colorMode,
    setColorMode,
    fontSize,
    setFontSize,
    resetLayout,
  } = useLayoutStore();

  const presets = [
    { id: "teal", color: "#009688" },
    { id: "blue", color: "#2196F3" },
    { id: "purple", color: "#9C27B0" },
    { id: "blue2", color: "#1976D2" },
    { id: "orange", color: "#FF9800" },
    { id: "red", color: "#F44336" },
  ];

  const layouts = [
    { id: "integrate", name: "Integrate" },
    { id: "apparent", name: "Apparent" },
  ];

  const fonts = [
    { name: "Public Sans", family: "'Public Sans'" },
    { name: "Inter", family: "'Inter'" },
    { name: "DM Sans", family: "'DM Sans'" },
    { name: "Nunito Sans", family: "'Nunito Sans'" },
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      hideBackdrop
      sx={{
        "& .MuiDrawer-paper": {
          width: 360,
          boxSizing: "border-box",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Settings
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton size="small" title="Reset" onClick={resetLayout}>
            <Refresh sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton size="small" title="Copy">
            <ContentCopy sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton size="small" onClick={onClose}>
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
      </Box>

      <Divider />

      {/* Scrollable Content */}
      <Box
        sx={{
          overflow: "auto",
          flex: 1,
          p: 2,
        }}
      >
        {/* Mode */}
        <Box sx={{ mb: 3 }}>
          <SettingRow
            label="Mode"
            value={mode === "dark"}
            onChange={(checked) => setMode(checked ? "dark" : "light")}
            icon={mode === "dark" ? <DarkModeOutlined /> : <LightModeOutlined />}
          />
        </Box>

        {/* Contrast */}
        <Box sx={{ mb: 3 }}>
          <SettingRow
            label="Contrast"
            value={contrast}
            onChange={setContrast}
          />
        </Box>

        {/* Right to left */}
        <Box sx={{ mb: 3 }}>
          <SettingRow
            label="Right to left"
            value={rtl}
            onChange={setRtl}
          />
        </Box>

        {/* Compact */}
        <Box sx={{ mb: 3 }}>
          <SettingRow
            label="Compact"
            value={compact}
            onChange={setCompact}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Layout */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, fontSize: 12 }}>
            Layout
          </Typography>
          <Stack direction="row" spacing={1.5}>
            {layouts.map((layout) => (
              <Box
                key={layout.id}
                onClick={() => setLayoutMode(layout.id as any)}
                sx={{
                  flex: 1,
                  p: 1.5,
                  border: "2px solid",
                  borderColor: layoutMode === layout.id ? "primary.main" : "divider",
                  borderRadius: 1,
                  cursor: "pointer",
                  bgcolor:
                    layoutMode === layout.id
                      ? "primary.lighter"
                      : "background.paper",
                  transition: "all 0.3s",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                {/* Layout Icon Placeholder */}
                <Box
                  sx={{
                    width: "100%",
                    height: 40,
                    bgcolor: "grey.200",
                    borderRadius: 1,
                    mb: 0.5,
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: 12 }}>
                  {layout.name}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Color */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, fontSize: 12 }}>
            Color
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            {["integrate", "apparent"].map((color) => (
              <Box
                key={color}
                onClick={() => setColorMode(color as any)}
                sx={{
                  flex: 1,
                  p: 1,
                  border: "2px solid",
                  borderColor: colorMode === color ? "primary.main" : "divider",
                  borderRadius: 1,
                  cursor: "pointer",
                  bgcolor: "background.paper",
                  textAlign: "center",
                  transition: "all 0.3s",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <Typography variant="caption" sx={{ fontSize: 12 }}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Presets */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, fontSize: 12 }}>
            Presets
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
            {presets.map((preset) => (
              <Box
                key={preset.id}
                onClick={() => {
                  // Handle preset selection
                }}
                sx={{
                  width: "calc(33.333% - 10px)",
                  aspectRatio: "1/1",
                  bgcolor: preset.color,
                  borderRadius: 1,
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Font */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, fontSize: 12 }}>
            Font
          </Typography>
          <Typography variant="caption" sx={{ fontSize: 11, color: "text.secondary" }}>
            Family
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 1 }}>
            {fonts.map((font) => (
              <Box
                key={font.name}
                sx={{
                  flex: "0 0 calc(50% - 8px)",
                  p: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <Typography variant="caption" sx={{ fontSize: 12 }}>
                  {font.name}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Font Size */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="caption" sx={{ fontSize: 11, color: "text.secondary" }}>
              Size
            </Typography>
            <Box
              sx={{
                bgcolor: "action.hover",
                px: 1,
                py: 0.5,
                borderRadius: 0.5,
                minWidth: 45,
                textAlign: "center",
              }}
            >
              <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 600 }}>
                {fontSize}px
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              height: 4,
              bgcolor: "primary.main",
              borderRadius: 2,
              position: "relative",
              cursor: "pointer",
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percentage = (e.clientX - rect.left) / rect.width;
              setFontSize(Math.round(12 + percentage * 18));
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: 10, color: "text.secondary" }}>
              12px
            </Typography>
            <Typography variant="caption" sx={{ fontSize: 10, color: "text.secondary" }}>
              30px
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}

// Helper Component for Settings Row
function SettingRow({
  label,
  value,
  onChange,
  icon,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon && (
          <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
            {icon}
          </Box>
        )}
        <Typography variant="body2" sx={{ fontSize: 14, fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
      <Switch
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        size="small"
      />
    </Box>
  );
}
