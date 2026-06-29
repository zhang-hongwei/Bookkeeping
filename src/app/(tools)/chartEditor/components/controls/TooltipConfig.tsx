/**
 * Tooltip Config
 * Configuration panel for chart tooltip
 */

"use client";

import React from "react";
import {
  FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, Typography,
} from "@mui/material";
import { useChartEditorStore } from "@/store/chart-editor";
import type { TooltipTrigger } from "../../types";

const TRIGGER_OPTIONS: { value: TooltipTrigger; label: string }[] = [
  { value: "axis", label: "Axis" },
  { value: "item", label: "Item" },
];

export function TooltipConfig() {
  const tooltip = useChartEditorStore((s) => s.config.tooltip);
  const updateConfig = useChartEditorStore((s) => s.updateConfig);

  const update = (partial: Partial<typeof tooltip>) => {
    updateConfig({ tooltip: { ...tooltip, ...partial } });
  };

  return (
    <>
      <FormControlLabel
        control={
          <Switch
            checked={tooltip.show}
            onChange={(e) => update({ show: e.target.checked })}
            size="small"
          />
        }
        label={<Typography variant="caption">Show Tooltip</Typography>}
        sx={{ mb: 1 }}
      />

      <FormControl size="small" fullWidth>
        <InputLabel>Trigger</InputLabel>
        <Select
          value={tooltip.trigger}
          label="Trigger"
          onChange={(e) => update({ trigger: e.target.value as TooltipTrigger })}
        >
          {TRIGGER_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}
