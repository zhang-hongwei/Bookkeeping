"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import { BorderBeam } from "border-beam";
import type { BeamConfig } from "../types";

interface PreviewPanelProps extends BeamConfig {
  isPageLight: boolean;
}

export function PreviewPanel({
  isPageLight,
  size,
  colorVariant,
  beamTheme,
  strength,
  duration,
  brightness,
  active,
  staticColors,
}: PreviewPanelProps) {
  const isBeamLight = beamTheme === "light";
  const previewBg = isBeamLight ? "#f5f5f5" : "#1a1a2e";
  const previewText = isBeamLight ? "#222" : "#e0e0e0";
  const previewSubText = isBeamLight ? "#555" : "#999";
  const panelBorder = isPageLight ? "#e0e0e0" : "#222";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 420,
        borderRadius: 3,
        bgcolor: isPageLight ? "#fafafa" : "#0d0d1a",
        border: `1px solid ${panelBorder}`,
        p: 4,
      }}
    >
      <BorderBeam
        size={size}
        colorVariant={colorVariant}
        theme={beamTheme}
        strength={strength}
        duration={duration}
        brightness={brightness}
        active={active}
        staticColors={staticColors}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: previewBg,
            color: previewText,
            width: 360,
            maxWidth: "100%",
          }}
        >
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Border Beam 预览
          </Typography>
          <Typography variant="body2" sx={{ color: previewSubText, mb: 2 }}>
            通过左侧控件或右侧预设来调整效果，光束动画会包裹内部的所有内容。
          </Typography>
          <Divider sx={{ my: 2, borderColor: isBeamLight ? "#ddd" : "#333" }} />
          <Stack direction="row" spacing={1}>
            <Chip label={size} size="small" />
            <Chip label={colorVariant} size="small" variant="outlined" />
          </Stack>
        </Paper>
      </BorderBeam>
    </Box>
  );
}
