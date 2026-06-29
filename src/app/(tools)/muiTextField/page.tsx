/**
 * MUI TextField Theme Designer
 * Customize MuiTextField design tokens and export theme configuration
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
import { TextFieldPreview } from "./components/TextFieldPreview";
import { TextFieldExportDialog } from "./components/TextFieldExportDialog";
import { TextFieldControls } from "./components/TextFieldControls";
import { TEXTFIELD_THEME_PRESETS } from "./presets";
import { MUI_DEFAULTS } from "./types";
import type { TextFieldThemeConfig } from "./types";
import { generateCreateTheme, createTextFieldTheme } from "./utils";

export default function MuiTextFieldThemeDesignerPage() {
  const [config, setConfig] = useState<TextFieldThemeConfig>(() => ({
    root: { ...MUI_DEFAULTS.root },
    inputBase: { ...MUI_DEFAULTS.inputBase },
    outlined: { ...MUI_DEFAULTS.outlined },
    filled: { ...MUI_DEFAULTS.filled },
    standard: { ...MUI_DEFAULTS.standard },
    label: { ...MUI_DEFAULTS.label },
    helperText: { ...MUI_DEFAULTS.helperText },
    adornment: { ...MUI_DEFAULTS.adornment },
    variant: "outlined",
    exportVariant: "outlined",
  }));
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleReset = () => {
    setConfig({
      root: { ...MUI_DEFAULTS.root },
      inputBase: { ...MUI_DEFAULTS.inputBase },
      outlined: { ...MUI_DEFAULTS.outlined },
      filled: { ...MUI_DEFAULTS.filled },
      standard: { ...MUI_DEFAULTS.standard },
      label: { ...MUI_DEFAULTS.label },
      helperText: { ...MUI_DEFAULTS.helperText },
      adornment: { ...MUI_DEFAULTS.adornment },
      variant: "outlined",
      exportVariant: "outlined",
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              MUI TextField Theme Designer
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Customize MuiTextField design tokens — input, label, border, colors, spacing — and
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
              <TextFieldControls
                config={config}
                onUpdate={setConfig}
                onReset={handleReset}
                onExport={() => setExportDialogOpen(true)}
                presets={TEXTFIELD_THEME_PRESETS}
              />
            </Paper>

            {/* Right: Preview + Code */}
            <Stack spacing={3}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Live Preview
                </Typography>
                <ThemeProvider theme={createTextFieldTheme(config)}>
                  <TextFieldPreview variant={config.variant} />
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

      <TextFieldExportDialog
        open={exportDialogOpen}
        config={config}
        onClose={() => setExportDialogOpen(false)}
      />
    </Box>
  );
}
