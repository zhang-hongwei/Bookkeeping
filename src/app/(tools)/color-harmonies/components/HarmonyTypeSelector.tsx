/**
 * Harmony Type Selector Component
 * Selector for harmony type presets (left panel)
 */

"use client";

import React from "react";
import {
  Box,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { HARMONY_TYPES } from "../utils";
import type { HarmonyType } from "../types";

interface HarmonyTypeSelectorProps {
  value: HarmonyType;
  onChange: (type: HarmonyType) => void;
}

export function HarmonyTypeSelector({ value, onChange }: HarmonyTypeSelectorProps) {
  const handleChange = (_: React.MouseEvent<HTMLElement>, newType: HarmonyType | null) => {
    if (newType) {
      onChange(newType);
    }
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Harmony Type
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        orientation="vertical"
        fullWidth
        size="small"
      >
        {HARMONY_TYPES.map((harmony) => (
          <ToggleButton
            key={harmony.type}
            value={harmony.type}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              py: 1.5,
              px: 2,
              "&.Mui-selected": {
                bgcolor: "action.selected",
              },
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Typography variant="body2" fontWeight="medium">
                {harmony.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {harmony.description}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
                {harmony.colorCount} colors
              </Typography>
            </Box>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Paper>
  );
}
