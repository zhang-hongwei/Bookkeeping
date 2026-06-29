/**
 * Scale Preview Component
 * Visual representation of spacing scale
 */

"use client";

import React from "react";
import { Box, Paper, Typography, Stack } from "@mui/material";
import type { ScaleStep } from "../types";

interface ScalePreviewProps {
  scale: ScaleStep[];
  unit: 'px' | 'rem';
}

export function ScalePreview({ scale, unit }: ScalePreviewProps) {
  const maxValue = Math.max(...scale.map((s) => s.px));

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="subtitle2" gutterBottom color="text.secondary">
        Visual Scale
      </Typography>

      <Stack spacing={1.5}>
        {scale.map((step) => {
          const widthPercent = (step.px / maxValue) * 100;
          const displayValue = unit === 'px' ? `${step.px}px` : step.rem;

          return (
            <Box key={step.index}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    textAlign: "right",
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: "text.secondary",
                  }}
                >
                  {step.name}
                </Box>
                <Box
                  sx={{
                    height: 24,
                    width: `${widthPercent}%`,
                    minWidth: step.px,
                    maxWidth: "100%",
                    bgcolor: "primary.main",
                    borderRadius: 0.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    pr: 1,
                    transition: "width 0.3s ease",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "white",
                      fontFamily: "monospace",
                      fontSize: 11,
                      fontWeight: "medium",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayValue}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Stack>

      {/* Grid preview */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Example Usage
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
            gap: 1,
          }}
        >
          {scale.slice(0, 6).map((step) => (
            <Box
              key={step.index}
              sx={{
                height: 40,
                bgcolor: "primary.light",
                borderRadius: 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.dark",
                fontSize: 10,
                fontFamily: "monospace",
              }}
            >
              {step.px}px
            </Box>
          ))}
        </Box>
      </Box>

      {/* Spacing demo */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Padding Demo
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "flex-start",
          }}
        >
          {scale.slice(0, 5).map((step) => (
            <Box
              key={step.index}
              sx={{
                p: `${step.px}px`,
                bgcolor: "action.hover",
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 0.5,
              }}
            >
              <Box
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: 0.5,
                  px: 1,
                  py: 0.5,
                  fontSize: 10,
                  fontFamily: "monospace",
                  whiteSpace: "nowrap",
                }}
              >
                p={step.px}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
