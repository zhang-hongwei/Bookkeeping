/**
 * Transform Preview Component
 * Visual preview with 3D cube option
 */

"use client";

import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { TransformValues } from "../types";
import { generateTransformCSS, generatePerspectiveCSS } from "../utils";

interface TransformPreviewProps {
  values: TransformValues;
  previewType: "box" | "text" | "cube";
  backgroundColor: string;
}

export function TransformPreview({
  values,
  previewType,
  backgroundColor,
}: TransformPreviewProps) {
  const theme = useTheme();
  const transformCSS = generateTransformCSS(values);
  const perspectiveCSS = generatePerspectiveCSS(values);

  const containerStyle: React.CSSProperties = {
    perspective: values.perspective ? `${values.perspective}px` : undefined,
  };

  const renderPreview = () => {
    switch (previewType) {
      case "cube":
        return (
          <Box
            sx={{
              width: 100,
              height: 100,
              position: "relative",
              transformStyle: "preserve-3d",
              transform: transformCSS,
              transition: "transform 0.3s ease",
            }}
          >
            {/* Front */}
            <Box
              sx={{
                position: "absolute",
                width: 100,
                height: 100,
                bgcolor: backgroundColor,
                border: "2px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "translateZ(50px)",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              Front
            </Box>
            {/* Back */}
            <Box
              sx={{
                position: "absolute",
                width: 100,
                height: 100,
                bgcolor: backgroundColor,
                opacity: 0.8,
                border: "2px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "translateZ(-50px) rotateY(180deg)",
                color: "#fff",
              }}
            >
              Back
            </Box>
            {/* Left */}
            <Box
              sx={{
                position: "absolute",
                width: 100,
                height: 100,
                bgcolor: backgroundColor,
                opacity: 0.7,
                border: "2px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "translateX(-50px) rotateY(-90deg)",
                color: "#fff",
              }}
            >
              Left
            </Box>
            {/* Right */}
            <Box
              sx={{
                position: "absolute",
                width: 100,
                height: 100,
                bgcolor: backgroundColor,
                opacity: 0.7,
                border: "2px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "translateX(50px) rotateY(90deg)",
                color: "#fff",
              }}
            >
              Right
            </Box>
            {/* Top */}
            <Box
              sx={{
                position: "absolute",
                width: 100,
                height: 100,
                bgcolor: backgroundColor,
                opacity: 0.6,
                border: "2px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "translateY(-50px) rotateX(90deg)",
                color: "#fff",
              }}
            >
              Top
            </Box>
            {/* Bottom */}
            <Box
              sx={{
                position: "absolute",
                width: 100,
                height: 100,
                bgcolor: backgroundColor,
                opacity: 0.6,
                border: "2px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "translateY(50px) rotateX(-90deg)",
                color: "#fff",
              }}
            >
              Bottom
            </Box>
          </Box>
        );

      case "text":
        return (
          <Typography
            sx={{
              fontSize: 48,
              fontWeight: 700,
              color: backgroundColor,
              transform: transformCSS,
              transition: "transform 0.3s ease",
            }}
          >
            Transform
          </Typography>
        );

      case "box":
      default:
        return (
          <Box
            sx={{
              width: 150,
              height: 150,
              backgroundColor: backgroundColor,
              borderRadius: 2,
              boxShadow: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              transform: transformCSS,
              transition: "transform 0.3s ease",
            }}
          >
            Box
          </Box>
        );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {/* Preview container */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
          bgcolor: theme.vars.palette.mode === "dark" ? "grey.900" : "grey.100",
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Box style={containerStyle}>{renderPreview()}</Box>
      </Paper>

      {/* Values summary */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
        }}
      >
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Current Values
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
          }}
        >
          {Object.entries(values).map(([key, value]) => {
            if (value === 0 || value === 1) return null;
            return (
              <Box
                key={key}
                sx={{
                  textAlign: "center",
                  p: 1,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {key}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {typeof value === "number" && key.includes("rotate") ? `${value}°` : value}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}
