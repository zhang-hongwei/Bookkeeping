/**
 * Border Radius Preview Component
 * Visual preview of the border radius
 */

"use client";

import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { BorderRadiusValues, BorderUnit } from "../types";
import { generateBorderRadiusCSS } from "../utils";

interface BorderRadiusPreviewProps {
  values: BorderRadiusValues;
  unit: BorderUnit;
  size: number;
  backgroundColor: string;
  borderColor: string;
}

export function BorderRadiusPreview({
  values,
  unit,
  size,
  backgroundColor,
  borderColor,
}: BorderRadiusPreviewProps) {
  const theme = useTheme();
  const borderRadius = generateBorderRadiusCSS(values, unit);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      {/* Main preview box */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          minHeight: 300,
          bgcolor: theme.vars.palette.grey[100],
          ...theme.applyStyles("dark", {
            bgcolor: theme.vars.palette.grey[900],
          }),
          borderRadius: 2,
          p: 4,
        }}
      >
        <Box
          sx={{
            width: size,
            height: size,
            backgroundColor: backgroundColor,
            border: `3px solid ${borderColor}`,
            borderRadius: borderRadius,
            transition: "all 0.3s ease",
            boxShadow: theme.shadows[4],
          }}
        />
      </Box>

      {/* Corner labels */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          width: "100%",
        }}
      >
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Corner Values
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
          }}
        >
          <Box sx={{ textAlign: "center", p: 1, bgcolor: "action.hover", borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Top Left
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {values.topLeft}{unit === '%' ? '%' : 'px'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", p: 1, bgcolor: "action.hover", borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Top Right
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {values.topRight}{unit === '%' ? '%' : 'px'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", p: 1, bgcolor: "action.hover", borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Bottom Left
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {values.bottomLeft}{unit === '%' ? '%' : 'px'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", p: 1, bgcolor: "action.hover", borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Bottom Right
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {values.bottomRight}{unit === '%' ? '%' : 'px'}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
