/**
 * CSS Animation Generator Page
 * Create and customize CSS animations
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { AnimationPreview } from "./components/AnimationPreview";
import { AnimationExportDialog } from "./components/AnimationExportDialog";
import { ANIMATION_PRESETS, getPresetByName } from "./presets";
import type { AnimationConfig, KeyframeDefinition } from "./types";
import { generateKeyframes, generateAnimationShorthand } from "./utils";

const DEFAULT_CONFIG: AnimationConfig = {
  name: "fadeIn",
  duration: 0.5,
  timingFunction: "ease-out",
  delay: 0,
  iterationCount: 1,
  direction: "normal",
  fillMode: "forwards",
  playState: "running",
};

const DEFAULT_KEYFRAMES: KeyframeDefinition = {
  name: "fadeIn",
  type: "fadeIn",
  steps: [
    { offset: 0, properties: { opacity: "0" } },
    { offset: 100, properties: { opacity: "1" } },
  ],
};

export default function AnimationGeneratorPage() {
  const [config, setConfig] = useState<AnimationConfig>(DEFAULT_CONFIG);
  const [keyframes, setKeyframes] = useState<KeyframeDefinition>(DEFAULT_KEYFRAMES);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [previewElement, setPreviewElement] = useState<"box" | "text" | "icon">("box");
  const [previewColor, setPreviewColor] = useState("#6366f1");

  const updateConfig = <K extends keyof AnimationConfig>(key: K, value: AnimationConfig[K]) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePresetApply = (presetName: string) => {
    const preset = getPresetByName(presetName);
    if (preset) {
      setConfig(preset.config);
      setKeyframes(preset.keyframes);
    }
  };

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
              CSS Animation Generator
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create beautiful CSS animations with visual preview and code export
            </Typography>
          </Box>

          <Divider />

          {/* Main editing area */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "400px 1fr",
              },
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
              {/* Presets */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Animation Presets
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {ANIMATION_PRESETS.map((preset) => (
                    <Chip
                      key={preset.name}
                      label={preset.name}
                      onClick={() => handlePresetApply(preset.name)}
                      variant={config.name === preset.config.name ? "filled" : "outlined"}
                      color={config.name === preset.config.name ? "primary" : "default"}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Duration */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Duration: {config.duration}s
                </Typography>
                <Slider
                  value={config.duration}
                  onChange={(_, value) => updateConfig("duration", value as number)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  valueLabelDisplay="auto"
                />
              </Box>

              {/* Delay */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Delay: {config.delay}s
                </Typography>
                <Slider
                  value={config.delay}
                  onChange={(_, value) => updateConfig("delay", value as number)}
                  min={0}
                  max={5}
                  step={0.1}
                  valueLabelDisplay="auto"
                />
              </Box>

              {/* Timing Function */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Timing Function</InputLabel>
                  <Select
                    value={config.timingFunction}
                    label="Timing Function"
                    onChange={(e) => updateConfig("timingFunction", e.target.value as AnimationConfig["timingFunction"])}
                  >
                    <MenuItem value="linear">Linear</MenuItem>
                    <MenuItem value="ease">Ease</MenuItem>
                    <MenuItem value="ease-in">Ease In</MenuItem>
                    <MenuItem value="ease-out">Ease Out</MenuItem>
                    <MenuItem value="ease-in-out">Ease In Out</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Iteration Count */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Iteration Count
                </Typography>
                <ToggleButtonGroup
                  value={config.iterationCount}
                  exclusive
                  onChange={(_, value) => {
                    if (value !== null) {
                      updateConfig("iterationCount", value);
                    }
                  }}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value={1}>1</ToggleButton>
                  <ToggleButton value={2}>2</ToggleButton>
                  <ToggleButton value={3}>3</ToggleButton>
                  <ToggleButton value="infinite">∞</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Direction */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Direction</InputLabel>
                  <Select
                    value={config.direction}
                    label="Direction"
                    onChange={(e) => updateConfig("direction", e.target.value as AnimationConfig["direction"])}
                  >
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="reverse">Reverse</MenuItem>
                    <MenuItem value="alternate">Alternate</MenuItem>
                    <MenuItem value="alternate-reverse">Alternate Reverse</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Fill Mode */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fill Mode</InputLabel>
                  <Select
                    value={config.fillMode}
                    label="Fill Mode"
                    onChange={(e) => updateConfig("fillMode", e.target.value as AnimationConfig["fillMode"])}
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="forwards">Forwards</MenuItem>
                    <MenuItem value="backwards">Backwards</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Preview Settings */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preview Element
                </Typography>
                <ToggleButtonGroup
                  value={previewElement}
                  exclusive
                  onChange={(_, value) => {
                    if (value) setPreviewElement(value);
                  }}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="box">Box</ToggleButton>
                  <ToggleButton value="text">Text</ToggleButton>
                  <ToggleButton value="icon">Icon</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <TextField
                label="Preview Color"
                value={previewColor}
                onChange={(e) => setPreviewColor(e.target.value)}
                size="small"
                type="color"
                sx={{ mb: 3 }}
              />

              {/* Export button */}
              <Button
                variant="contained"
                fullWidth
                onClick={() => setExportDialogOpen(true)}
                sx={{ mt: "auto" }}
              >
                Export Animation
              </Button>
            </Paper>

            {/* Right: Preview */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <AnimationPreview
                keyframes={keyframes}
                config={config}
                previewElement={previewElement}
                previewColor={previewColor}
              />

              {/* Live CSS preview */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Generated CSS
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    fontFamily: "monospace",
                    fontSize: 12,
                    bgcolor: "action.hover",
                    whiteSpace: "pre-wrap",
                    overflow: "auto",
                    maxHeight: 200,
                  }}
                >
                  {generateKeyframes(keyframes)}
                </Paper>
              </Box>
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
                Use "Alternate" direction with infinite iterations for back-and-forth animations
              </Typography>
              <Typography component="li" variant="caption">
                "Fill Mode: Forwards" preserves the final animation state
              </Typography>
              <Typography component="li" variant="caption">
                Choose appropriate timing functions for natural motion (ease-out for entrances, ease-in for exits)
              </Typography>
              <Typography component="li" variant="caption">
                Export to CSS, Tailwind, SCSS, or JSON for different frameworks
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      {/* Export dialog */}
      <AnimationExportDialog
        open={exportDialogOpen}
        keyframes={keyframes}
        config={config}
        onClose={() => setExportDialogOpen(false)}
      />
    </Box>
  );
}
