/**
 * Color Harmonies Page
 * Generate harmonious color schemes based on color theory
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
  Grid,
} from "@mui/material";
import { ColorWheel } from "./components/ColorWheel";
import { HarmonyTypeSelector } from "./components/HarmonyTypeSelector";
import { HarmonyControlPanel } from "./components/HarmonyControlPanel";
import { HarmonyExportDialog } from "./components/HarmonyExportDialog";
import { generateHarmony, getHarmonyInfo } from "./utils";
import type { HarmonyType, HarmonyResult } from "./types";

export default function ColorHarmoniesPage() {
  const [baseColor, setBaseColor] = useState("#6366f1");
  const [harmonyType, setHarmonyType] = useState<HarmonyType>("complementary");
  const [saturation, setSaturation] = useState(70);
  const [lightness, setLightness] = useState(50);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Generate harmony result
  const result = useMemo<HarmonyResult>(() => {
    return generateHarmony(baseColor, harmonyType, saturation / 100, lightness / 100);
  }, [baseColor, harmonyType, saturation, lightness]);

  const harmonyInfo = getHarmonyInfo(harmonyType);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Page header */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Color Harmonies
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Generate harmonious color schemes based on color theory
            </Typography>
          </Box>

          <Divider />

          {/* Main editing area - 3 columns */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "280px 1fr 320px",
              },
              gap: 3,
              alignItems: "start",
            }}
          >
            {/* Left: Harmony Type selector (presets) */}
            <HarmonyTypeSelector
              value={harmonyType}
              onChange={setHarmonyType}
            />

            {/* Middle: Color wheel + Generated colors (preview) */}
            <Stack spacing={3}>
              <ColorWheel result={result} size={320} />

              {/* Generated colors */}
              <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Generated Colors ({harmonyInfo?.colorCount} colors)
                </Typography>
                <Grid container spacing={1}>
                  {result.colors.map((color, i) => (
                    <Grid key={`${color}-${i}`} size={{ xs: 6, sm: 4, md: 3 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor: "action.hover",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                          "&:hover": {
                            bgcolor: "action.selected",
                          },
                        }}
                        onClick={() => navigator.clipboard.writeText(color)}
                      >
                        <Box
                          sx={{
                            height: 40,
                            borderRadius: 0.5,
                            bgcolor: color,
                            mb: 0.5,
                          }}
                        />
                        <Typography variant="caption" display="block" fontWeight="medium">
                          {result.labels[i]}
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: 11 }}>
                          {color.toUpperCase()}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Stack>

            {/* Right: Editable controls */}
            <HarmonyControlPanel
              baseColor={baseColor}
              saturation={saturation}
              lightness={lightness}
              onBaseColorChange={setBaseColor}
              onSaturationChange={setSaturation}
              onLightnessChange={setLightness}
              onExport={() => setExportDialogOpen(true)}
            />
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
                Complementary colors create high contrast - great for CTAs and highlights
              </Typography>
              <Typography component="li" variant="caption">
                Analogous colors create harmony - perfect for backgrounds and gradients
              </Typography>
              <Typography component="li" variant="caption">
                Triadic colors are vibrant and balanced - ideal for illustrations
              </Typography>
              <Typography component="li" variant="caption">
                Click any color swatch to copy the hex code to clipboard
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      {/* Export dialog */}
      <HarmonyExportDialog
        open={exportDialogOpen}
        result={result}
        onClose={() => setExportDialogOpen(false)}
      />
    </Box>
  );
}
