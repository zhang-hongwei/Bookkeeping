/**
 * MUI ToggleButton Theme Designer
 * Visual editor for MUI ToggleButton/ToggleButtonGroup theme customization
 */

"use client";

import React, { useState, useCallback } from "react";
import { Container, Box, Stack, Typography, Paper } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { ToggleButtonControls } from "./components/ToggleButtonControls";
import { ToggleButtonPreview } from "./components/ToggleButtonPreview";
import { ToggleButtonExportDialog } from "./components/ToggleButtonExportDialog";
import { TOGGLEBUTTON_THEME_PRESETS } from "./presets";
import { createToggleButtonTheme } from "./utils";
import { MUI_DEFAULTS } from "./types";

export default function MuiToggleButtonPage() {
  const [config, setConfig] = useState(MUI_DEFAULTS);
  const [exportOpen, setExportOpen] = useState(false);

  const handleUpdate = useCallback((newConfig: typeof config) => {
    setConfig(newConfig);
  }, []);

  const handleReset = useCallback(() => {
    setConfig(MUI_DEFAULTS);
  }, []);

  const handleExport = useCallback(() => {
    setExportOpen(true);
  }, []);

  const handleCloseExport = useCallback(() => {
    setExportOpen(false);
  }, []);

  // Create theme with current config
  const toggleButtonTheme = createToggleButtonTheme(config);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            MUI ToggleButton Theme Designer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Customize the appearance of MUI ToggleButton and ToggleButtonGroup
            components with live preview and export functionality.
          </Typography>
        </Box>

        {/* Main Content */}
        <Stack direction="row" spacing={3} sx={{ alignItems: "flex-start" }}>
          {/* Controls Panel */}
          <Paper
            variant="outlined"
            sx={{
              width: 320,
              flexShrink: 0,
              maxHeight: "calc(100vh - 180px)",
              overflow: "auto",
              position: "sticky",
              top: 20,
            }}
          >
            <ToggleButtonControls
              config={config}
              onUpdate={handleUpdate}
              onReset={handleReset}
              onExport={handleExport}
              presets={TOGGLEBUTTON_THEME_PRESETS}
            />
          </Paper>

          {/* Preview Panel */}
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              minWidth: 0,
              maxHeight: "calc(100vh - 180px)",
              overflow: "auto",
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mb: 2 }}
              >
                Live Preview
              </Typography>
              <ThemeProvider theme={toggleButtonTheme}>
                <ToggleButtonPreview />
              </ThemeProvider>
            </Box>
          </Paper>
        </Stack>
      </Stack>

      {/* Export Dialog */}
      <ToggleButtonExportDialog
        open={exportOpen}
        onClose={handleCloseExport}
        config={config}
      />
    </Container>
  );
}
