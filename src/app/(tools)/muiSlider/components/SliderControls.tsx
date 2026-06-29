/**
 * MUI Slider Theme Designer - Control Panel
 * All configurable parameters for MUI Slider customization
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
  Switch,
  FormControlLabel,
} from "@mui/material";
import type { SliderThemeConfig } from "../types";

interface SliderControlsProps {
  config: SliderThemeConfig;
  onUpdate: (config: SliderThemeConfig) => void;
  onReset: () => void;
  onExport: () => void;
  presets?: Array<{ name: string; description: string; config: SliderThemeConfig }>;
}

export function SliderControls({
  config,
  onUpdate,
  onReset,
  onExport,
  presets = [],
}: SliderControlsProps) {
  // Helper to update nested config
  const update = <K extends keyof SliderThemeConfig>(
    key: K,
    value: SliderThemeConfig[K]
  ) => {
    onUpdate({ ...config, [key]: value });
  };

  const updateRail = <K extends keyof SliderThemeConfig["rail"]>(
    key: K,
    value: SliderThemeConfig["rail"][K]
  ) => {
    onUpdate({ ...config, rail: { ...config.rail, [key]: value } });
  };

  const updateTrack = <K extends keyof SliderThemeConfig["track"]>(
    key: K,
    value: SliderThemeConfig["track"][K]
  ) => {
    onUpdate({ ...config, track: { ...config.track, [key]: value } });
  };

  const updateThumb = <K extends keyof SliderThemeConfig["thumb"]>(
    key: K,
    value: SliderThemeConfig["thumb"][K]
  ) => {
    onUpdate({ ...config, thumb: { ...config.thumb, [key]: value } });
  };

  const updateMark = <K extends keyof SliderThemeConfig["mark"]>(
    key: K,
    value: SliderThemeConfig["mark"][K]
  ) => {
    onUpdate({ ...config, mark: { ...config.mark, [key]: value } });
  };

  const updateValueLabel = <K extends keyof SliderThemeConfig["valueLabel"]>(
    key: K,
    value: SliderThemeConfig["valueLabel"][K]
  ) => {
    onUpdate({ ...config, valueLabel: { ...config.valueLabel, [key]: value } });
  };

  const handlePresetApply = (preset: SliderThemeConfig) => {
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

      {/* Root Settings */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Root Settings
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Height: {config.root.height}px
          </Typography>
          <Slider
            value={config.root.height}
            onChange={(_, v) => update("root", { ...config.root, height: v as number })}
            min={1}
            max={20}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <TextField
          label="Transition Duration"
          value={config.root.transitionDuration}
          onChange={(e) => update("root", { ...config.root, transitionDuration: e.target.value })}
          size="small"
          fullWidth
          placeholder="e.g. 150ms"
        />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Rail (背景轨道) */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Rail (背景轨道)
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Height: {config.rail.height}px
          </Typography>
          <Slider
            value={config.rail.height}
            onChange={(_, v) => updateRail("height", v as number)}
            min={1}
            max={20}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <TextField
          label="Border Radius"
          value={config.rail.borderRadius}
          onChange={(e) => updateRail("borderRadius", e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. 2px"
        />

        <Box>
          <Typography variant="caption" color="text.secondary">
            Opacity: {config.rail.opacity}
          </Typography>
          <Slider
            value={config.rail.opacity}
            onChange={(_, v) => updateRail("opacity", v as number)}
            min={0}
            max={1}
            step={0.1}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <TextField
          label="Background Color"
          value={config.rail.backgroundColor}
          onChange={(e) => updateRail("backgroundColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.rail.backgroundColor,
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

      {/* Track (填充轨道) */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Track (填充轨道)
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Height: {config.track.height}px
          </Typography>
          <Slider
            value={config.track.height}
            onChange={(_, v) => updateTrack("height", v as number)}
            min={1}
            max={20}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <TextField
          label="Border Radius"
          value={config.track.borderRadius}
          onChange={(e) => updateTrack("borderRadius", e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. 2px"
        />

        <Box>
          <Typography variant="caption" color="text.secondary">
            Opacity: {config.track.opacity}
          </Typography>
          <Slider
            value={config.track.opacity}
            onChange={(_, v) => updateTrack("opacity", v as number)}
            min={0}
            max={1}
            step={0.1}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <TextField
          label="Background Color"
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
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Thumb (滑块) */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Thumb (滑块)
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Width: {config.size.medium.thumbWidth}px
          </Typography>
          <Slider
            value={config.size.medium.thumbWidth}
            onChange={(_, v) =>
              update("size", {
                ...config.size,
                medium: { ...config.size.medium, thumbWidth: v as number },
              })
            }
            min={8}
            max={48}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Height: {config.size.medium.thumbHeight}px
          </Typography>
          <Slider
            value={config.size.medium.thumbHeight}
            onChange={(_, v) =>
              update("size", {
                ...config.size,
                medium: { ...config.size.medium, thumbHeight: v as number },
              })
            }
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
              { value: 4, label: "4px" },
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
          placeholder="e.g. 0 2px 6px rgba(0,0,0,0.2)"
        />

        <Box>
          <Typography variant="caption" color="text.secondary">
            Border Width: {config.thumb.borderWidth}px
          </Typography>
          <Slider
            value={config.thumb.borderWidth}
            onChange={(_, v) => updateThumb("borderWidth", v as number)}
            min={0}
            max={8}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <TextField
          label="Normal Color"
          value={config.thumb.color}
          onChange={(e) => updateThumb("color", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.thumb.color,
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
          label="Hover Color"
          value={config.thumb.hoverColor}
          onChange={(e) => updateThumb("hoverColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.thumb.hoverColor,
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
          label="Active Color"
          value={config.thumb.activeColor}
          onChange={(e) => updateThumb("activeColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.thumb.activeColor,
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

      {/* Mark (刻度) */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Mark (刻度)
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Width: {config.mark.width}px
          </Typography>
          <Slider
            value={config.mark.width}
            onChange={(_, v) => updateMark("width", v as number)}
            min={1}
            max={8}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Height: {config.mark.height}px
          </Typography>
          <Slider
            value={config.mark.height}
            onChange={(_, v) => updateMark("height", v as number)}
            min={1}
            max={8}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <TextField
          label="Border Radius"
          value={config.mark.borderRadius}
          onChange={(e) => updateMark("borderRadius", e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. 50%"
        />

        <TextField
          label="Mark Color"
          value={config.mark.backgroundColor}
          onChange={(e) => updateMark("backgroundColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.mark.backgroundColor,
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
          label="Active Mark Color"
          value={config.mark.activeColor}
          onChange={(e) => updateMark("activeColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.mark.activeColor,
                  mr: 1,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
            ),
          }}
        />

        <Box>
          <Typography variant="caption" color="text.secondary">
            Label Font Size: {config.mark.labelFontSize}px
          </Typography>
          <Slider
            value={config.mark.labelFontSize}
            onChange={(_, v) => updateMark("labelFontSize", v as number)}
            min={10}
            max={16}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <TextField
          label="Label Color"
          value={config.mark.labelColor}
          onChange={(e) => updateMark("labelColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.mark.labelColor,
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

      {/* ValueLabel (值标签) */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          ValueLabel (值标签)
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Font Size: {config.valueLabel.fontSize}px
          </Typography>
          <Slider
            value={config.valueLabel.fontSize}
            onChange={(_, v) => updateValueLabel("fontSize", v as number)}
            min={10}
            max={18}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Font Weight: {config.valueLabel.fontWeight}
          </Typography>
          <Slider
            value={config.valueLabel.fontWeight}
            onChange={(_, v) => updateValueLabel("fontWeight", v as number)}
            min={300}
            max={700}
            step={100}
            valueLabelDisplay="auto"
            size="small"
            marks={[
              { value: 300, label: "Light" },
              { value: 400, label: "Regular" },
              { value: 500, label: "Medium" },
              { value: 700, label: "Bold" },
            ]}
          />
        </Box>

        <TextField
          label="Text Color"
          value={config.valueLabel.color}
          onChange={(e) => updateValueLabel("color", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.valueLabel.color,
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
          label="Background Color"
          value={config.valueLabel.backgroundColor}
          onChange={(e) => updateValueLabel("backgroundColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.valueLabel.backgroundColor,
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
          label="Border Radius"
          value={config.valueLabel.borderRadius}
          onChange={(e) => updateValueLabel("borderRadius", e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. 4px"
        />

        <Box>
          <Typography variant="caption" color="text.secondary">
            Padding X: {config.valueLabel.paddingX}px
          </Typography>
          <Slider
            value={config.valueLabel.paddingX}
            onChange={(_, v) => updateValueLabel("paddingX", v as number)}
            min={0}
            max={20}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Padding Y: {config.valueLabel.paddingY}px
          </Typography>
          <Slider
            value={config.valueLabel.paddingY}
            onChange={(_, v) => updateValueLabel("paddingY", v as number)}
            min={0}
            max={16}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <TextField
          label="Box Shadow"
          value={config.valueLabel.shadowBox}
          onChange={(e) => updateValueLabel("shadowBox", e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. 0 2px 8px rgba(0,0,0,0.15)"
        />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Display Options */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Display Options
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={config.showMarks !== false}
              onChange={(e) => update("showMarks", e.target.checked)}
              size="small"
            />
          }
          label="Show Marks"
        />

        <FormControlLabel
          control={
            <Switch
              checked={config.showValueLabel !== false}
              onChange={(e) => update("showValueLabel", e.target.checked)}
              size="small"
            />
          }
          label="Show Value Label"
        />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Export Format */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Export Size Variant
        </Typography>
        <ToggleButtonGroup
          value={config.exportVariant ?? "medium"}
          exclusive
          size="small"
          fullWidth
          onChange={(e, value) => {
            if (value) update("exportVariant", value);
          }}
        >
          <ToggleButton value="small">Small</ToggleButton>
          <ToggleButton value="medium">Medium</ToggleButton>
        </ToggleButtonGroup>
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
