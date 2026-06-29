/**
 * Animation Preview Component
 * Visual preview with play controls
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, IconButton, Paper } from "@mui/material";
import { PlayArrow, Pause, Replay } from "@mui/icons-material";
import type { AnimationConfig, KeyframeDefinition } from "../types";
import { generateKeyframes, generateAnimationShorthand } from "../utils";

interface AnimationPreviewProps {
  keyframes: KeyframeDefinition;
  config: AnimationConfig;
  previewElement?: "box" | "text" | "icon";
  previewColor?: string;
}

export function AnimationPreview({
  keyframes,
  config,
  previewElement = "box",
  previewColor = "#6366f1",
}: AnimationPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(config.playState === "running");
  const [key, setKey] = useState(0);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // Inject keyframes into the document
  useEffect(() => {
    const keyframeCSS = generateKeyframes(keyframes);

    // Create or update style element
    if (!styleRef.current) {
      styleRef.current = document.createElement("style");
      styleRef.current.id = `animation-preview-${keyframes.name}`;
      document.head.appendChild(styleRef.current);
    }

    styleRef.current.textContent = keyframeCSS;

    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, [keyframes]);

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleReplay = () => {
    setIsPlaying(false);
    setKey((prev) => prev + 1);
    setTimeout(() => setIsPlaying(true), 10);
  };

  const animationStyle: React.CSSProperties = {
    animationName: keyframes.name,
    animationDuration: `${config.duration}s`,
    animationTimingFunction: config.timingFunction,
    animationDelay: `${config.delay}s`,
    animationIterationCount: config.iterationCount,
    animationDirection: config.direction,
    animationFillMode: config.fillMode,
    animationPlayState: isPlaying ? "running" : "paused",
  };

  const renderPreviewElement = () => {
    switch (previewElement) {
      case "text":
        return (
          <Typography
            key={key}
            sx={{
              ...animationStyle,
              fontSize: 48,
              fontWeight: 700,
              color: previewColor,
            }}
          >
            Hello
          </Typography>
        );
      case "icon":
        return (
          <Box
            key={key}
            component="span"
            sx={{
              ...animationStyle,
              fontSize: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {previewColor === "#ef4444" ? "❤️" : previewColor === "#3b82f6" ? "⭐" : "🚀"}
          </Box>
        );
      case "box":
      default:
        return (
          <Box
            key={key}
            sx={{
              ...animationStyle,
              width: 100,
              height: 100,
              backgroundColor: previewColor,
              borderRadius: 2,
              boxShadow: 3,
            }}
          />
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
          backgroundColor: (theme) =>
            theme.vars.palette.mode === "dark" ? "grey.900" : "grey.100",
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "divider",
        }}
      >
        {renderPreviewElement()}
      </Paper>

      {/* Controls */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
        <IconButton
          onClick={handlePlayPause}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        <IconButton onClick={handleReplay}>
          <Replay />
        </IconButton>
      </Box>

      {/* Info */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{ px: 1, py: 0.5, bgcolor: "action.hover", borderRadius: 1 }}
        >
          Duration: {config.duration}s
        </Typography>
        <Typography
          variant="caption"
          sx={{ px: 1, py: 0.5, bgcolor: "action.hover", borderRadius: 1 }}
        >
          Timing: {config.timingFunction}
        </Typography>
        <Typography
          variant="caption"
          sx={{ px: 1, py: 0.5, bgcolor: "action.hover", borderRadius: 1 }}
        >
          Iterations: {config.iterationCount}
        </Typography>
      </Box>
    </Box>
  );
}
