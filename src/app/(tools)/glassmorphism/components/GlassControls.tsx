/**
 * Glass Controls Panel
 * Left panel with effect type selector and property controls
 */

"use client";

import React from "react";
import {
  Box, Paper, Typography, Tabs, Tab, Slider, TextField,
  Divider, Stack, FormControlLabel, Switch,
} from "@mui/material";
import { useGlassStore } from "@/store/glass";
import type { GlassEffectType } from "../types";

// ─── Slider Control ────────────────────────────────────────────────────

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

function SliderControl({ label, value, onChange, min, max, step = 1, unit = "" }: SliderControlProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {step < 1 ? value.toFixed(2) : value}{unit}
        </Typography>
      </Box>
      <Slider
        value={value} onChange={(_, v) => onChange(v as number)}
        min={min} max={max} step={step} size="small"
        valueLabelDisplay="auto" valueLabelFormat={(v) => `${v}${unit}`}
      />
    </Box>
  );
}

// ─── Main Controls ─────────────────────────────────────────────────────

const EFFECT_TYPES: { label: string; value: GlassEffectType }[] = [
  { label: "Glassmorphism", value: "glassmorphism" },
  { label: "Liquid Glass", value: "liquidGlass" },
  { label: "Neumorphism", value: "neumorphism" },
];

