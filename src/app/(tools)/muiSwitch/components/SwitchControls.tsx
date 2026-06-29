/**
 * MUI Switch Theme Designer - Control Panel
 * All configurable parameters for MUI Switch customization
 */

"use client";

import React from "react";
import {
  Box,
  Typography,
  Stack,
  Slider,
  TextField,
  Chip,
  Divider,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import type { SwitchThemeConfig } from "../types";

interface SwitchControlsProps {
  config: SwitchThemeConfig;
  onUpdate: (config: SwitchThemeConfig) => void;
  onReset: () => void;
  onExport: () => void;
  presets?: Array<{ name: string; description: string; config: SwitchThemeConfig }>;
}

export function SwitchControls({
  config,
  onUpdate,
  onReset,
  onExport,
  presets = [],
}: SwitchControlsProps) {
  // Helper to update nested config
  const update = <K extends keyof SwitchThemeConfig>(
    key: K,
    value: SwitchThemeConfig[K]
  ) => {
    onUpdate({ ...config, [key]: value });
  };

  const updateRoot = <K extends keyof SwitchThemeConfig["root"]>(
    key: K,
    value: SwitchThemeConfig["root"][K]
  ) => {
    onUpdate({ ...config, root: { ...config.root, [key]: value } });
  };

  const updateThumb = <K extends keyof SwitchThemeConfig["thumb"]>(
    key: K,
    value: SwitchThemeConfig["thumb"][K]
  ) => {
    onUpdate({ ...config, thumb: { ...config.thumb, [key]: value } });
  };

  const updateTrack = <K extends keyof SwitchThemeConfig["track"]>(
    key: K,
    value: SwitchThemeConfig["track"][K]
  ) => {
    onUpdate({ ...config, track: { ...config.track, [key]: value } });
  };

  const updateTrackChecked = <K extends keyof SwitchThemeConfig["trackChecked"]>(
    key: K,
    value: SwitchThemeConfig["trackChecked"][K]
  ) => {
    onUpdate({ ...config, trackChecked: { ...config.trackChecked, [key]: value } });
  };

  const handlePresetApply = (preset: SwitchThemeConfig) => {
    onUpdate(preset);
  };

  return (
    <Stack spacing={0} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Presets */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Presets
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {presets.map((preset, idx) => (
            <Chip
              key={idx}
              label={preset.name}
              onClick={() => handlePresetApply(preset.config)}
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* 容器尺寸控制 */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Container (Root)
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Container Width: {config.root.width || 50}px
          </Typography>
          <Slider
            value={config.root.width ?? 50}
            onChange={(_, v) => updateRoot("width", v as number)}
            min={30}
            max={100}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Container Height: {config.root.height || 28}px
          </Typography>
          <Slider
            value={config.root.height ?? 28}
            onChange={(_, v) => updateRoot("height", v as number)}
            min={20}
            max={60}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Padding: {config.root.padding || 7}px
          </Typography>
          <Slider
            value={config.root.padding ?? 7}
            onChange={(_, v) => updateRoot("padding", v as number)}
            min={0}
            max={20}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Thumb (滑块) 控制 */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Thumb (滑块)
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Width: {config.thumb.width}px
          </Typography>
          <Slider
            value={config.thumb.width}
            onChange={(_, v) => updateThumb("width", v as number)}
            min={8}
            max={48}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Height: {config.thumb.height}px
          </Typography>
          <Slider
            value={config.thumb.height}
            onChange={(_, v) => updateThumb("height", v as number)}
            min={8}
            max={48}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Border Radius: {config.thumb.borderRadius}
          </Typography>
          <Slider
            value={parseInt(config.thumb.borderRadius) || 50}
            onChange={(_, v) => updateThumb("borderRadius", `${v}%`)}
            min={0}
            max={50}
            valueLabelDisplay="auto"
            size="small"
            marks={[
              { value: 0, label: "0%" },
              { value: 25, label: "25%" },
              { value: 50, label: "50%" },
            ]}
          />
        </Box>

        <TextField
          label="Box Shadow"
          value={config.thumb.boxShadow}
          onChange={(e) => updateThumb("boxShadow", e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. 0 2px 4px rgba(0,0,0,0.2)"
        />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Track (轨道) 控制 */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Track (轨道)
        </Typography>

        <TextField
          label="Border Radius"
          value={config.track.borderRadius}
          onChange={(e) => updateTrack("borderRadius", e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. 20px"
        />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Colors */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Colors
        </Typography>

        <TextField
          label="Thumb Color (Checked)"
          value={config.thumb.checkedColor}
          onChange={(e) => updateThumb("checkedColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.thumb.checkedColor,
                  mr: 1,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
            ),
          }}
        />

        <TextField
          label="Track Color (Unchecked)"
          value={config.track.backgroundColor}
          onChange={(e) => updateTrack("backgroundColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.track.backgroundColor,
                  mr: 1,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
            ),
          }}
        />

        <TextField
          label="Track Color (Checked)"
          value={config.trackChecked.backgroundColor}
          onChange={(e) => updateTrackChecked("backgroundColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.trackChecked.backgroundColor,
                  mr: 1,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
            ),
          }}
        />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* SwitchBase (动画) 控制 */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          SwitchBase (动画层)
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Padding: {config.root.switchBasePadding || 9}px
          </Typography>
          <Slider
            value={config.root.switchBasePadding ?? 9}
            onChange={(_, v) => updateRoot("switchBasePadding", v as number)}
            min={0}
            max={20}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            TranslateX (Checked): {config.root.translateX || 16}px
          </Typography>
          <Slider
            value={config.root.translateX ?? 16}
            onChange={(_, v) => updateRoot("translateX", v as number)}
            min={0}
            max={50}
            valueLabelDisplay="auto"
            size="small"
            marks={[
              { value: 16, label: "16px" },
              { value: 20, label: "20px" },
            ]}
          />
        </Box>

        <TextField
          label="Transition Duration"
          value={config.root.transitionDuration}
          onChange={(e) => updateRoot("transitionDuration", e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. 200ms"
        />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Export Options */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Export Format
        </Typography>
        <ToggleButtonGroup
          value={config.exportVariant ?? 'medium'}
          exclusive
          size="small"
          fullWidth
          onChange={(e, value) => {
            if (value) updateRoot("exportVariant", value);
          }}
        >
          <ToggleButton value="medium">Medium</ToggleButton>
          <ToggleButton value="small">Small</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary">
          {config.exportVariant}: affects only {config.exportVariant} size
        </Typography>
      </Stack>

      {/* Actions */}
      <Box sx={{ mt: "auto", display: "flex", gap: 1, pt: 2 }}>
        <Button variant="contained" fullWidth onClick={onExport}>
          Export
        </Button>
        <Button variant="outlined" onClick={onReset}>
          Reset
        </Button>
      </Box>
    </Stack>
  );
}
