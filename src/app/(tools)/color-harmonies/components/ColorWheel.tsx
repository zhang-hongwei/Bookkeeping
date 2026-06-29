/**
 * Color Wheel Component
 * Visual representation of color harmonies on a color wheel
 */

"use client";

import React, { useMemo } from "react";
import { Box, Paper, Typography } from "@mui/material";
import type { HarmonyResult } from "../types";

interface ColorWheelProps {
  result: HarmonyResult;
  size?: number;
}

export function ColorWheel({ result, size = 280 }: ColorWheelProps) {
  const { baseColor, colors, type } = result;

  // Calculate positions for each color on the wheel
  const colorPositions = useMemo(() => {
    return colors.map((color) => {
      // Convert hex to hue
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return { color, angle: 0, x: 50, y: 50 };

      ctx.fillStyle = color;
      // Parse hex to get RGB
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // Calculate hue from RGB
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;

      if (max !== min) {
        const d = max - min;
        switch (max) {
          case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / d + 2) / 6;
            break;
          case b:
            h = ((r - g) / d + 4) / 6;
            break;
        }
      }

      const angle = h * 360;
      const radian = (angle - 90) * (Math.PI / 180);
      const x = 50 + 40 * Math.cos(radian);
      const y = 50 + 40 * Math.sin(radian);

      return { color, angle, x, y };
    });
  }, [colors]);

  // Generate wheel gradient
  const wheelGradient = useMemo(() => {
    const stops = [];
    for (let i = 0; i <= 12; i++) {
      stops.push(`hsl(${i * 30}, 70%, 50%) ${i * 8.33}%`);
    }
    return `conic-gradient(${stops.join(", ")})`;
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Typography variant="subtitle2" color="text.secondary">
        Color Wheel - {type.charAt(0).toUpperCase() + type.slice(1)}
      </Typography>

      {/* Color Wheel SVG */}
      <Box
        sx={{
          position: "relative",
          width: size,
          height: size,
        }}
      >
        {/* Wheel background */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "80%",
            height: "80%",
            borderRadius: "50%",
            background: wheelGradient,
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "inset 0 0 20px rgba(255,255,255,0.1)"
                : "inset 0 0 20px rgba(0,0,0,0.1)",
          }}
        />

        {/* Center circle */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "20%",
            height: "20%",
            borderRadius: "50%",
            bgcolor: baseColor,
            border: "3px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        />

        {/* Color dots */}
        {colorPositions.map((pos, i) => (
          <Box
            key={`${pos.color}-${i}`}
            sx={{
              position: "absolute",
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
              width: 24,
              height: 24,
              borderRadius: "50%",
              bgcolor: pos.color,
              border: i === 0 ? "3px solid white" : "2px solid rgba(255,255,255,0.8)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              zIndex: i === 0 ? 10 : 5,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translate(-50%, -50%) scale(1.2)",
              },
            }}
            title={`${result.labels[i]}: ${pos.color}`}
          />
        ))}

        {/* Connection lines for certain harmony types */}
        {type !== "analogous" && colorPositions.length > 1 && (
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
            viewBox="0 0 100 100"
          >
            {type === "complementary" && colorPositions.length === 2 && (
              <line
                x1={colorPositions[0].x}
                y1={colorPositions[0].y}
                x2={colorPositions[1].x}
                y2={colorPositions[1].y}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            )}
            {(type === "triadic" || type === "split-complementary") &&
              colorPositions.length === 3 && (
                <polygon
                  points={colorPositions.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="rgba(255,255,255,0.1)"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="0.3"
                />
              )}
            {(type === "tetradic" || type === "compound") &&
              colorPositions.length === 4 && (
                <polygon
                  points={colorPositions.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="rgba(255,255,255,0.1)"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="0.3"
                />
              )}
          </svg>
        )}
      </Box>

      {/* Color swatches */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "center",
        }}
      >
        {colors.map((color, i) => (
          <Box
            key={`${color}-${i}`}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1,
                bgcolor: color,
                border: i === 0 ? "2px solid" : "1px solid",
                borderColor: i === 0 ? "primary.main" : "divider",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.1)",
                },
              }}
              onClick={() => navigator.clipboard.writeText(color)}
              title={`Click to copy: ${color}`}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
              {result.labels[i]}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                fontSize: 10,
                cursor: "pointer",
              }}
              onClick={() => navigator.clipboard.writeText(color)}
            >
              {color.toUpperCase()}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
