"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import { BorderBeam } from "border-beam";
import { PRESETS, type PresetConfig } from "../types";

interface PresetPanelProps {
  isPageLight: boolean;
  selectedSize: string;
  selectedColorVariant: string;
  selectedBeamTheme: string;
  onSelect: (preset: PresetConfig) => void;
}

export function PresetPanel({
  isPageLight,
  selectedSize,
  selectedColorVariant,
  selectedBeamTheme,
  onSelect,
}: PresetPanelProps) {
  const panelBg = isPageLight ? "#fafafa" : "#111";
  const panelBorder = isPageLight ? "#e0e0e0" : "#222";
  const labelColor = isPageLight ? "grey.600" : "grey.400";

  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: panelBg,
        border: `1px solid ${panelBorder}`,
        maxHeight: "calc(100vh - 200px)",
        overflow: "auto",
      }}
    >
      <Typography variant="subtitle2" sx={{ color: labelColor }}>
        预设方案
      </Typography>

      {PRESETS.map((preset) => {
        const isSelected =
          selectedSize === preset.size &&
          selectedColorVariant === preset.colorVariant &&
          selectedBeamTheme === preset.theme;
        return (
          <Box
            key={preset.label}
            onClick={() => onSelect(preset)}
            sx={{
              cursor: "pointer",
              borderRadius: 2,
              border: `1px solid ${isSelected ? "#a78bfa" : panelBorder}`,
              bgcolor: isSelected ? "rgba(167,139,250,0.08)" : "transparent",
              p: 1.5,
              transition: "border-color 0.2s, background-color 0.2s",
              "&:hover": {
                borderColor: "#a78bfa",
                bgcolor: "rgba(167,139,250,0.05)",
              },
            }}
          >
            <BorderBeam
              size={preset.size}
              colorVariant={preset.colorVariant}
              theme={preset.theme}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: preset.theme === "light" ? "#f5f5f5" : "#1a1a2e",
                  color: preset.theme === "light" ? "#222" : "#e0e0e0",
                }}
              >
                <Typography variant="caption" fontWeight={600}>
                  {preset.label}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ color: preset.theme === "light" ? "#666" : "#888" }}
                >
                  {preset.size} · {preset.colorVariant}
                </Typography>
              </Paper>
            </BorderBeam>
          </Box>
        );
      })}
    </Stack>
  );
}
