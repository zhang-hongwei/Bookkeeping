/**
 * MUI ToggleButton Theme Designer - Control Panel
 * All configurable parameters for MUI ToggleButton customization
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
import type { ToggleButtonThemeConfig } from "../types";

interface ToggleButtonControlsProps {
  config: ToggleButtonThemeConfig;
  onUpdate: (config: ToggleButtonThemeConfig) => void;
  onReset: () => void;
  onExport: () => void;
  presets?: Array<{ name: string; description: string; config: ToggleButtonThemeConfig }>;
}

export function ToggleButtonControls({
  config,
  onUpdate,
  onReset,
  onExport,
  presets = [],
}: ToggleButtonControlsProps) {
  // Helper to update nested config
  const update = <K extends keyof ToggleButtonThemeConfig>(
    key: K,
    value: ToggleButtonThemeConfig[K]
  ) => {
    onUpdate({ ...config, [key]: value });
  };

  const updateButton = <K extends keyof ToggleButtonThemeConfig["button"]>(
    key: K,
    value: ToggleButtonThemeConfig["button"][K]
  ) => {
    onUpdate({ ...config, button: { ...config.button, [key]: value } });
  };

  const updateGroup = <K extends keyof ToggleButtonThemeConfig["group"]>(
    key: K,
    value: ToggleButtonThemeConfig["group"][K]
  ) => {
    onUpdate({ ...config, group: { ...config.group, [key]: value } });
  };

  const handlePresetApply = (preset: ToggleButtonThemeConfig) => {
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

      {/* Button Settings */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Button Settings
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Min Height: {config.button.minHeight}px
          </Typography>
          <Slider
            value={config.button.minHeight}
            onChange={(_, v) => updateButton("minHeight", v as number)}
            min={24}
            max={64}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Padding X: {config.button.paddingX}px
          </Typography>
          <Slider
            value={config.button.paddingX}
            onChange={(_, v) => updateButton("paddingX", v as number)}
            min={4}
            max={32}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Font Size: {config.button.fontSize}px
          </Typography>
          <Slider
            value={config.button.fontSize}
            onChange={(_, v) => updateButton("fontSize", v as number)}
            min={11}
            max={18}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Font Weight: {config.button.fontWeight}
          </Typography>
          <Slider
            value={config.button.fontWeight}
            onChange={(_, v) => updateButton("fontWeight", v as number)}
            min={300}
            max={700}
            step={100}
            valueLabelDisplay="auto"
            size="small"
            marks={[
              { value: 300, label: "Light" },
              { value: 400, label: "Regular" },
              { value: 500, label: "Medium" },
              { value: 600, label: "SemiBold" },
              { value: 700, label: "Bold" },
            ]}
          />
        </Box>

        <ToggleButtonGroup
          value={config.button.textTransform}
          exclusive
          size="small"
          fullWidth
          onChange={(e, value) => {
            if (value) updateButton("textTransform", value);
          }}
        >
          <ToggleButton value="none">None</ToggleButton>
          <ToggleButton value="uppercase">UPPER</ToggleButton>
          <ToggleButton value="capitalize">Cap</ToggleButton>
          <ToggleButton value="lowercase">lower</ToggleButton>
        </ToggleButtonGroup>

        <TextField
          label="Border Radius"
          value={config.button.borderRadius}
          onChange={(e) => updateButton("borderRadius", e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. 4px"
        />

        <TextField
          label="Default Color"
          value={config.button.defaultColor}
          onChange={(e) => updateButton("defaultColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.button.defaultColor,
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
          label="Default Background Color"
          value={config.button.defaultBackgroundColor}
          onChange={(e) => updateButton("defaultBackgroundColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.button.defaultBackgroundColor,
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
          value={config.button.hoverColor}
          onChange={(e) => updateButton("hoverColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.button.hoverColor,
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
          label="Hover Background Color"
          value={config.button.hoverBackgroundColor}
          onChange={(e) => updateButton("hoverBackgroundColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.button.hoverBackgroundColor,
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
          label="Selected Color"
          value={config.button.selectedColor}
          onChange={(e) => updateButton("selectedColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.button.selectedColor,
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
          label="Selected Background Color"
          value={config.button.selectedBackgroundColor}
          onChange={(e) => updateButton("selectedBackgroundColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.button.selectedBackgroundColor,
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
            Border Width: {config.button.borderWidth}px
          </Typography>
          <Slider
            value={config.button.borderWidth}
            onChange={(_, v) => updateButton("borderWidth", v as number)}
            min={0}
            max={4}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <TextField
          label="Border Color"
          value={config.button.borderColor}
          onChange={(e) => updateButton("borderColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.button.borderColor,
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

      {/* Group Settings */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Group Settings
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Gap: {config.group.gap}px
          </Typography>
          <Slider
            value={config.group.gap}
            onChange={(_, v) => updateGroup("gap", v as number)}
            min={0}
            max={16}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <TextField
          label="Group Background Color"
          value={config.group.backgroundColor}
          onChange={(e) => updateGroup("backgroundColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.group.backgroundColor,
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
          label="Group Border Radius"
          value={config.group.borderRadius}
          onChange={(e) => updateGroup("borderRadius", e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. 4px"
        />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Export Format */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Export Style
        </Typography>
        <ToggleButtonGroup
          value={config.exportVariant ?? "standard"}
          exclusive
          size="small"
          fullWidth
          onChange={(e, value) => {
            if (value) update("exportVariant", value);
          }}
        >
          <ToggleButton value="standard">Standard</ToggleButton>
          <ToggleButton value="outlined">Outlined</ToggleButton>
          <ToggleButton value="contained">Contained</ToggleButton>
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