export function GlassControls() {
  const config = useGlassStore((s) => s.config);
  const updateConfig = useGlassStore((s) => s.updateConfig);
  const setEffectType = useGlassStore((s) => s.setEffectType);

  const { effectType } = config;
  const isGlass = effectType === "glassmorphism";
  const isLiquid = effectType === "liquidGlass";
  const isNeu = effectType === "neumorphism";

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
      }}
    >
      {/* Effect type tabs */}
      <Typography variant="subtitle2" gutterBottom>Effect Type</Typography>
      <Tabs
        value={EFFECT_TYPES.findIndex((t) => t.value === effectType)}
        onChange={(_, idx) => setEffectType(EFFECT_TYPES[idx].value)}
        variant="fullWidth"
        sx={{ mb: 2, minHeight: 36, "& .MuiTab-root": { minHeight: 36, py: 0, fontSize: 12 } }}
      >
        {EFFECT_TYPES.map((t) => (
          <Tab key={t.value} label={t.label} />
        ))}
      </Tabs>

      <Divider sx={{ my: 1.5 }} />

      {/* ─── Glassmorphism / Liquid Glass controls ─── */}
      {(isGlass || isLiquid) && (
        <>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Backdrop</Typography>
          <SliderControl label="Blur" value={config.blur} onChange={(v) => updateConfig({ blur: v })} min={0} max={64} unit="px" />
          <SliderControl label="Opacity" value={config.opacity} onChange={(v) => updateConfig({ opacity: v })} min={0} max={1} step={0.01} />
          <SliderControl label="Saturation" value={config.saturation} onChange={(v) => updateConfig({ saturation: v })} min={0} max={300} unit="%" />

          <Divider sx={{ my: 1.5 }} />

          {/* Background color */}
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Background Color</Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="center">
            <TextField
              type="color" value={config.backgroundColor}
              onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
              size="small" sx={{ width: 56, "& input": { p: 0.5, height: 32 } }}
            />
            <TextField
              value={config.backgroundColor} size="small"
              onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
              sx={{ flex: 1, "& input": { fontFamily: "monospace", fontSize: 12 } }}
            />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Shadow */}
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Shadow</Typography>
          <SliderControl label="X" value={config.shadowX} onChange={(v) => updateConfig({ shadowX: v })} min={-40} max={40} unit="px" />
          <SliderControl label="Y" value={config.shadowY} onChange={(v) => updateConfig({ shadowY: v })} min={-40} max={40} unit="px" />
          <SliderControl label="Blur" value={config.shadowBlur} onChange={(v) => updateConfig({ shadowBlur: v })} min={0} max={80} unit="px" />
          <SliderControl label="Spread" value={config.shadowSpread} onChange={(v) => updateConfig({ shadowSpread: v })} min={-20} max={20} unit="px" />
          <SliderControl label="Opacity" value={config.shadowOpacity} onChange={(v) => updateConfig({ shadowOpacity: v })} min={0} max={100} unit="%" />

          <Stack direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
            <Typography variant="caption" color="text.secondary">Shadow Color</Typography>
            <TextField
              type="color" value={config.shadowColor}
              onChange={(e) => updateConfig({ shadowColor: e.target.value })}
              size="small" sx={{ width: 40, "& input": { p: 0.5, height: 28 } }}
            />
          </Stack>

          {/* Liquid Glass specific */}
          {isLiquid && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Liquid Glass</Typography>
              <SliderControl
                label="Inner Highlight"
                value={config.innerShadowOpacity}
                onChange={(v) => updateConfig({ innerShadowOpacity: v })}
                min={0} max={100} unit="%"
              />
            </>
          )}
        </>
      )}

      {/* ─── Neumorphism controls ─── */}
      {isNeu && (
        <>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Surface</Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="center">
            <TextField
              type="color" value={config.surfaceColor}
              onChange={(e) => updateConfig({ surfaceColor: e.target.value })}
              size="small" sx={{ width: 56, "& input": { p: 0.5, height: 32 } }}
            />
            <TextField
              value={config.surfaceColor} size="small"
              onChange={(e) => updateConfig({ surfaceColor: e.target.value })}
              sx={{ flex: 1, "& input": { fontFamily: "monospace", fontSize: 12 } }}
            />
          </Stack>

          <SliderControl label="Distance" value={config.neumorphDistance} onChange={(v) => updateConfig({ neumorphDistance: v })} min={1} max={30} unit="px" />
          <SliderControl label="Shadow Blur" value={config.neumorphBlur} onChange={(v) => updateConfig({ neumorphBlur: v })} min={4} max={40} unit="px" />

          <Divider sx={{ my: 1.5 }} />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Shadow Colors</Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
            <TextField
              type="color" value={config.lightShadowColor}
              onChange={(e) => updateConfig({ lightShadowColor: e.target.value })}
              size="small" label="Light" sx={{ flex: 1, "& input": { p: 0.5, height: 32 } }}
            />
            <TextField
              type="color" value={config.darkShadowColor}
              onChange={(e) => updateConfig({ darkShadowColor: e.target.value })}
              size="small" label="Dark" sx={{ flex: 1, "& input": { p: 0.5, height: 32 } }}
            />
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={config.neumorphInset}
                onChange={(e) => updateConfig({ neumorphInset: e.target.checked })}
                size="small"
              />
            }
            label={<Typography variant="caption">Inset (Pressed)</Typography>}
            sx={{ mt: 1 }}
          />
        </>
      )}

      {/* ─── Common: Border ─── */}
      <Divider sx={{ my: 1.5 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>Border</Typography>
      <SliderControl label="Radius" value={config.borderRadius} onChange={(v) => updateConfig({ borderRadius: v })} min={0} max={64} unit="px" />
      <SliderControl label="Width" value={config.borderWidth} onChange={(v) => updateConfig({ borderWidth: v })} min={0} max={5} unit="px" />
      {!isNeu && (
        <Stack direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
          <Typography variant="caption" color="text.secondary">Border Color</Typography>
          <TextField
            value={config.borderColor} size="small"
            onChange={(e) => updateConfig({ borderColor: e.target.value })}
            placeholder="rgba(...)" sx={{ flex: 1, "& input": { fontFamily: "monospace", fontSize: 11 } }}
          />
        </Stack>
      )}

      {/* Padding */}
      <SliderControl label="Padding" value={config.padding} onChange={(v) => updateConfig({ padding: v })} min={0} max={48} unit="px" />
    </Paper>
  );
}
