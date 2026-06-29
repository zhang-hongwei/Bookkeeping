"use client";

import React from "react";
import {
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  WbSunny,
  Cloud,
  Grain,
  AcUnit,
  Tune,
  ViewInAr,
  LightMode,
  LocationOn,
} from "@mui/icons-material";
import type { SceneConfig, DeviceInfo } from "./RoomScene";

interface ControlPanelProps {
  config: SceneConfig;
  onConfigChange: (config: Partial<SceneConfig>) => void;
  devices: DeviceInfo[];
  selectedDevice: DeviceInfo | null;
  onSelectDevice: (device: DeviceInfo | null) => void;
  cameraPosition: { x: number; y: number; z: number };
}

const weatherOptions = [
  { value: "sunny", label: "Sunny", icon: <WbSunny />, color: "#ffb300" },
  { value: "cloudy", label: "Cloudy", icon: <Cloud />, color: "#78909c" },
  { value: "rain", label: "Rain", icon: <Grain />, color: "#42a5f5" },
  { value: "snow", label: "Snow", icon: <AcUnit />, color: "#e0e0e0" },
] as const;

const timeLabels = [
  { value: 0, label: "00:00" },
  { value: 6, label: "06:00" },
  { value: 12, label: "12:00" },
  { value: 18, label: "18:00" },
  { value: 24, label: "24:00" },
];

export default function ControlPanel({
  config,
  onConfigChange,
  devices,
  selectedDevice,
  onSelectDevice,
  cameraPosition,
}: ControlPanelProps) {
  const statusColor = (status: DeviceInfo["status"]) => {
    switch (status) {
      case "online":
        return "success";
      case "warning":
        return "warning";
      case "offline":
        return "error";
    }
  };

  return (
    <Box
      sx={{
        width: 320,
        height: "100%",
        overflowY: "auto",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": { bgcolor: "action.disabled", borderRadius: 2 },
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <ViewInAr sx={{ color: "primary.main" }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Conference Room
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Digital Twin Control Panel
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Weather Control */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <WbSunny sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="body2" fontWeight={600}>
            Weather &amp; Lighting
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
          Weather Condition
        </Typography>
        <ToggleButtonGroup
          value={config.weather}
          exclusive
          size="small"
          fullWidth
          onChange={(_, v) => v && onConfigChange({ weather: v })}
          sx={{ mb: 2 }}
        >
          {weatherOptions.map((opt) => (
            <Tooltip key={opt.value} title={opt.label}>
              <ToggleButton value={opt.value} sx={{ px: 1 }}>
                {opt.icon}
              </ToggleButton>
            </Tooltip>
          ))}
        </ToggleButtonGroup>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
          Time of Day: {String(Math.floor(config.timeOfDay)).padStart(2, "0")}:
          {String(Math.floor((config.timeOfDay % 1) * 60)).padStart(2, "0")}
        </Typography>
        <Slider
          value={config.timeOfDay}
          onChange={(_, v) => onConfigChange({ timeOfDay: v as number })}
          min={0}
          max={24}
          step={0.5}
          marks={timeLabels}
          valueLabelDisplay="off"
          size="small"
        />

        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
          Ambient Light: {Math.round(config.ambientIntensity * 100)}%
        </Typography>
        <Slider
          value={config.ambientIntensity}
          onChange={(_, v) => onConfigChange({ ambientIntensity: v as number })}
          min={0}
          max={2}
          step={0.05}
          size="small"
        />

        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
          Sun Light: {Math.round(config.lightIntensity * 100)}%
        </Typography>
        <Slider
          value={config.lightIntensity}
          onChange={(_, v) => onConfigChange({ lightIntensity: v as number })}
          min={0}
          max={3}
          step={0.05}
          size="small"
        />
      </Paper>

      {/* Display Options */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Tune sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="body2" fontWeight={600}>
            Display Options
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={config.showDevices}
              onChange={(e) => onConfigChange({ showDevices: e.target.checked })}
              size="small"
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LocationOn sx={{ fontSize: 16 }} />
              <Typography variant="body2">Device Markers</Typography>
            </Box>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={config.showGrid}
              onChange={(e) => onConfigChange({ showGrid: e.target.checked })}
              size="small"
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LightMode sx={{ fontSize: 16 }} />
              <Typography variant="body2">Floor Grid</Typography>
            </Box>
          }
        />
      </Paper>

      {/* Camera Info */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
          Camera Position
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {["x", "y", "z"].map((axis) => (
            <Chip
              key={axis}
              label={`${axis.toUpperCase()}: ${cameraPosition[axis as keyof typeof cameraPosition]?.toFixed(1) ?? 0}`}
              size="small"
              variant="outlined"
              sx={{ flex: 1, fontFamily: "monospace", fontSize: 11 }}
            />
          ))}
        </Box>
      </Paper>

      {/* Device List */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
          Devices ({devices.length})
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {devices.map((device) => (
            <Box
              key={device.id}
              onClick={() => onSelectDevice(selectedDevice?.id === device.id ? null : device)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 0.75,
                borderRadius: 1,
                cursor: "pointer",
                bgcolor: selectedDevice?.id === device.id ? "action.selected" : "transparent",
                "&:hover": { bgcolor: "action.hover" },
                transition: "background-color 0.15s",
              }}
            >
              <Chip
                label={device.status}
                color={statusColor(device.status)}
                size="small"
                sx={{ minWidth: 64, height: 20, fontSize: 10, fontWeight: 600 }}
              />
              <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                {device.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {device.type}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
