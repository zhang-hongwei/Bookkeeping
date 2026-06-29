/**
 * Chart Presets Panel
 * Right panel with preset chart configurations and reset action
 */

"use client";

import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import { RestartAlt as ResetIcon } from "@mui/icons-material";
import { useChartEditorStore } from "@/store/chart-editor";
import { LINE_CHART_PRESETS } from "../presets";

export function ChartPresetsPanel() {
  const applyPreset = useChartEditorStore((s) => s.applyPreset);
  const reset = useChartEditorStore((s) => s.reset);

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: 2,
        height: { xs: "auto", lg: "calc(100vh - 140px)" },
        overflow: "auto",
        position: { xs: "relative", lg: "sticky" },
        top: { lg: 16 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Presets header */}
      <Typography variant="subtitle2" gutterBottom>
        Presets
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mb: 2 }}>
        {LINE_CHART_PRESETS.map((preset) => (
          <Box
            key={preset.name}
            onClick={() => applyPreset(preset.config)}
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              cursor: "pointer",
              border: 1,
              borderColor: "divider",
              transition: "all 0.15s",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
              <Typography
                variant="body2"
                sx={{ fontSize: 16, lineHeight: 1 }}
                role="img"
                aria-label={preset.name}
              >
                {preset.icon}
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {preset.name}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
              sx={{ fontSize: 10, pl: 3.25 }}
            >
              {preset.description}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Actions */}
      <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={reset}
          size="small"
          color="inherit"
          startIcon={<ResetIcon sx={{ fontSize: 16 }} />}
        >
          Reset
        </Button>
      </Box>
    </Paper>
  );
}
