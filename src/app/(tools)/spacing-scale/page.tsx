/**
 * Spacing Scale Generator Page
 * Generate spacing scales with different ratios
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
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
} from "@mui/material";
import { ScalePreview } from "./components/ScalePreview";
import { ScaleExportDialog } from "./components/ScaleExportDialog";
import { RATIO_TYPES, generateScale, getRatioInfo } from "./utils";
import { SPACING_PRESETS, getPresetByName } from "./presets";
import type { ScaleRatio, ScaleConfig, ScaleStep } from "./types";

export default function SpacingScalePage() {
  const [baseline, setBaseline] = useState(8);
  const [ratio, setRatio] = useState<ScaleRatio>("linear");
  const [steps, setSteps] = useState(10);
  const [unit, setUnit] = useState<"px" | "rem">("px");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const config: ScaleConfig = useMemo(
    () => ({
      baseline,
      ratio,
      steps,
      unit,
    }),
    [baseline, ratio, steps, unit]
  );

  const scale: ScaleStep[] = useMemo(() => {
    return generateScale(config);
  }, [config]);

  const handlePresetApply = (presetName: string) => {
    const preset = getPresetByName(presetName);
    if (preset) {
      setBaseline(preset.config.baseline);
      setRatio(preset.config.ratio);
      setSteps(preset.config.steps);
      setUnit(preset.config.unit);
    }
  };

  const handleRatioChange = (_: React.MouseEvent<HTMLElement>, newRatio: ScaleRatio | null) => {
    if (newRatio) {
      setRatio(newRatio);
    }
  };

  const handleUnitChange = (_: React.MouseEvent<HTMLElement>, newUnit: "px" | "rem" | null) => {
    if (newUnit) {
      setUnit(newUnit);
    }
  };

  const ratioInfo = getRatioInfo(ratio);

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
              Spacing Scale Generator
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Generate consistent spacing scales for your design system
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
              {/* Unit selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Unit
                </Typography>
                <ToggleButtonGroup
                  value={unit}
                  exclusive
                  onChange={handleUnitChange}
                  size="small"
                >
                  <ToggleButton value="px">px</ToggleButton>
                  <ToggleButton value="rem">rem</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Baseline */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Baseline: {baseline}px
                </Typography>
                <Slider
                  value={baseline}
                  onChange={(_, value) => setBaseline(value as number)}
                  min={2}
                  max={24}
                  step={2}
                  marks={[
                    { value: 4, label: "4" },
                    { value: 8, label: "8" },
                    { value: 16, label: "16" },
                  ]}
                  size="small"
                />
              </Box>

              {/* Ratio selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Scale Ratio
                </Typography>
                <ToggleButtonGroup
                  value={ratio}
                  exclusive
                  onChange={handleRatioChange}
                  orientation="vertical"
                  fullWidth
                  size="small"
                >
                  {RATIO_TYPES.map((r) => (
                    <ToggleButton
                      key={r.type}
                      value={r.type}
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                        py: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="body2">{r.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {r.description}
                        </Typography>
                      </Box>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              {/* Steps */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Number of Steps: {steps}
                </Typography>
                <Slider
                  value={steps}
                  onChange={(_, value) => setSteps(value as number)}
                  min={4}
                  max={16}
                  marks
                  step={1}
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Presets */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Presets
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {SPACING_PRESETS.map((preset) => (
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

              {/* Export button */}
              <Button
                variant="contained"
                fullWidth
                onClick={() => setExportDialogOpen(true)}
                sx={{ mt: "auto" }}
              >
                Export Code
              </Button>
            </Paper>

            {/* Right: Preview */}
            <Stack spacing={3}>
              <ScalePreview scale={scale} unit={unit} />

              {/* Scale table */}
              <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Scale Values
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                    gap: 1,
                  }}
                >
                  {scale.map((step) => (
                    <Box
                      key={step.index}
                      sx={{
                        p: 1,
                        bgcolor: "action.hover",
                        borderRadius: 1,
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        "&:hover": {
                          bgcolor: "action.selected",
                        },
                      }}
                      onClick={() => navigator.clipboard.writeText(`${step.px}px`)}
                    >
                      <Typography variant="caption" display="block" fontWeight="medium">
                        {step.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                        {unit === "px" ? `${step.px}px` : step.rem}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Stack>
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
                8px baseline is the most common choice for web design systems
              </Typography>
              <Typography component="li" variant="caption">
                Linear scales are simple and predictable - great for consistent spacing
              </Typography>
              <Typography component="li" variant="caption">
                Golden ratio creates more visual hierarchy - good for typography-related spacing
              </Typography>
              <Typography component="li" variant="caption">
                Use rem for better accessibility - scales with user's font size preference
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      {/* Export dialog */}
      <ScaleExportDialog
        open={exportDialogOpen}
        scale={scale}
        config={config}
        onClose={() => setExportDialogOpen(false)}
      />
    </Box>
  );
}
