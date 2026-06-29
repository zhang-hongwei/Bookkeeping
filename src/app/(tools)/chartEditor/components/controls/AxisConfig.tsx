/**
 * Axis Config
 * Configuration panel for a single axis (X or Y)
 */

"use client";

import React from "react";
import {
  Box, FormControl, FormControlLabel, InputLabel, MenuItem, Select,
  Slider, Stack, Switch, TextField, Typography,
} from "@mui/material";
import type { AxisType, ChartEditorAxis } from "../../types";

const AXIS_TYPE_OPTIONS: { value: AxisType; label: string }[] = [
  { value: "category", label: "Category" },
  { value: "value", label: "Value" },
];

interface AxisConfigProps {
  axis: ChartEditorAxis;
  axisLabel: string;
  onUpdate: (update: Partial<ChartEditorAxis>) => void;
}

export function AxisConfig({ axis, axisLabel, onUpdate }: AxisConfigProps) {
  const isValue = axis.type === "value";

  return (
    <Box>
      {/* Type */}
      <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
        <InputLabel>Type</InputLabel>
        <Select
          value={axis.type}
          label="Type"
          onChange={(e) => onUpdate({ type: e.target.value as AxisType })}
        >
          {AXIS_TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Show */}
      <FormControlLabel
        control={
          <Switch
            checked={axis.show}
            onChange={(e) => onUpdate({ show: e.target.checked })}
            size="small"
          />
        }
        label={<Typography variant="caption">Show {axisLabel}</Typography>}
        sx={{ mb: 0.5 }}
      />

      {/* Name */}
      <TextField
        label="Name"
        value={axis.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        size="small"
        fullWidth
        sx={{ mb: 1.5 }}
      />

      {/* Inverse */}
      <FormControlLabel
        control={
          <Switch
            checked={axis.inverse}
            onChange={(e) => onUpdate({ inverse: e.target.checked })}
            size="small"
          />
        }
        label={<Typography variant="caption">Inverse</Typography>}
        sx={{ mb: 0.5 }}
      />

      {/* Label Rotation */}
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary">Label Rotation</Typography>
          <Typography variant="caption" color="text.secondary">{axis.labelRotation}</Typography>
        </Box>
        <Slider
          value={axis.labelRotation}
          onChange={(_, v) => onUpdate({ labelRotation: v as number })}
          min={-90} max={90} step={5} size="small"
          valueLabelDisplay="auto"
        />
      </Box>

      {/* Split Line */}
      <FormControlLabel
        control={
          <Switch
            checked={axis.showSplitLine}
            onChange={(e) => onUpdate({ showSplitLine: e.target.checked })}
            size="small"
          />
        }
        label={<Typography variant="caption">Split Line</Typography>}
        sx={{ mb: 0.5 }}
      />

      {/* Min / Max (value type only) */}
      {isValue && (
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <TextField
            label="Min"
            value={axis.min}
            onChange={(e) => onUpdate({ min: e.target.value })}
            size="small"
            placeholder="auto"
            sx={{ flex: 1 }}
          />
          <TextField
            label="Max"
            value={axis.max}
            onChange={(e) => onUpdate({ max: e.target.value })}
            size="small"
            placeholder="auto"
            sx={{ flex: 1 }}
          />
        </Stack>
      )}

      {/* Categories (category type only) */}
      {!isValue && (
        <TextField
          label="Categories (comma-separated)"
          value={axis.categories.join(", ")}
          onChange={(e) => {
            const categories = e.target.value.split(",").map((c) => c.trim()).filter(Boolean);
            onUpdate({ categories });
          }}
          size="small"
          fullWidth
          sx={{ mb: 1.5 }}
        />
      )}
    </Box>
  );
}
