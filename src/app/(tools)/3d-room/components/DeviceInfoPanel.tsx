"use client";

import React from "react";
import { Box, Typography, Paper, Chip, IconButton, Divider } from "@mui/material";
import { Close, SettingsOutlined, LocationOn } from "@mui/icons-material";
import type { DeviceInfo } from "./RoomScene";

interface DeviceInfoPanelProps {
  device: DeviceInfo;
  onClose: () => void;
}

const typeIcons: Record<string, string> = {
  projection: "📽️",
  display: "🖥️",
  climate: "❄️",
  lighting: "💡",
  video: "📷",
  audio: "🔊",
  sensor: "📡",
  network: "🌐",
};

export default function DeviceInfoPanel({ device, onClose }: DeviceInfoPanelProps) {
  const statusColor = device.status === "online" ? "success" : device.status === "warning" ? "warning" : "error";

  return (
    <Paper
      elevation={4}
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 300,
        zIndex: 10,
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.primary.main}08)`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 22 }}>{typeIcons[device.type] ?? "📦"}</Typography>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {device.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
              <Chip label={device.status.toUpperCase()} color={statusColor} size="small" sx={{ height: 18, fontSize: 10 }} />
              <Typography variant="caption" color="text.secondary">
                {device.type}
              </Typography>
            </Box>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Divider />

      {/* Location */}
      <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
          X: {device.position[0].toFixed(1)} Y: {device.position[1].toFixed(1)} Z: {device.position[2].toFixed(1)}
        </Typography>
      </Box>

      <Divider />

      {/* Parameters */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <SettingsOutlined sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            Parameters
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {Object.entries(device.params).map(([key, value]) => (
            <Box
              key={key}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 0.4,
                px: 1,
                borderRadius: 0.5,
                bgcolor: "action.hover",
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                {key.replace(/_/g, " ")}
              </Typography>
              <Typography variant="caption" fontWeight={600} fontFamily="monospace">
                {String(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
