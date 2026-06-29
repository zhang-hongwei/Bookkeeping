/**
 * Right panel: presets, export button
 */

"use client";

import React, { useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
} from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import { GRADIENT_BORDER_PRESETS } from "../presets";
import { useGradientBorderStore, useGradientBorderActions } from "@/store/gradient-border";
import { generateHTML } from "../utils";
import type { ColorStop } from "@/components/shared/color-stop/types";

function stopsToGradient(stops: ColorStop[], type: string, angle: number): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const colorStr = sorted
    .map((s) => {
      const { r, g, b } = {
        r: parseInt(s.color.slice(1, 3), 16) || 0,
        g: parseInt(s.color.slice(3, 5), 16) || 0,
        b: parseInt(s.color.slice(5, 7), 16) || 0,
      };
      return `rgba(${r},${g},${b},${s.opacity / 100}) ${s.position}%`;
    })
    .join(", ");

  if (type === "radial") return `radial-gradient(circle, ${colorStr})`;
  if (type === "conic") return `conic-gradient(from ${angle}deg, ${colorStr})`;
  return `linear-gradient(${angle}deg, ${colorStr})`;
}

export function GradientBorderPresetsPanel() {
  const config = useGradientBorderStore((s) => s.config);
  const { applyPreset, setExportDialogOpen, reset } = useGradientBorderActions();

  const handleDownloadHTML = useCallback(() => {
    const html = generateHTML(config);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gradient-border.html";
    a.click();
    URL.revokeObjectURL(url);
  }, [config]);

  return (
    <Stack spacing={2.5} sx={{ position: { lg: "sticky" }, top: 16 }}>
      {/* Presets */}
      <Paper elevation={2} sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Presets</Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.5,
          }}
        >
          {GRADIENT_BORDER_PRESETS.map((preset) => (
            <Box
              key={preset.name}
              onClick={() => applyPreset(preset.name)}
              sx={{
                cursor: "pointer",
                borderRadius: 1.5,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                transition: "border-color 0.2s, box-shadow 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: 1,
                },
              }}
            >
              {/* Mini preview */}
              <Box
                sx={{
                  height: 56,
                  backgroundImage: stopsToGradient(
                    preset.config.colorStops,
                    preset.config.gradientType,
                    preset.config.angle,
                  ),
                  borderRadius: preset.config.borderRadius
                    ? `${Math.min(preset.config.borderRadius, 12)}px ${Math.min(preset.config.borderRadius, 12)}px 0 0`
                    : undefined,
                }}
              />
              {/* Name */}
              <Box sx={{ px: 1, py: 0.75 }}>
                <Typography variant="caption" fontWeight={600} noWrap display="block">
                  {preset.name}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Export & Reset buttons */}
      <Stack spacing={1}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" fullWidth onClick={() => setExportDialogOpen(true)} size="large">
            Export Code
          </Button>
          <Button variant="outlined" onClick={reset} size="large" color="inherit">
            Reset
          </Button>
        </Box>
        <Button
          variant="outlined"
          fullWidth
          size="large"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadHTML}
        >
          Download HTML
        </Button>
      </Stack>
    </Stack>
  );
}
