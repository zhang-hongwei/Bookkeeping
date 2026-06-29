/**
 * Series Item Editor
 * Edit properties of a single selected series
 */

"use client";

import React from "react";
import {
  Box, FormControl, FormControlLabel, InputLabel, MenuItem, Select,
  Slider, Stack, Switch, TextField, Typography,
} from "@mui/material";
import { useChartEditorStore } from "@/store/chart-editor";
import type { ChartEditorSeries, SymbolType } from "../../types";
import { DataEditor } from "./DataEditor";

const SYMBOL_OPTIONS: { value: SymbolType; label: string }[] = [
  { value: "circle", label: "Circle" },
  { value: "rect", label: "Rectangle" },
  { value: "triangle", label: "Triangle" },
  { value: "diamond", label: "Diamond" },
  { value: "none", label: "None" },
];

const STEP_OPTIONS = [
  { value: "", label: "None" },
  { value: "start", label: "Start" },
  { value: "middle", label: "Middle" },
  { value: "end", label: "End" },
];

interface SeriesItemEditorProps {
  series: ChartEditorSeries;
}

export function SeriesItemEditor({ series }: SeriesItemEditorProps) {
  const updateSeries = useChartEditorStore((s) => s.updateSeries);

  const update = (updates: Partial<ChartEditorSeries>) => {
    updateSeries(series.id, updates);
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Name */}
      <TextField
        label="Name"
        value={series.name}
        onChange={(e) => update({ name: e.target.value })}
        size="small"
        fullWidth
        sx={{ mb: 1.5 }}
      />

      {/* Color */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ minWidth: 48 }}>
          Color
        </Typography>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            bgcolor: series.color,
            border: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
          }}
        />
        <TextField
          type="color"
          value={series.color}
          onChange={(e) => update({ color: e.target.value })}
          size="small"
          sx={{ width: 56, "& input": { p: 0.5, height: 32 } }}
        />
      </Box>

      {/* Smooth */}
      <FormControlLabel
        control={
          <Switch
            checked={series.smooth}
            onChange={(e) => update({ smooth: e.target.checked })}
            size="small"
          />
        }
        label={<Typography variant="caption">Smooth</Typography>}
        sx={{ mb: 0.5 }}
      />

      {/* Line Width */}
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary">Line Width</Typography>
          <Typography variant="caption" color="text.secondary">{series.lineWidth}</Typography>
        </Box>
        <Slider
          value={series.lineWidth}
          onChange={(_, v) => update({ lineWidth: v as number })}
          min={1} max={10} step={1} size="small"
          valueLabelDisplay="auto"
        />
      </Box>

      {/* Symbol Type */}
      <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
        <InputLabel>Symbol</InputLabel>
        <Select
          value={series.symbolType}
          label="Symbol"
          onChange={(e) => update({ symbolType: e.target.value as SymbolType })}
        >
          {SYMBOL_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Symbol Size */}
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary">Symbol Size</Typography>
          <Typography variant="caption" color="text.secondary">{series.symbolSize}</Typography>
        </Box>
        <Slider
          value={series.symbolSize}
          onChange={(_, v) => update({ symbolSize: v as number })}
          min={2} max={20} step={1} size="small"
          valueLabelDisplay="auto"
        />
      </Box>

      {/* Show Area */}
      <FormControlLabel
        control={
          <Switch
            checked={series.showArea}
            onChange={(e) => update({ showArea: e.target.checked })}
            size="small"
          />
        }
        label={<Typography variant="caption">Show Area</Typography>}
        sx={{ mb: 0.5 }}
      />

      {/* Area Opacity (conditional) */}
      {series.showArea && (
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">Area Opacity</Typography>
            <Typography variant="caption" color="text.secondary">{series.areaOpacity.toFixed(1)}</Typography>
          </Box>
          <Slider
            value={series.areaOpacity}
            onChange={(_, v) => update({ areaOpacity: v as number })}
            min={0} max={1} step={0.1} size="small"
            valueLabelDisplay="auto"
          />
        </Box>
      )}

      {/* Stack */}
      <TextField
        label="Stack"
        value={series.stack}
        onChange={(e) => update({ stack: e.target.value })}
        size="small"
        fullWidth
        placeholder="Empty = no stack"
        sx={{ mb: 1.5 }}
      />

      {/* Step */}
      <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
        <InputLabel>Step</InputLabel>
        <Select
          value={series.step}
          label="Step"
          onChange={(e) => update({ step: e.target.value })}
        >
          {STEP_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Data Points */}
      <DataEditor seriesId={series.id} data={series.data} />
    </Box>
  );
}
