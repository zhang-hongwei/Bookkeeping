/**
 * Legend Config
 * Configuration panel for chart legend
 */

"use client";

import React from "react";
import {
  FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, Typography,
} from "@mui/material";
import { useChartEditorStore } from "@/store/chart-editor";
import type { LegendOrient, LegendPosition } from "../../types";

const POSITION_OPTIONS: { value: LegendPosition; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

const ORIENT_OPTIONS: { value: LegendOrient; label: string }[] = [
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
];

export function LegendConfig() {
  const legend = useChartEditorStore((s) => s.config.legend);
  const updateConfig = useChartEditorStore((s) => s.updateConfig);

  const update = (partial: Partial<typeof legend>) => {
    updateConfig({ legend: { ...legend, ...partial } });
  };

  return (
    <>
      <FormControlLabel
        control={
          <Switch
            checked={legend.show}
            onChange={(e) => update({ show: e.target.checked })}
            size="small"
          />
        }
        label={<Typography variant="caption">Show Legend</Typography>}
        sx={{ mb: 1 }}
      />

      <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
        <InputLabel>Position</InputLabel>
        <Select
          value={legend.position}
          label="Position"
          onChange={(e) => update({ position: e.target.value as LegendPosition })}
        >
          {POSITION_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>Orient</InputLabel>
        <Select
          value={legend.orient}
          label="Orient"
          onChange={(e) => update({ orient: e.target.value as LegendOrient })}
        >
          {ORIENT_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}
