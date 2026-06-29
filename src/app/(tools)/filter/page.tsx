/**
 * CSS Filter Generator Page
 * Create Instagram-like filter effects
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
  Grid,
  Switch,
  FormControlLabel,
  TextField,
} from "@mui/material";
import { FilterPreview } from "./components/FilterPreview";
import { FilterExportDialog } from "./components/FilterExportDialog";
import { FILTER_PRESETS, getPresetByName } from "./presets";
import type { FilterValues } from "./types";
import { generateCSS } from "./utils";

const DEFAULT_VALUES: FilterValues = {
  blur: 0,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
  invert: 0,
  opacity: 100,
  dropShadow: {
    enabled: false,
    x: 0,
    y: 4,
    blur: 8,
    color: "rgba(0,0,0,0.25)",
  },
};

export default function FilterGeneratorPage() {
  const [values, setValues] = useState<FilterValues>(DEFAULT_VALUES);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const updateValue = <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePresetApply = (presetName: string) => {
    const preset = getPresetByName(presetName);
    if (preset) {
      setValues({
        ...DEFAULT_VALUES,
        ...preset.values,
        dropShadow: {
          ...DEFAULT_VALUES.dropShadow,
          ...(preset.values.dropShadow || {}),
        },
      });
    }
  };

  const handleReset = () => {
    setValues(DEFAULT_VALUES);
  };

  const sliders = [
    { key: "blur", label: "Blur", min: 0, max: 20, step: 1, unit: "px" },
    { key: "brightness", label: "Brightness", min: 0, max: 200, step: 5, unit: "%" },
    { key: "contrast", label: "Contrast", min: 0, max: 200, step: 5, unit: "%" },
    { key: "saturate", label: "Saturate", min: 0, max: 200, step: 5, unit: "%" },
    { key: "grayscale", label: "Grayscale", min: 0, max: 100, step: 5, unit: "%" },
    { key: "sepia", label: "Sepia", min: 0, max: 100, step: 5, unit: "%" },
    { key: "hueRotate", label: "Hue Rotate", min: 0, max: 360, step: 15, unit: "°" },
    { key: "invert", label: "Invert", min: 0, max: 100, step: 5, unit: "%" },
    { key: "opacity", label: "Opacity", min: 0, max: 100, step: 5, unit: "%" },
  ] as const;

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
              CSS Filter Generator
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create Instagram-like filter effects for images and elements
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
                  Presets
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {FILTER_PRESETS.slice(0, 10).map((preset) => (
                    <Chip
                      key={preset.name}
                      label={preset.name}
                      onClick={() => handlePresetApply(preset.name)}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Filter sliders */}
              <Box sx={{ flex: 1, overflow: "auto" }}>
                <Grid container spacing={2}>
                  {sliders.map(({ key, label, min, max, step, unit }) => {
                    const value = values[key] as number;
                    return (
                      <Grid size={12} key={key}>
                        <Typography variant="caption" color="text.secondary">
                          {label}: {value}
                          {unit}
                        </Typography>
                        <Slider
                          value={value}
                          onChange={(_, v) => updateValue(key, v as number)}
                          min={min}
                          max={max}
                          step={step}
                          size="small"
                        />
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Drop Shadow */}
                <Divider sx={{ my: 2 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.dropShadow.enabled}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          dropShadow: { ...prev.dropShadow, enabled: e.target.checked },
                        }))
                      }
                    />
                  }
                  label="Drop Shadow"
                />

                {values.dropShadow.enabled && (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={6}>
                      <Typography variant="caption">X: {values.dropShadow.x}px</Typography>
                      <Slider
                        value={values.dropShadow.x}
                        onChange={(_, v) =>
                          setValues((prev) => ({
                            ...prev,
                            dropShadow: { ...prev.dropShadow, x: v as number },
                          }))
                        }
                        min={-50}
                        max={50}
                        size="small"
                      />
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="caption">Y: {values.dropShadow.y}px</Typography>
                      <Slider
                        value={values.dropShadow.y}
                        onChange={(_, v) =>
                          setValues((prev) => ({
                            ...prev,
                            dropShadow: { ...prev.dropShadow, y: v as number },
                          }))
                        }
                        min={-50}
                        max={50}
                        size="small"
                      />
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="caption">Blur: {values.dropShadow.blur}px</Typography>
                      <Slider
                        value={values.dropShadow.blur}
                        onChange={(_, v) =>
                          setValues((prev) => ({
                            ...prev,
                            dropShadow: { ...prev.dropShadow, blur: v as number },
                          }))
                        }
                        min={0}
                        max={50}
                        size="small"
                      />
                    </Grid>
                    <Grid size={6}>
                      <TextField
                        label="Color"
                        value={values.dropShadow.color}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            dropShadow: { ...prev.dropShadow, color: e.target.value },
                          }))
                        }
                        size="small"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                )}
              </Box>

              {/* Action buttons */}
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button variant="outlined" onClick={handleReset} sx={{ flex: 1 }}>
                  Reset
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setExportDialogOpen(true)}
                  sx={{ flex: 1 }}
                >
                  Export
                </Button>
              </Box>
            </Paper>

            {/* Right: Preview */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <FilterPreview values={values} />

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
                  }}
                >
                  {generateCSS(values) || "/* No filter applied */"}
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
                Combine multiple filters for unique effects
              </Typography>
              <Typography component="li" variant="caption">
                Use grayscale + sepia for vintage photo effects
              </Typography>
              <Typography component="li" variant="caption">
                Hue rotate can create dramatic color shifts
              </Typography>
              <Typography component="li" variant="caption">
                Filters work on images, backgrounds, and any visual element
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      {/* Export dialog */}
      <FilterExportDialog
        open={exportDialogOpen}
        values={values}
        onClose={() => setExportDialogOpen(false)}
      />
    </Box>
  );
}
