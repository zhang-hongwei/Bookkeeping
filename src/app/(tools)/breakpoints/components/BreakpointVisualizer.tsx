/**
 * Breakpoint Visualizer Component
 * Visual representation of responsive breakpoints
 */

"use client";

import React from "react";
import { Box, Paper, Typography, Stack, Chip } from "@mui/material";
import type { Breakpoint } from "../types";

interface BreakpointVisualizerProps {
  breakpoints: Breakpoint[];
}

export function BreakpointVisualizer({ breakpoints }: BreakpointVisualizerProps) {
  // Calculate max width for visualization
  const maxDeviceWidth = 1920;
  const visualScale = 100 / maxDeviceWidth;

  // Device reference markers
  const deviceMarkers = [
    { name: 'iPhone SE', width: 375 },
    { name: 'iPad', width: 768 },
    { name: 'Laptop', width: 1280 },
    { name: 'Desktop', width: 1920 },
  ];

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="subtitle2" gutterBottom color="text.secondary">
        Breakpoint Visualization
      </Typography>

      {/* Visual bar */}
      <Box
        sx={{
          position: "relative",
          height: 60,
          bgcolor: "action.hover",
          borderRadius: 1,
          mb: 4,
          overflow: "hidden",
        }}
      >
        {breakpoints.map((bp, i) => {
          const left = bp.minWidth * visualScale;
          const width = bp.maxWidth
            ? (bp.maxWidth - bp.minWidth + 1) * visualScale
            : (maxDeviceWidth - bp.minWidth) * visualScale;

          return (
            <Box
              key={bp.name}
              sx={{
                position: "absolute",
                left: `${left}%`,
                width: `${width}%`,
                height: "100%",
                bgcolor: bp.color || `hsl(${i * 60}, 70%, 60%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 11,
                fontWeight: "medium",
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                borderRight: i < breakpoints.length - 1 ? "1px solid rgba(255,255,255,0.3)" : "none",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "scaleY(1.1)",
                  boxShadow: 2,
                  zIndex: 10,
                },
              }}
              title={`${bp.name}: ${bp.minWidth}px${bp.maxWidth ? ` - ${bp.maxWidth}px` : '+'}`}
            >
              {bp.name}
            </Box>
          );
        })}

        {/* Device markers */}
        {deviceMarkers.map((device) => (
          <Box
            key={device.name}
            sx={{
              position: "absolute",
              left: `${device.width * visualScale}%`,
              bottom: 0,
              width: 2,
              height: 10,
              bgcolor: "text.secondary",
              transform: "translateX(-50%)",
            }}
          />
        ))}
      </Box>

      {/* Device reference line */}
      <Box
        sx={{
          position: "relative",
          height: 20,
          mb: 3,
        }}
      >
        {deviceMarkers.map((device) => (
          <Box
            key={device.name}
            sx={{
              position: "absolute",
              left: `${device.width * visualScale}%`,
              transform: "translateX(-50%)",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" sx={{ fontSize: 9, color: "text.disabled" }}>
              {device.name}
              <br />
              {device.width}px
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Breakpoint cards */}
      <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mt: 3 }}>
        Breakpoint Details
      </Typography>
      <Stack spacing={1}>
        {breakpoints.map((bp) => (
          <Box
            key={bp.name}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1.5,
              bgcolor: "action.hover",
              borderRadius: 1,
              cursor: "pointer",
              transition: "background-color 0.2s",
              "&:hover": {
                bgcolor: "action.selected",
              },
            }}
            onClick={() => navigator.clipboard.writeText(`@media (min-width: ${bp.minWidth}px)`)}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: 0.5,
                bgcolor: bp.color || "primary.main",
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                {bp.name.toUpperCase()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {bp.maxWidth
                  ? `${bp.minWidth}px - ${bp.maxWidth}px`
                  : `${bp.minWidth}px and up`}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Chip
                label={`min: ${bp.minWidth}px`}
                size="small"
                variant="outlined"
                sx={{ fontSize: 10 }}
              />
              {bp.maxWidth && (
                <Chip
                  label={`max: ${bp.maxWidth}px`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: 10 }}
                />
              )}
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
