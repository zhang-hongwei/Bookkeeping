/**
 * Border Radius Editor Page
 * Visual border radius editor with real-time preview
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
  TextField,
  Button,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Lock as LockIcon, LockOpen as LockOpenIcon } from "@mui/icons-material";
import { BorderRadiusPreview } from "./components/BorderRadiusPreview";
import { BorderRadiusExportDialog } from "./components/BorderRadiusExportDialog";
import { BORDER_RADIUS_PRESETS, getPresetByName } from "./presets";
import type { BorderRadiusValues, BorderUnit } from "./types";
import { generateBorderRadiusCSS } from "./utils";

export default function BorderRadiusEditorPage() {
  const [values, setValues] = useState<BorderRadiusValues>({
    topLeft: 16,
    topRight: 16,
    bottomRight: 16,
    bottomLeft: 16,
  });
  const [unit, setUnit] = useState<BorderUnit>("px");
  const [locked, setLocked] = useState(true);
  const [size, setSize] = useState(200);
  const [backgroundColor, setBackgroundColor] = useState("#6366f1");
  const [borderColor, setBorderColor] = useState("#4f46e5");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleValueChange = (corner: keyof BorderRadiusValues, newValue: number) => {
    if (locked) {
      setValues({
        topLeft: newValue,
        topRight: newValue,
        bottomRight: newValue,
        bottomLeft: newValue,
      });
    } else {
      setValues((prev) => ({
        ...prev,
        [corner]: newValue,
      }));
    }
  };

  const handlePresetApply = (presetName: string) => {
    const preset = getPresetByName(presetName);
    if (preset) {
      setValues(preset.values);
      if (preset.name === "Circle" || preset.name === "Blob Shape") {
        setUnit("%");
      } else if (preset.name === "Pill") {
        setUnit("px");
      }
    }
  };

  const handleUnitChange = (_: React.MouseEvent<HTMLElement>, newUnit: BorderUnit | null) => {
    if (newUnit) {
      setUnit(newUnit);
    }
  };

  const handleLockToggle = () => {
    setLocked((prev) => !prev);
  };

  const maxSliderValue = unit === "%" ? 50 : 200;

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
              Border Radius Editor
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and customize border radius with real-time preview
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
                  <ToggleButton value="%">%</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Lock toggle */}
              <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="subtitle2">Link corners</Typography>
                <Tooltip title={locked ? "Unlock to edit corners independently" : "Lock all corners together"}>
                  <IconButton onClick={handleLockToggle} size="small">
                    {locked ? <LockIcon color="primary" /> : <LockOpenIcon />}
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Corner sliders */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Corner Radius
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(values).map(([corner, value]) => (
                    <Grid size={locked ? 12 : 6} key={corner}>
                      <Box sx={{ mb: locked && corner !== "topLeft" ? 0 : 2 }}>
                        {(!locked || corner === "topLeft") && (
                          <>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                              {corner.replace(/([A-Z])/g, " $1").trim()}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Slider
                                value={value}
                                onChange={(_, newValue) =>
                                  handleValueChange(corner as keyof BorderRadiusValues, newValue as number)
                                }
                                min={0}
                                max={maxSliderValue}
                                size="small"
                              />
                              <TextField
                                value={value}
                                onChange={(e) =>
                                  handleValueChange(
                                    corner as keyof BorderRadiusValues,
                                    Math.min(maxSliderValue, Math.max(0, Number(e.target.value)))
                                  )
                                }
                                type="number"
                                size="small"
                                sx={{ width: 70 }}
                                slotProps={{
                                  input: {
                                    style: { padding: "4px 8px", fontSize: 14 },
                                  },
                                }}
                              />
                            </Box>
                          </>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Preview customization */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preview Settings
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Size: {size}px
                  </Typography>
                  <Slider
                    value={size}
                    onChange={(_, newValue) => setSize(newValue as number)}
                    min={50}
                    max={400}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <TextField
                    label="Background"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    size="small"
                    type="color"
                    sx={{ width: 120 }}
                  />
                  <TextField
                    label="Border"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    size="small"
                    type="color"
                    sx={{ width: 120 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Presets */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Presets
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {BORDER_RADIUS_PRESETS.map((preset) => (
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
            <Paper elevation={2} sx={{ p: 3 }}>
              <BorderRadiusPreview
                values={values}
                unit={unit}
                size={size}
                backgroundColor={backgroundColor}
                borderColor={borderColor}
              />

              {/* Live CSS preview */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Live CSS
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
                  border-radius: {generateBorderRadiusCSS(values, unit)};
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
                Use % unit with 50% value to create perfect circles (with square elements)
              </Typography>
              <Typography component="li" variant="caption">
                Lock corners to adjust all at once, unlock for independent control
              </Typography>
              <Typography component="li" variant="caption">
                Try presets for common border radius patterns
              </Typography>
              <Typography component="li" variant="caption">
                Export to CSS, MUI, Tailwind, or JSON format
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      {/* Export dialog */}
      <BorderRadiusExportDialog
        open={exportDialogOpen}
        values={values}
        unit={unit}
        onClose={() => setExportDialogOpen(false)}
      />
    </Box>
  );
}
