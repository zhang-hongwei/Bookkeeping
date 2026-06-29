/**
 * MUI Button Theme Designer
 * Customize MuiButton design tokens and export theme configuration
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { ButtonPreview } from "./components/ButtonPreview";
import { ButtonExportDialog } from "./components/ButtonExportDialog";
import { BUTTON_THEME_PRESETS, getPresetByName } from "./presets";
import { MUI_DEFAULTS } from "./types";
import type { ButtonThemeConfig, TextTransform, SizeTokens } from "./types";
import { generateCreateTheme } from "./utils";

export default function MuiButtonThemeDesignerPage() {
  const [config, setConfig] = useState<ButtonThemeConfig>(() => ({
    root: { ...MUI_DEFAULTS.root },
    small: { ...MUI_DEFAULTS.small },
    medium: { ...MUI_DEFAULTS.medium },
    large: { ...MUI_DEFAULTS.large },
    elevation: { ...MUI_DEFAULTS.elevation },
  }));
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const updateRoot = <K extends keyof ButtonThemeConfig["root"]>(key: K, value: ButtonThemeConfig["root"][K]) => {
    setConfig((prev) => ({ ...prev, root: { ...prev.root, [key]: value } }));
  };

  const updateSize = (size: "small" | "medium" | "large", updates: Partial<SizeTokens>) => {
    setConfig((prev) => ({ ...prev, [size]: { ...prev[size], ...updates } }));
  };

  const updateElevation = <K extends keyof ButtonThemeConfig["elevation"]>(key: K, value: ButtonThemeConfig["elevation"][K]) => {
    setConfig((prev) => ({ ...prev, elevation: { ...prev.elevation, [key]: value } }));
  };

  const handlePresetApply = (name: string) => {
    const preset = getPresetByName(name);
    if (preset) {
      setConfig({
        root: { ...preset.config.root },
        small: { ...preset.config.small },
        medium: { ...preset.config.medium },
        large: { ...preset.config.large },
        elevation: { ...preset.config.elevation },
      });
    }
  };

  const handleReset = () => {
    setConfig({
      root: { ...MUI_DEFAULTS.root },
      small: { ...MUI_DEFAULTS.small },
      medium: { ...MUI_DEFAULTS.medium },
      large: { ...MUI_DEFAULTS.large },
      elevation: { ...MUI_DEFAULTS.elevation },
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              MUI Button Theme Designer
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Customize MuiButton design tokens — padding, fontSize, borderRadius per size — and export createTheme configuration
            </Typography>
          </Box>

          <Divider />

          {/* Two-column: Controls | Preview + Code */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "380px 1fr" },
              gap: 3,
              alignItems: "start",
            }}
          >
            {/* Left: Controls */}
            <Paper
              elevation={2}
              sx={{
                p: 2,
                height: { xs: "auto", lg: "calc(100vh - 200px)" },
                display: "flex",
                flexDirection: "column",
                position: { xs: "relative", lg: "sticky" },
                top: { xs: 0, lg: 24 },
                overflow: "auto",
              }}
            >
              {/* Presets */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Presets
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {BUTTON_THEME_PRESETS.map((preset) => (
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

              <Divider sx={{ my: 1.5 }} />

              {/* Root tokens */}
              <Accordion defaultExpanded disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
                  <Typography variant="subtitle2">Root Styles</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Border Radius: {config.root.borderRadius}px
                      </Typography>
                      <Slider
                        value={config.root.borderRadius}
                        onChange={(_, v) => updateRoot("borderRadius", v as number)}
                        min={0} max={50} valueLabelDisplay="auto" size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Text Transform</Typography>
                      <ToggleButtonGroup
                        value={config.root.textTransform}
                        exclusive
                        onChange={(_, v) => v && updateRoot("textTransform", v as TextTransform)}
                        size="small" fullWidth
                      >
                        <ToggleButton value="none">none</ToggleButton>
                        <ToggleButton value="uppercase">AA</ToggleButton>
                        <ToggleButton value="capitalize">Aa</ToggleButton>
                        <ToggleButton value="lowercase">aa</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Font Weight: {config.root.fontWeight}
                      </Typography>
                      <Slider
                        value={config.root.fontWeight}
                        onChange={(_, v) => updateRoot("fontWeight", v as number)}
                        min={300} max={900} step={100} valueLabelDisplay="auto" size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Min Width: {config.root.minWidth}px
                      </Typography>
                      <Slider
                        value={config.root.minWidth}
                        onChange={(_, v) => updateRoot("minWidth", v as number)}
                        min={0} max={160} valueLabelDisplay="auto" size="small"
                      />
                    </Box>
                    <TextField
                      label="Letter Spacing"
                      value={config.root.letterSpacing}
                      onChange={(e) => updateRoot("letterSpacing", e.target.value)}
                      size="small" fullWidth
                      placeholder="e.g. 0.02em"
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Size: Small */}
              <Accordion disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
                  <Typography variant="subtitle2">Size: Small</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0 }}>
                  <SizeEditor size={config.small} onChange={(u) => updateSize("small", u)} />
                </AccordionDetails>
              </Accordion>

              {/* Size: Medium */}
              <Accordion disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
                  <Typography variant="subtitle2">Size: Medium</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0 }}>
                  <SizeEditor size={config.medium} onChange={(u) => updateSize("medium", u)} />
                </AccordionDetails>
              </Accordion>

              {/* Size: Large */}
              <Accordion disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
                  <Typography variant="subtitle2">Size: Large</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0 }}>
                  <SizeEditor size={config.large} onChange={(u) => updateSize("large", u)} />
                </AccordionDetails>
              </Accordion>

              {/* Elevation */}
              <Accordion disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
                  <Typography variant="subtitle2">Elevation (Contained)</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0 }}>
                  <Stack spacing={2}>
                    <TextField
                      label="Box Shadow"
                      value={config.elevation.boxShadow}
                      onChange={(e) => updateElevation("boxShadow", e.target.value)}
                      size="small" fullWidth
                    />
                    <TextField
                      label="Hover Box Shadow"
                      value={config.elevation.hoverBoxShadow}
                      onChange={(e) => updateElevation("hoverBoxShadow", e.target.value)}
                      size="small" fullWidth
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Actions */}
              <Box sx={{ mt: "auto", display: "flex", gap: 1, pt: 2 }}>
                <Button variant="contained" fullWidth onClick={() => setExportDialogOpen(true)}>
                  Export Theme
                </Button>
                <Button variant="outlined" onClick={handleReset}>
                  Reset
                </Button>
              </Box>
            </Paper>

            {/* Right: Preview + Code */}
            <Stack spacing={3}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Live Preview
                </Typography>
                <ButtonPreview config={config} />
              </Paper>

              {/* Generated code */}
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Generated createTheme
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
                    maxHeight: 400,
                  }}
                >
                  {generateCreateTheme(config)}
                </Paper>
              </Paper>
            </Stack>
          </Box>

          {/* Tips */}
          <Paper variant="outlined" sx={{ p: 2, backgroundColor: "info.light", color: "info.contrastText" }}>
            <Typography variant="body2" gutterBottom fontWeight="bold">
              Tips:
            </Typography>
            <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
              <Typography component="li" variant="caption">
                Override <code>textTransform: &apos;none&apos;</code> is the most common Button customization
              </Typography>
              <Typography component="li" variant="caption">
                Padding values use CSS shorthand — e.g. &quot;6px 16px&quot; means vertical horizontal
              </Typography>
              <Typography component="li" variant="caption">
                Use &quot;Export Theme&quot; to get the full <code>createTheme()</code> code with only changed values
              </Typography>
              <Typography component="li" variant="caption">
                The preview uses a nested ThemeProvider — your app theme palette is preserved
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      <ButtonExportDialog open={exportDialogOpen} config={config} onClose={() => setExportDialogOpen(false)} />
    </Box>
  );
}

