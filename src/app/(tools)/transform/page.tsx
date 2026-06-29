/**
 * Transform Editor Page
 * Visual 2D/3D transform editor
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
  ToggleButtonGroup,
  ToggleButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { TransformPreview } from "./components/TransformPreview";
import { TransformExportDialog } from "./components/TransformExportDialog";
import { TRANSFORM_PRESETS, getPresetByName } from "./presets";
import type { TransformValues, TransformMode } from "./types";
import { generateCSS, is3DTransform } from "./utils";

const DEFAULT_VALUES: TransformValues = {
  translateX: 0,
  translateY: 0,
  translateZ: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  skewX: 0,
  skewY: 0,
  perspective: 0,
};

export default function TransformEditorPage() {
  const [values, setValues] = useState<TransformValues>(DEFAULT_VALUES);
  const [mode, setMode] = useState<TransformMode>("2d");
  const [previewType, setPreviewType] = useState<"box" | "text" | "cube">("box");
  const [backgroundColor, setBackgroundColor] = useState("#6366f1");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const updateValue = <K extends keyof TransformValues>(key: K, value: TransformValues[K]) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePresetApply = (presetName: string) => {
    const preset = getPresetByName(presetName);
    if (preset) {
      setValues({ ...DEFAULT_VALUES, ...preset.values });
      if (is3DTransform(preset.values)) {
        setMode("3d");
        setPreviewType("cube");
      }
    }
  };

  const handleReset = () => {
    setValues(DEFAULT_VALUES);
    setMode("2d");
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
              CSS Transform Editor
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create 2D and 3D transformations with visual preview
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
              {/* Mode selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Transform Mode
                </Typography>
                <ToggleButtonGroup
                  value={mode}
                  exclusive
                  onChange={(_, newMode) => newMode && setMode(newMode)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="2d">2D</ToggleButton>
                  <ToggleButton value="3d">3D</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Preview type */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preview Type
                </Typography>
                <ToggleButtonGroup
                  value={previewType}
                  exclusive
                  onChange={(_, newValue) => newValue && setPreviewType(newValue)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="box">Box</ToggleButton>
                  <ToggleButton value="text">Text</ToggleButton>
                  <ToggleButton value="cube">Cube</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Presets */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Presets
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {TRANSFORM_PRESETS.map((preset) => (
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

              {/* Translate */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle2">Translate</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        X: {values.translateX}px
                      </Typography>
                      <Slider
                        value={values.translateX}
                        onChange={(_, v) => updateValue("translateX", v as number)}
                        min={-200}
                        max={200}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Y: {values.translateY}px
                      </Typography>
                      <Slider
                        value={values.translateY}
                        onChange={(_, v) => updateValue("translateY", v as number)}
                        min={-200}
                        max={200}
                        size="small"
                      />
                    </Box>
                    {mode === "3d" && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Z: {values.translateZ}px
                        </Typography>
                        <Slider
                          value={values.translateZ}
                          onChange={(_, v) => updateValue("translateZ", v as number)}
                          min={-200}
                          max={200}
                          size="small"
                        />
                      </Box>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Rotate */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle2">Rotate</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {mode === "3d" && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          X: {values.rotateX}°
                        </Typography>
                        <Slider
                          value={values.rotateX}
                          onChange={(_, v) => updateValue("rotateX", v as number)}
                          min={-180}
                          max={180}
                          size="small"
                        />
                      </Box>
                    )}
                    {mode === "3d" && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Y: {values.rotateY}°
                        </Typography>
                        <Slider
                          value={values.rotateY}
                          onChange={(_, v) => updateValue("rotateY", v as number)}
                          min={-180}
                          max={180}
                          size="small"
                        />
                      </Box>
                    )}
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Z: {values.rotateZ}°
                      </Typography>
                      <Slider
                        value={values.rotateZ}
                        onChange={(_, v) => updateValue("rotateZ", v as number)}
                        min={-180}
                        max={180}
                        size="small"
                      />
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Scale */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle2">Scale</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        X: {values.scaleX}
                      </Typography>
                      <Slider
                        value={values.scaleX}
                        onChange={(_, v) => updateValue("scaleX", v as number)}
                        min={0}
                        max={3}
                        step={0.1}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Y: {values.scaleY}
                      </Typography>
                      <Slider
                        value={values.scaleY}
                        onChange={(_, v) => updateValue("scaleY", v as number)}
                        min={0}
                        max={3}
                        step={0.1}
                        size="small"
                      />
                    </Box>
                    {mode === "3d" && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Z: {values.scaleZ}
                        </Typography>
                        <Slider
                          value={values.scaleZ}
                          onChange={(_, v) => updateValue("scaleZ", v as number)}
                          min={0}
                          max={3}
                          step={0.1}
                          size="small"
                        />
                      </Box>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Skew */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle2">Skew</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        X: {values.skewX}°
                      </Typography>
                      <Slider
                        value={values.skewX}
                        onChange={(_, v) => updateValue("skewX", v as number)}
                        min={-45}
                        max={45}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Y: {values.skewY}°
                      </Typography>
                      <Slider
                        value={values.skewY}
                        onChange={(_, v) => updateValue("skewY", v as number)}
                        min={-45}
                        max={45}
                        size="small"
                      />
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Perspective (3D only) */}
              {mode === "3d" && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2">Perspective</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Distance: {values.perspective}px
                      </Typography>
                      <Slider
                        value={values.perspective}
                        onChange={(_, v) => updateValue("perspective", v as number)}
                        min={0}
                        max={2000}
                        size="small"
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Preview color */}
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Preview Color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  size="small"
                  type="color"
                  fullWidth
                />
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
              <TransformPreview
                values={values}
                previewType={previewType}
                backgroundColor={backgroundColor}
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
                  }}
                >
                  {generateCSS(values, mode)}
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
                Use 3D mode with perspective for realistic depth effects
              </Typography>
              <Typography component="li" variant="caption">
                Combine multiple transforms for complex animations
              </Typography>
              <Typography component="li" variant="caption">
                Negative scale values create mirror effects
              </Typography>
              <Typography component="li" variant="caption">
                Cube preview best shows 3D transformations
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      {/* Export dialog */}
      <TransformExportDialog
        open={exportDialogOpen}
        values={values}
        mode={mode}
        onClose={() => setExportDialogOpen(false)}
      />
    </Box>
  );
}
