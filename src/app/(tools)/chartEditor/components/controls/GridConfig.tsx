/**
 * Grid Config
 * Configuration panel for chart grid spacing
 */

"use client";

import React from "react";
import { Box, FormControlLabel, Slider, Switch, Typography } from "@mui/material";
import { useChartEditorStore } from "@/store/chart-editor";

const GRID_MARGIN_OPTIONS = [
  { key: "top" as const, label: "Top" },
  { key: "right" as const, label: "Right" },
  { key: "bottom" as const, label: "Bottom" },
  { key: "left" as const, label: "Left" },
];

export function GridConfig() {
  const grid = useChartEditorStore((s) => s.config.grid);
  const updateConfig = useChartEditorStore((s) => s.updateConfig);

  const update = (partial: Partial<typeof grid>) => {
    updateConfig({ grid: { ...grid, ...partial } });
  };

  return (
    <>
      {GRID_MARGIN_OPTIONS.map(({ key, label }) => (
        <Box key={key} sx={{ mb: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">{label}</Typography>
            <Typography variant="caption" color="text.secondary">{grid[key]}</Typography>
          </Box>
          <Slider
            value={grid[key]}
            onChange={(_, v) => update({ [key]: v as number })}
            min={0} max={200} step={5} size="small"
            valueLabelDisplay="auto"
          />
        </Box>
      ))}

      <FormControlLabel
        control={
          <Switch
            checked={grid.containLabel}
            onChange={(e) => update({ containLabel: e.target.checked })}
            size="small"
          />
        }
        label={<Typography variant="caption">Contain Label</Typography>}
      />
    </>
  );
}
