/**
 * MUI OutlinedInput Theme Designer
 * CSS Variable engine for real-time preview, createTheme for export only
 */

"use client";

import { useEffect, useMemo, useDeferredValue } from "react";
import { Box, Container, Paper, Typography, Stack, Divider } from "@mui/material";
import { OutlinedInputPreview } from "./components/OutlinedInputPreview";
import { OutlinedInputExportDialog } from "./components/OutlinedInputExportDialog";
import { OutlinedInputControls } from "./components/OutlinedInputControls";
import { useOutlinedInputStore, removeAllCSSVars, configToCSSVars } from "./store";
import { generateCreateTheme } from "./utils";

const codeSelector = (s: { config: Parameters<typeof generateCreateTheme>[0] }) => s.config;

export default function OutlinedInputThemeDesignerPage() {
  const config = useOutlinedInputStore(codeSelector);

  // Apply CSS variables on mount, clean up on unmount
  useEffect(() => {
    const initial = configToCSSVars(useOutlinedInputStore.getState().config);
    const root = document.documentElement;
    Object.entries(initial).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    return () => {
      removeAllCSSVars();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deferredConfig = useDeferredValue(config);
  const generatedCode = useMemo(() => generateCreateTheme(deferredConfig), [deferredConfig]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              MUI OutlinedInput Theme Designer
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Customize MuiOutlinedInput design tokens — border, input, adornment, notch — and
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
              <OutlinedInputControls />
            </Paper>

            {/* Right: Preview + Code */}
            <Stack spacing={3}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Live Preview
                </Typography>
                <OutlinedInputPreview />
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
                  {generatedCode}
                </Paper>
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </Container>

      <OutlinedInputExportDialog />
    </Box>
  );
}
