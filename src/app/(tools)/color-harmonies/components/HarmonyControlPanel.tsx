/**
 * Harmony Control Panel Component
 * Editable controls for color harmony settings (right panel)
 */

"use client";

import React from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Slider,
  TextField,
  Button,
} from "@mui/material";

interface HarmonyControlPanelProps {
  baseColor: string;
  saturation: number;
  lightness: number;
  onBaseColorChange: (color: string) => void;
  onSaturationChange: (value: number) => void;
  onLightnessChange: (value: number) => void;
  onExport: () => void;
}

// Quick color presets
const COLOR_PRESETS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#a855f7", // purple
  "#ec4899", // pink
  "#78716c", // stone
];

export function HarmonyControlPanel({
  baseColor,
  saturation,
  lightness,
  onBaseColorChange,
  onSaturationChange,
  onLightnessChange,
  onExport,
}: HarmonyControlPanelProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        height: { xs: "auto", md: "calc(100vh - 200px)" },
        display: "flex",
        flexDirection: "column",
        position: { xs: "relative", md: "sticky" },
        top: { xs: 0, md: 24 },
        overflow: "auto",
      }}
    >
      {/* Color picker */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Base Color
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            type="color"
            value={baseColor}
            onChange={(e) => onBaseColorChange(e.target.value)}
            size="small"
            sx={{ width: 80 }}
          />
          <TextField
            value={baseColor}
            onChange={(e) => onBaseColorChange(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            placeholder="#000000"
          />
        </Box>
      </Box>

      {/* Color presets */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Quick Presets
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {COLOR_PRESETS.map((color) => (
            <Box
              key={color}
              onClick={() => onBaseColorChange(color)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                bgcolor: color,
                cursor: "pointer",
                border: baseColor === color ? "2px solid" : "1px solid",
                borderColor: baseColor === color ? "primary.main" : "divider",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.1)",
                },
              }}
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Saturation */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Saturation: {saturation}%
        </Typography>
        <Slider
          value={saturation}
          onChange={(_, value) => onSaturationChange(value as number)}
          min={0}
          max={100}
          size="small"
        />
      </Box>

      {/* Lightness */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Lightness: {lightness}%
        </Typography>
        <Slider
          value={lightness}
          onChange={(_, value) => onLightnessChange(value as number)}
          min={10}
          max={90}
          size="small"
        />
      </Box>

      {/* Export button */}
      <Button
        variant="contained"
        fullWidth
        onClick={onExport}
        sx={{ mt: "auto" }}
      >
        Export Code
      </Button>
    </Paper>
  );
}
