/**
 * Background Patterns Generator Page
 * SVG background pattern generator
 */

"use client";

import React, { useState } from "react";
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
  TextField,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { generateSVG, generateCSS, generateCSSGradient, generateSVGDataURL } from "./utils";
import type { PatternType, PatternConfig } from "./types";

const PATTERN_TYPES: { value: PatternType; label: string }[] = [
  { value: "dots", label: "Dots" },
  { value: "grid", label: "Grid" },
  { value: "stripes", label: "Stripes" },
  { value: "diagonalStripes", label: "Diagonal" },
  { value: "zigzag", label: "Zigzag" },
  { value: "waves", label: "Waves" },
  { value: "triangles", label: "Triangles" },
  { value: "squares", label: "Squares" },
  { value: "circles", label: "Circles" },
  { value: "hexagons", label: "Hexagons" },
];

const DEFAULT_CONFIG: PatternConfig = {
  type: "dots",
  foreground: "#000000",
  background: "#ffffff",
  size: 20,
  opacity: 0.1,
  strokeWidth: 1,
  spacing: 0,
};

export default function PatternsGeneratorPage() {
  const [config, setConfig] = useState<PatternConfig>(DEFAULT_CONFIG);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const updateConfig = <K extends keyof PatternConfig>(key: K, value: PatternConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbarOpen(true);
  };

  const svgDataURL = generateSVGDataURL(config);
  const cssCode = generateCSS(config);
  const cssGradientCode = generateCSSGradient(config);

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
              Background Patterns
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Generate SVG background patterns for your designs
            </Typography>
          </Box>

          <Divider />

          {/* Main editing area */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "400px 1fr" },
              gap: 3,
              alignItems: "start",
            }}
          >
            {/* Left: Control panel */}
            <Paper
              elevation={2}
              sx={{
                p: 2,
                height: { xs: "auto", md: "calc(100vh - 200px)" },
                display: "flex",
                flexDirection: "column",
                position: { xs: "relative", md: "sticky" },
                top: { xs: 0, md: 24 },
                overflow: "auto",
              }}
            >
              {/* Pattern type */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Pattern Type
                </Typography>
                <ToggleButtonGroup
                  value={config.type}
                  exclusive
                  onChange={(_, value) => value && updateConfig("type", value)}
                  size="small"
                  fullWidth
                  sx={{ flexWrap: "wrap", gap: 0.5 }}
                >
                  {PATTERN_TYPES.map((type) => (
                    <ToggleButton key={type.value} value={type.value} sx={{ flex: "0 0 calc(50% - 4px)" }}>
                      {type.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Colors */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Colors
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField
                      label="Foreground"
                      value={config.foreground}
                      onChange={(e) => updateConfig("foreground", e.target.value)}
                      size="small"
                      type="color"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Background"
                      value={config.background}
                      onChange={(e) => updateConfig("background", e.target.value)}
                      size="small"
                      type="color"
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Size */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Size: {config.size}px
                </Typography>
                <Slider
                  value={config.size}
                  onChange={(_, v) => updateConfig("size", v as number)}
                  min={5}
                  max={100}
                  size="small"
                />
              </Box>

              {/* Opacity */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Opacity: {config.opacity}
                </Typography>
                <Slider
                  value={config.opacity}
                  onChange={(_, v) => updateConfig("opacity", v as number)}
                  min={0}
                  max={1}
                  step={0.05}
                  size="small"
                />
              </Box>

              {/* Stroke Width */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Stroke Width: {config.strokeWidth}px
                </Typography>
                <Slider
                  value={config.strokeWidth}
                  onChange={(_, v) => updateConfig("strokeWidth", v as number)}
                  min={0.5}
                  max={5}
                  step={0.5}
                  size="small"
                />
              </Box>

              {/* Spacing */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Spacing: {config.spacing}px
                </Typography>
                <Slider
                  value={config.spacing}
                  onChange={(_, v) => updateConfig("spacing", v as number)}
                  min={0}
                  max={20}
                  size="small"
                />
              </Box>

              {/* Copy buttons */}
              <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
                <Button variant="contained" onClick={() => handleCopy(cssCode)} fullWidth>
                  Copy CSS
                </Button>
                <Button variant="outlined" onClick={() => handleCopy(cssGradientCode)} fullWidth>
                  Copy CSS Gradient
                </Button>
                <Button variant="outlined" onClick={() => handleCopy(svgDataURL)} fullWidth>
                  Copy Data URL
                </Button>
              </Box>
            </Paper>

            {/* Right: Preview */}
            <Paper elevation={2} sx={{ p: 3, width: '800px' }}>
              {/* Pattern preview */}
              <Box
                sx={{
                  minHeight: 400,
                  borderRadius: 2,
                  backgroundImage: `url("${svgDataURL}")`,
                  bgcolor: config.background,
                }}
              />

              {/* Code preview */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  CSS Code
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    fontFamily: "monospace",
                    fontSize: 11,
                    bgcolor: "action.hover",
                    whiteSpace: "pre-wrap",
                    overflow: "auto",
                    maxHeight: 150,
                  }}
                >
                  {cssCode}
                </Paper>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  CSS Gradient Alternative
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    fontFamily: "monospace",
                    fontSize: 11,
                    bgcolor: "action.hover",
                    whiteSpace: "pre-wrap",
                    overflow: "auto",
                    maxHeight: 150,
                  }}
                >
                  {cssGradientCode}
                </Paper>
              </Box>
            </Paper>
          </Box>
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
