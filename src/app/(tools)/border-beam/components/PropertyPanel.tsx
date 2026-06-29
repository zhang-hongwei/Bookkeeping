"use client";

import React from "react";
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  Switch,
  FormControlLabel,
  Stack,
  Button,
} from "@mui/material";
import type {
  BorderBeamSize,
  BorderBeamColorVariant,
  BorderBeamTheme,
} from "border-beam";
import { buildSnippet, type BeamConfig } from "../types";

interface PropertyPanelProps extends BeamConfig {
  isPageLight: boolean;
  onSizeChange: (value: BorderBeamSize) => void;
  onColorVariantChange: (value: BorderBeamColorVariant) => void;
  onBeamThemeChange: (value: BorderBeamTheme) => void;
  onStrengthChange: (value: number) => void;
  onDurationChange: (value: number) => void;
  onBrightnessChange: (value: number) => void;
  onActiveChange: (value: boolean) => void;
  onStaticColorsChange: (value: boolean) => void;
}

export function PropertyPanel({
  isPageLight,
  size,
  colorVariant,
  beamTheme,
  strength,
  duration,
  brightness,
  active,
  staticColors,
  onSizeChange,
  onColorVariantChange,
  onBeamThemeChange,
  onStrengthChange,
  onDurationChange,
  onBrightnessChange,
  onActiveChange,
  onStaticColorsChange,
}: PropertyPanelProps) {
  const panelBg = isPageLight ? "#fafafa" : "#111";
  const panelBorder = isPageLight ? "#e0e0e0" : "#222";
  const labelColor = isPageLight ? "grey.600" : "grey.400";

  return (
    <Stack
      spacing={2.5}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: panelBg,
        border: `1px solid ${panelBorder}`,
      }}
    >
      <Typography variant="subtitle2" sx={{ color: labelColor }}>
        属性设置
      </Typography>

      <ControlGroup label="尺寸">
        <ToggleButtonGroup
          value={size}
          exclusive
          size="small"
          onChange={(_, v) => v && onSizeChange(v)}
          fullWidth
        >
          {(["sm", "md", "line"] as BorderBeamSize[]).map((s) => (
            <ToggleButton key={s} value={s} sx={{ color: labelColor }}>
              {s}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </ControlGroup>

      <ControlGroup label="颜色变体">
        <ToggleButtonGroup
          value={colorVariant}
          exclusive
          size="small"
          onChange={(_, v) => v && onColorVariantChange(v)}
          fullWidth
        >
          {(
            ["colorful", "mono", "ocean", "sunset"] as BorderBeamColorVariant[]
          ).map((c) => (
            <ToggleButton key={c} value={c} sx={{ color: labelColor }}>
              {c}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </ControlGroup>

      <ControlGroup label="Beam 主题">
        <ToggleButtonGroup
          value={beamTheme}
          exclusive
          size="small"
          onChange={(_, v) => v && onBeamThemeChange(v)}
          fullWidth
        >
          {(["dark", "light", "auto"] as BorderBeamTheme[]).map((t) => (
            <ToggleButton key={t} value={t} sx={{ color: labelColor }}>
              {t}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </ControlGroup>

      <ControlGroup label={`强度: ${strength.toFixed(2)}`}>
        <Slider
          value={strength}
          onChange={(_, v) => onStrengthChange(v as number)}
          min={0}
          max={1}
          step={0.01}
          size="small"
        />
      </ControlGroup>

      <ControlGroup label={`持续时间: ${duration.toFixed(2)}s`}>
        <Slider
          value={duration}
          onChange={(_, v) => onDurationChange(v as number)}
          min={0.5}
          max={5}
          step={0.1}
          size="small"
        />
      </ControlGroup>

      <ControlGroup label={`亮度: ${brightness.toFixed(2)}`}>
        <Slider
          value={brightness}
          onChange={(_, v) => onBrightnessChange(v as number)}
          min={0.5}
          max={3}
          step={0.1}
          size="small"
        />
      </ControlGroup>

      <FormControlLabel
        control={
          <Switch
            checked={active}
            onChange={(e) => onActiveChange(e.target.checked)}
            size="small"
          />
        }
        label="启用动画"
        sx={{ color: labelColor }}
      />
      <FormControlLabel
        control={
          <Switch
            checked={staticColors}
            onChange={(e) => onStaticColorsChange(e.target.checked)}
            size="small"
          />
        }
        label="静态颜色"
        sx={{ color: labelColor }}
      />

      <Box sx={{ mt: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            const code = buildSnippet({
              size,
              colorVariant,
              theme: beamTheme,
              strength,
              duration,
              brightness,
              active,
              staticColors,
            });
            navigator.clipboard.writeText(code);
          }}
          fullWidth
        >
          复制 JSX 代码
        </Button>
      </Box>
    </Stack>
  );
}

function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5, display: "block" }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}
