/**
 * MUI Slider Theme Designer
 * Customize MuiSlider design tokens and export theme configuration
 */

"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { SliderPreview } from "./components/SliderPreview";
import { SliderExportDialog } from "./components/SliderExportDialog";
import { SliderControls } from "./components/SliderControls";
import { SLIDER_THEME_PRESETS } from "./presets";
import { MUI_DEFAULTS } from "./types";
import type { SliderThemeConfig } from "./types";
import { generateCreateTheme, createSliderTheme } from "./utils";

export default function MuiSliderThemeDesignerPage() {
  const [config, setConfig] = useState<SliderThemeConfig>(() => ({
    root: { ...MUI_DEFAULTS.root },
    rail: { ...MUI_DEFAULTS.rail },
    track: { ...MUI_DEFAULTS.track },
    thumb: { ...MUI_DEFAULTS.thumb },
    mark: { ...MUI_DEFAULTS.mark },
    valueLabel: { ...MUI_DEFAULTS.valueLabel },
    size: { ...MUI_DEFAULTS.size },
    exportVariant: "medium",
    showMarks: true,
    showValueLabel: true,
    orientation: "horizontal",
  }));
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleReset = () => {
    setConfig({
      root: { ...MUI_DEFAULTS.root },
      rail: { ...MUI_DEFAULTS.rail },
      track: { ...MUI_DEFAULTS.track },
      thumb: { ...MUI_DEFAULTS.thumb },
      mark: { ...MUI_DEFAULTS.mark },
      valueLabel: { ...MUI_DEFAULTS.valueLabel },
      size: { ...MUI_DEFAULTS.size },
      exportVariant: "medium",
      showMarks: true,
      showValueLabel: true,
      orientation: "horizontal",
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              MUI Slider Theme Designer
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Customize MuiSlider design tokens — rail, track, thumb, marks, value label — and
              export createTheme configuration
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
              <SliderControls
                config={config}
                onUpdate={setConfig}
                onReset={handleReset}
                onExport={() => setExportDialogOpen(true)}
                presets={SLIDER_THEME_PRESETS}
              />
            </Paper>

            {/* Right: Preview + Code */}
            <Stack spacing={3}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Live Preview
                </Typography>
                <ThemeProvider theme={createSliderTheme(config)}>
                  <SliderPreview
                    showMarks={config.showMarks}
                    showValueLabel={config.showValueLabel}
                    orientation={config.orientation}
                  />
                </ThemeProvider>
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
        </Stack>
      </Container>

      <SliderExportDialog open={exportDialogOpen} config={config} onClose={() => setExportDialogOpen(false)} />
    </Box>
  );
}
