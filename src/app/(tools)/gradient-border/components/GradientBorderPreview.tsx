/**
 * Gradient Border Preview Component
 * Renders a live preview of the gradient border effect
 */

"use client";

import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import type { GradientBorderConfig } from "../types";
import { buildGradientCSS, buildBorderImageSource, buildInnerBgCSS } from "../utils";

interface GradientBorderPreviewProps {
  config: GradientBorderConfig;
}

export function GradientBorderPreview({ config }: GradientBorderPreviewProps) {
  const gradient = buildGradientCSS(config.colorStops, config.gradientType, config.angle);
  const borderImageSrc = config.implementation === "border-image"
    ? buildBorderImageSource(config)
    : "";

  const previewStyle: React.CSSProperties = {
    width: config.previewWidth,
    height: config.previewHeight,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
    transition: "all 0.3s ease",
  };

  const renderPreview = () => {
    const innerBg = buildInnerBgCSS(config);

    switch (config.implementation) {
      case "border-image": {
        const opts = config.borderImageOptions;
        const slice = opts.sliceFill ? `${opts.slice} fill` : opts.slice;
        return (
          <Box
            sx={{
              ...previewStyle,
              border: `${config.borderWidth}px solid`,
              borderImage: `${borderImageSrc} ${slice} / ${opts.width} / ${opts.outset} ${opts.repeat}`,
              background: innerBg,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {config.previewContent || "Preview"}
            </Typography>
          </Box>
        );
      }

      case "pseudo-element": {
        return (
          <Box
            sx={{
              ...previewStyle,
              position: "relative",
              borderRadius: `${config.borderRadius}px`,
              background: innerBg,
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                padding: `${config.borderWidth}px`,
                borderRadius: `${config.borderRadius}px`,
                background: gradient,
                // Standard (Firefox)
                maskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
                maskClip: "content-box, border-box",
                maskComposite: "exclude",
                // Webkit (Chrome/Safari)
                WebkitMaskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
                WebkitMaskClip: "content-box, border-box",
                WebkitMaskComposite: "xor",
                pointerEvents: "none",
              },
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ position: "relative", zIndex: 1 }}>
              {config.previewContent || "Preview"}
            </Typography>
          </Box>
        );
      }

      case "background-clip":
      default:
        return (
          <Box
            sx={{
              ...previewStyle,
              border: `${config.borderWidth}px solid transparent`,
              borderRadius: `${config.borderRadius}px`,
              background: `${buildInnerBgCSS(config)} padding-box, ${gradient} border-box`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {config.previewContent || "Preview"}
            </Typography>
          </Box>
        );
    }
  };

  const isTransparent = config.previewBgColor === "transparent" || (config.previewBgOpacity ?? 100) < 100;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 350,
        bgcolor: isTransparent ? undefined : config.previewBgColor,
        backgroundImage: isTransparent
          ? `linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
             linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
             linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
             linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)`
          : undefined,
        backgroundSize: isTransparent ? "20px 20px" : undefined,
        backgroundPosition: isTransparent ? "0 0, 0 10px, 10px -10px, -10px 0px" : undefined,
      }}
    >
      {renderPreview()}
    </Paper>
  );
}
