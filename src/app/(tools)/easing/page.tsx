/**
 * Easing Curves Editor Page
 * Visual cubic-bezier curve editor
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
  Slider,
  Button,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { EASING_PRESETS, getPresetByName } from "./presets";
import type { EasingConfig, EasingPoint, EasingExportFormat } from "./types";
import { generateCubicBezier, generateCode, generateCurvePoints } from "./utils";

// Curve visualization component
function CurveVisualizer({
  config,
  size = 400,
}: {
  config: EasingConfig;
  size?: number;
}) {
  const padding = 40;
  const innerSize = size - padding * 2;

  const curvePoints = useMemo(() => generateCurvePoints(config, 100), [config]);

  const toSvgX = (x: number) => padding + x * innerSize;
  const toSvgY = (y: number) => padding + innerSize - y * innerSize;

  // Generate path string
  const pathD = curvePoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toSvgX(p.x)} ${toSvgY(p.y)}`)
    .join(" ");

  // Control points
  const cp1 = { x: toSvgX(config.p1.x), y: toSvgY(config.p1.y) };
  const cp2 = { x: toSvgX(config.p2.x), y: toSvgY(config.p2.y) };

  // Animation preview state
  const [animating, setAnimating] = useState(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* SVG Canvas */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: (theme) => (theme.vars.palette.mode === "dark" ? "grey.900" : "grey.100"),
          borderRadius: 2,
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Grid */}
          <g stroke="rgba(128,128,128,0.2)" strokeWidth="1">
            {[0.25, 0.5, 0.75].map((v) => (
              <g key={v}>
                <line x1={toSvgX(v)} y1={padding} x2={toSvgX(v)} y2={size - padding} />
                <line x1={padding} y1={toSvgY(v)} x2={size - padding} y2={toSvgY(v)} />
              </g>
            ))}
          </g>

          {/* Diagonal reference line */}
          <line
            x1={padding}
            y1={size - padding}
            x2={size - padding}
            y1={padding}
            stroke="rgba(128,128,128,0.3)"
            strokeWidth="1"
            strokeDasharray="5,5"
          />

          {/* Control point lines */}
          <line x1={toSvgX(0)} y1={toSvgY(0)} x2={cp1.x} y2={cp1.y} stroke="#888" strokeWidth="1" />
          <line x1={toSvgX(1)} y1={toSvgY(1)} x2={cp2.x} y2={cp2.y} stroke="#888" strokeWidth="1" />

          {/* Curve path */}
          <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />

          {/* Start and end points */}
          <circle cx={toSvgX(0)} cy={toSvgY(0)} r="4" fill="#333" />
          <circle cx={toSvgX(1)} cy={toSvgY(1)} r="4" fill="#333" />

          {/* Control points */}
          <circle cx={cp1.x} cy={cp1.y} r="6" fill="#f59e0b" />
          <circle cx={cp2.x} cy={cp2.y} r="6" fill="#f59e0b" />

          {/* Labels */}
          <text x={cp1.x + 10} y={cp1.y - 10} fontSize="12" fill="#f59e0b">
            P1
          </text>
          <text x={cp2.x + 10} y={cp2.y - 10} fontSize="12" fill="#f59e0b">
            P2
          </text>
        </svg>
      </Paper>

      {/* Animation preview */}
      <Box
        sx={{
          height: 60,
          bgcolor: "action.hover",
          borderRadius: 1,
          position: "relative",
          overflow: "hidden",
          p: 1,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            bgcolor: "primary.main",
            borderRadius: 1,
            position: "absolute",
            left: animating ? "calc(100% - 50px)" : "10px",
            transition: `left 1000ms ${generateCubicBezier(config)}`,
          }}
        />
        <Button
          size="small"
          sx={{ position: "absolute", right: 8, top: 8 }}
          onClick={() => {
            setAnimating(false);
            setTimeout(() => setAnimating(true), 50);
          }}
        >
          Play
        </Button>
      </Box>
    </Box>
  );
}

