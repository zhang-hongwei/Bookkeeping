/**
 * Clip Path Presets Panel (Right Column)
 * Visual card grid with shape thumbnails
 */

"use client";

import React, { useMemo } from "react";
import { Box, Typography, Stack, Paper, Chip, Tooltip } from "@mui/material";
import { useClipPathStore, useClipPathActions } from "@/store/clip-path";
import { POLYGON_PRESETS } from "../presets";
import type { ClipPathConfig } from "../types";

// Small SVG thumbnail for a preset shape
function PresetThumbnail({ config, size = 48 }: { config: ClipPathConfig; size?: number }) {
  const shapeEl = useMemo(() => {
    if (config.type === "polygon") {
      return (
        <polygon
          points={config.points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="currentColor"
          opacity={0.85}
        />
      );
    }
    if (config.type === "circle") {
      return (
        <circle
          cx={config.positionX}
          cy={config.positionY}
          r={Math.max(0.1, config.radius)}
          fill="currentColor"
          opacity={0.85}
        />
      );
    }
    if (config.type === "ellipse") {
      return (
        <ellipse
          cx={config.positionX}
          cy={config.positionY}
          rx={Math.max(0.1, config.radiusX)}
          ry={Math.max(0.1, config.radiusY)}
          fill="currentColor"
          opacity={0.85}
        />
      );
    }
    if (config.type === "inset") {
      return (
        <rect
          x={config.left}
          y={config.top}
          width={Math.max(0.1, 100 - config.left - config.right)}
          height={Math.max(0.1, 100 - config.top - config.bottom)}
          fill="currentColor"
          opacity={0.85}
        />
      );
    }
    return null;
  }, [config]);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: "block", color: "#6366f1" }}
    >
      <rect width="100" height="100" fill="rgba(0,0,0,0.04)" rx="4" />
      {shapeEl}
    </svg>
  );
}

export function ClipPathPresetsPanel() {
  const mode = useClipPathStore((s) => s.mode);
  const polygonPoints = useClipPathStore((s) => s.polygonPoints);
  const circle = useClipPathStore((s) => s.circle);
  const { applyPreset } = useClipPathActions();

  const currentConfig = useMemo((): ClipPathConfig => {
    if (mode === "polygon") return { type: "polygon", points: polygonPoints };
    if (mode === "circle") return { type: "circle", radius: circle.radius, positionX: circle.centerX, positionY: circle.centerY };
    if (mode === "ellipse") return { type: "ellipse", radiusX: 40, radiusY: 50, positionX: 50, positionY: 50 };
    return { type: "inset", top: 10, right: 10, bottom: 10, left: 10 };
  }, [mode, polygonPoints, circle]);

  const isPresetActive = (presetConfig: ClipPathConfig) => {
    if (presetConfig.type !== mode) return false;
    if (presetConfig.type === "polygon" && currentConfig.type === "polygon") {
      return JSON.stringify(presetConfig.points) === JSON.stringify(currentConfig.points);
    }
    return false;
  };

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600}>
        Presets
      </Typography>

      {/* Preset grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 1,
        }}
      >
        {POLYGON_PRESETS.filter((p) => p.config.type === "polygon").map((preset) => {
          const active = isPresetActive(preset.config);
          return (
            <Tooltip key={preset.name} title={preset.description} arrow placement="left">
              <Paper
                variant="outlined"
                onClick={() => applyPreset("polygon", { points: preset.config.points })}
                sx={{
                  p: 1,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                  borderColor: active ? "primary.main" : "divider",
                  bgcolor: active ? "primary.main" : "background.paper",
                  color: active ? "primary.contrastText" : "text.primary",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: active ? "primary.main" : "primary.main",
                    color: "primary.contrastText",
                    "& svg": { color: "primary.contrastText" },
                  },
                  "& svg": {
                    color: active ? "primary.contrastText" : "#6366f1",
                    transition: "color 0.15s ease",
                  },
                }}
              >
                <PresetThumbnail config={preset.config} size={40} />
                <Typography
                  variant="caption"
                  sx={{
                    textAlign: "center",
                    lineHeight: 1.2,
                    fontWeight: active ? 600 : 400,
                    fontSize: 10,
                  }}
                >
                  {preset.name}
                </Typography>
              </Paper>
            </Tooltip>
          );
        })}
      </Box>

      {/* Quick tips */}
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1,
          bgcolor: "action.hover",
          mt: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, display: "block" }}>
          Click a preset to apply. Drag points on the canvas to customize further.
        </Typography>
      </Box>
    </Stack>
  );
}
