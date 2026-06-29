/**
 * Clip Path Preview Component
 * Visual preview with grid background
 */

"use client";

import React from "react";
import { Box, Paper } from "@mui/material";
import type { ClipPathConfig } from "../types";
import { generateClipPathCSS } from "../utils";

interface ClipPathPreviewProps {
  config: ClipPathConfig;
  backgroundColor: string;
  showGrid?: boolean;
}

export function ClipPathPreview({
  config,
  backgroundColor,
  showGrid = true,
}: ClipPathPreviewProps) {
  const clipPath = generateClipPathCSS(config);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Preview container */}
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          minHeight: 350,
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "divider",
          overflow: "hidden",
          ...(showGrid && {
            backgroundImage: `
              linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(0,0,0,0.05) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.05) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.05) 75%)
            `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
          }),
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Clipped element */}
        <Box
          sx={{
            width: 200,
            height: 200,
            backgroundColor: backgroundColor,
            clipPath: clipPath === "none" ? undefined : clipPath,
            transition: "clip-path 0.3s ease",
            boxShadow: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {config.type !== "none" && "Clipped"}
        </Box>

        {/* Original outline for comparison */}
        {config.type !== "none" && (
          <Box
            sx={{
              position: "absolute",
              width: 200,
              height: 200,
              border: "2px dashed rgba(0,0,0,0.2)",
              pointerEvents: "none",
            }}
          />
        )}
      </Paper>

      {/* Type info */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            bgcolor: "action.hover",
            borderRadius: 1,
          }}
        >
          Type: {config.type}
        </Box>
        {config.type === "circle" && (
          <>
            <Box sx={{ px: 1.5, py: 0.5, bgcolor: "action.hover", borderRadius: 1 }}>
              Radius: {config.radius}%
            </Box>
            <Box sx={{ px: 1.5, py: 0.5, bgcolor: "action.hover", borderRadius: 1 }}>
              Position: {config.positionX}%, {config.positionY}%
            </Box>
          </>
        )}
        {config.type === "ellipse" && (
          <>
            <Box sx={{ px: 1.5, py: 0.5, bgcolor: "action.hover", borderRadius: 1 }}>
              Radii: {config.radiusX}% x {config.radiusY}%
            </Box>
          </>
        )}
        {config.type === "polygon" && (
          <Box sx={{ px: 1.5, py: 0.5, bgcolor: "action.hover", borderRadius: 1 }}>
            Points: {config.points.length}
          </Box>
        )}
        {config.type === "inset" && (
          <Box sx={{ px: 1.5, py: 0.5, bgcolor: "action.hover", borderRadius: 1 }}>
            {config.top}% {config.right}% {config.bottom}% {config.left}%
          </Box>
        )}
      </Box>
    </Box>
  );
}
