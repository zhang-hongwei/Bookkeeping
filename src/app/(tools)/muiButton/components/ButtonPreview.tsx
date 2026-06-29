/**
 * Live Button Preview Grid
 * Shows all variant × size × color combinations with custom theme
 */

"use client";

import React from "react";
import { Box, Paper, Typography, Stack, useTheme, ThemeProvider, createTheme } from "@mui/material";
import MuiButton from "@mui/material/Button";
import { Add, Send, Delete } from "@mui/icons-material";
import type { ButtonThemeConfig, SizeTokens } from "../types";

interface ButtonPreviewProps {
  config: ButtonThemeConfig;
}

/** Build a theme with the user's Button overrides applied */
function buildPreviewTheme(config: ButtonThemeConfig) {
  const baseTheme = createTheme();
  return createTheme({
    ...baseTheme,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: config.root.borderRadius,
            textTransform: config.root.textTransform,
            fontWeight: config.root.fontWeight,
            minWidth: config.root.minWidth,
            letterSpacing: config.root.letterSpacing,
          },
          sizeSmall: {
            fontSize: config.small.fontSize,
            '&.MuiButton-contained': { padding: config.small.containedPadding },
            '&.MuiButton-outlined': { padding: config.small.outlinedPadding },
            '&.MuiButton-text': { padding: config.small.textPadding },
          },
          sizeMedium: {
            fontSize: config.medium.fontSize,
            '&.MuiButton-contained': { padding: config.medium.containedPadding },
            '&.MuiButton-outlined': { padding: config.medium.outlinedPadding },
            '&.MuiButton-text': { padding: config.medium.textPadding },
          },
          sizeLarge: {
            fontSize: config.large.fontSize,
            '&.MuiButton-contained': { padding: config.large.containedPadding },
            '&.MuiButton-outlined': { padding: config.large.outlinedPadding },
            '&.MuiButton-text': { padding: config.large.textPadding },
          },
          contained: {
            boxShadow: config.elevation.boxShadow,
            '&:hover': { boxShadow: config.elevation.hoverBoxShadow },
          },
        },
      },
    },
  });
}

const VARIANTS = ['contained', 'outlined', 'text'] as const;
const SIZES = ['small', 'medium', 'large'] as const;
const COLORS = ['primary', 'secondary', 'error', 'success'] as const;

export function ButtonPreview({ config }: ButtonPreviewProps) {
  const appTheme = useTheme();
  const previewTheme = buildPreviewTheme(config);

  // Merge app palette into preview theme so colors render correctly
  previewTheme.palette = appTheme.palette;

  return (
    <ThemeProvider theme={previewTheme}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Variant × Size grid */}
        {VARIANTS.map((variant) => (
          <Paper key={variant} variant="outlined" sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block", textTransform: "capitalize" }}>
              {variant}
            </Typography>
            <Stack spacing={1.5}>
              {SIZES.map((size) => (
                <Box key={size} sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Typography variant="caption" sx={{ width: 52, color: "text.secondary", textTransform: "capitalize" }}>
                    {size}
                  </Typography>
                  {COLORS.map((color) => (
                    <MuiButton key={color} variant={variant} size={size} color={color}>
                      {color}
                    </MuiButton>
                  ))}
                  {/* With icon */}
                  <MuiButton variant={variant} size={size} startIcon={<Add />}>
                    Icon
                  </MuiButton>
                  {/* Disabled */}
                  <MuiButton variant={variant} size={size} disabled>
                    Disabled
                  </MuiButton>
                </Box>
              ))}
            </Stack>
          </Paper>
        ))}

        {/* Full width demo */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
            Full Width
          </Typography>
          <Stack spacing={1}>
            <MuiButton variant="contained" fullWidth>Full Width Contained</MuiButton>
            <MuiButton variant="outlined" fullWidth>Full Width Outlined</MuiButton>
          </Stack>
        </Paper>

        {/* Loading states */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
            Loading States
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <MuiButton variant="contained" loading loadingPosition="center">
              Center
            </MuiButton>
            <MuiButton variant="contained" loading loadingPosition="start" startIcon={<Send />}>
              Start
            </MuiButton>
            <MuiButton variant="contained" loading loadingPosition="end" endIcon={<Delete />}>
              End
            </MuiButton>
          </Stack>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
