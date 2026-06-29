/**
 * MUI Switch Theme Designer
 * Customize MuiSwitch design tokens and export theme configuration
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
import { SwitchPreview } from "./components/SwitchPreview";
import { SwitchExportDialog } from "./components/SwitchExportDialog";
import { SwitchControls } from "./components/SwitchControls";
import { SWITCH_THEME_PRESETS } from "./presets";
import { MUI_DEFAULTS } from "./types";
import type { SwitchThemeConfig } from "./types";
import { generateCreateTheme, createSwitchTheme } from "./utils";

export default function MuiSwitchThemeDesignerPage() {
  const [config, setConfig] = useState<SwitchThemeConfig>(() => ({
    root: {
      ...MUI_DEFAULTS.root,
      width: 60,
      height: 34,
      padding: 7,
      switchBasePadding: 9,
      translateX: 26,
    },
    thumb: { ...MUI_DEFAULTS.thumb },
    track: { ...MUI_DEFAULTS.track },
    trackChecked: { ...MUI_DEFAULTS.trackChecked },
    size: { ...MUI_DEFAULTS.size },
    exportVariant: 'medium',
  }));
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleReset = () => {
    setConfig({
      root: {
        ...MUI_DEFAULTS.root,
        width: 50,
        height: 28,
        padding: 7,
        switchBasePadding: 9,
        translateX: 16,
      },
      thumb: { ...MUI_DEFAULTS.thumb },
      track: { ...MUI_DEFAULTS.track },
      trackChecked: { ...MUI_DEFAULTS.trackChecked },
      size: { ...MUI_DEFAULTS.size },
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              MUI Switch Theme Designer
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Customize MuiSwitch design tokens — thumb size, track dimensions, colors, spacing — and
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
              <SwitchControls
                config={config}
                onUpdate={setConfig}
                onReset={handleReset}
                onExport={() => setExportDialogOpen(true)}
                presets={SWITCH_THEME_PRESETS}
              />
            </Paper>

            {/* Right: Preview + Code */}
            <Stack spacing={3}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Live Preview
                </Typography>
                <ThemeProvider theme={createSwitchTheme(config)}>
                  <SwitchPreview />
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

      <SwitchExportDialog open={exportDialogOpen} config={config} onClose={() => setExportDialogOpen(false)} />
    </Box>
  );
}