export default function EasingCurvesPage() {
  const [config, setConfig] = useState<EasingConfig>({
    name: "custom",
    p1: { x: 0.4, y: 0 },
    p2: { x: 0.2, y: 1 },
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const updateP1 = (axis: "x" | "y", value: number) => {
    setConfig((prev) => ({
      ...prev,
      p1: { ...prev.p1, [axis]: value },
    }));
  };

  const updateP2 = (axis: "x" | "y", value: number) => {
    setConfig((prev) => ({
      ...prev,
      p2: { ...prev.p2, [axis]: value },
    }));
  };

  const handlePresetApply = (presetName: string) => {
    const preset = getPresetByName(presetName);
    if (preset) {
      setConfig({ ...preset.config, name: preset.name });
    }
  };

  const handleCopy = async (format: EasingExportFormat) => {
    const code = generateCode(config, format);
    await navigator.clipboard.writeText(code);
    setSnackbarOpen(true);
  };

  const cssValue = generateCubicBezier(config);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Page header */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Easing Curves Editor
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Visualize and customize cubic-bezier timing functions
            </Typography>
          </Box>

          <Divider />

          {/* Presets */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Presets
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {EASING_PRESETS.map((preset) => (
                <Chip
                  key={preset.name}
                  label={preset.name}
                  onClick={() => handlePresetApply(preset.name)}
                  variant={config.name === preset.name ? "filled" : "outlined"}
                  color={config.name === preset.name ? "primary" : "default"}
                  size="small"
                />
              ))}
            </Box>
          </Box>

          <Divider />

          {/* Main editing area */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 400px" },
              gap: 3,
              alignItems: "start",
            }}
          >
            {/* Left: Curve visualization */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <CurveVisualizer config={config} />

              {/* CSS output */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  CSS Value
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    fontFamily: "monospace",
                    fontSize: 14,
                    bgcolor: "action.hover",
                  }}
                >
                  transition-timing-function: {cssValue};
                </Paper>
              </Box>
            </Paper>

            {/* Right: Control panel */}
            <Paper
              elevation={2}
              sx={{
                p: 2,
                height: { xs: "auto", md: "calc(100vh - 250px)" },
                position: { xs: "relative", md: "sticky" },
                top: { xs: 0, md: 24 },
                overflow: "auto",
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Control Points
              </Typography>

              {/* P1 controls */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  P1 X: {config.p1.x.toFixed(3)}
                </Typography>
                <Slider
                  value={config.p1.x}
                  onChange={(_, v) => updateP1("x", v as number)}
                  min={-1}
                  max={2}
                  step={0.01}
                  size="small"
                />
                <Typography variant="caption" color="text.secondary">
                  P1 Y: {config.p1.y.toFixed(3)}
                </Typography>
                <Slider
                  value={config.p1.y}
                  onChange={(_, v) => updateP1("y", v as number)}
                  min={-1}
                  max={2}
                  step={0.01}
                  size="small"
                />
              </Box>

              {/* P2 controls */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  P2 X: {config.p2.x.toFixed(3)}
                </Typography>
                <Slider
                  value={config.p2.x}
                  onChange={(_, v) => updateP2("x", v as number)}
                  min={-1}
                  max={2}
                  step={0.01}
                  size="small"
                />
                <Typography variant="caption" color="text.secondary">
                  P2 Y: {config.p2.y.toFixed(3)}
                </Typography>
                <Slider
                  value={config.p2.y}
                  onChange={(_, v) => updateP2("y", v as number)}
                  min={-1}
                  max={2}
                  step={0.01}
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Copy buttons */}
              <Stack spacing={1}>
                <Typography variant="subtitle2">Export</Typography>
                <Button variant="contained" onClick={() => handleCopy("css")}>
                  Copy CSS
                </Button>
                <Button variant="outlined" onClick={() => handleCopy("tailwind")}>
                  Copy Tailwind Config
                </Button>
                <Button variant="outlined" onClick={() => handleCopy("json")}>
                  Copy JSON
                </Button>
              </Stack>
            </Paper>
          </Box>

          {/* Tips */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: "info.light",
              color: "info.contrastText",
            }}
          >
            <Typography variant="body2" gutterBottom fontWeight="bold">
              Tips:
            </Typography>
            <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
              <Typography component="li" variant="caption">
                P1 and P2 can exceed 0-1 range for bounce/elastic effects
              </Typography>
              <Typography component="li" variant="caption">
                Values above 1 create overshoot, negative values create anticipation
              </Typography>
              <Typography component="li" variant="caption">
                Click "Play" to preview the animation curve
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}