// ─── Size Token Editor ───────────────────────────────────────────────

interface SizeEditorProps {
  size: SizeTokens;
  onChange: (updates: Partial<SizeTokens>) => void;
}

function SizeEditor({ size, onChange }: SizeEditorProps) {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Font Size: {size.fontSize}
        </Typography>
        <Slider
          value={parseFloat(size.fontSize)}
          onChange={(_, v) => onChange({ fontSize: `${(v as number).toFixed(4)}rem` })}
          min={0.625} max={1.5} step={0.0625} valueLabelDisplay="auto" size="small"
          valueLabelFormat={(v) => `${v}rem`}
        />
      </Box>
      <TextField
        label="Contained Padding"
        value={size.containedPadding}
        onChange={(e) => onChange({ containedPadding: e.target.value })}
        size="small" fullWidth placeholder="e.g. 6px 16px"
      />
      <TextField
        label="Outlined Padding"
        value={size.outlinedPadding}
        onChange={(e) => onChange({ outlinedPadding: e.target.value })}
        size="small" fullWidth placeholder="e.g. 5px 15px"
      />
      <TextField
        label="Text Padding"
        value={size.textPadding}
        onChange={(e) => onChange({ textPadding: e.target.value })}
        size="small" fullWidth placeholder="e.g. 6px 8px"
      />
      <Box>
        <Typography variant="caption" color="text.secondary">
          Icon Size: {size.iconSize}px
        </Typography>
        <Slider
          value={size.iconSize}
          onChange={(_, v) => onChange({ iconSize: v as number })}
          min={12} max={32} valueLabelDisplay="auto" size="small"
        />
      </Box>
    </Stack>
  );
}
