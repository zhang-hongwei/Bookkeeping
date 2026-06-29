/**
 * MUI Tabs Theme Designer - Control Panel
 * All configurable parameters for MUI Tabs customization
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
import type { TabsThemeConfig } from "../types";

interface TabsControlsProps {
  config: TabsThemeConfig;
  onUpdate: (config: TabsThemeConfig) => void;
  onReset: () => void;
  onExport: () => void;
  presets?: Array<{ name: string; description: string; config: TabsThemeConfig }>;
}

export function TabsControls({
  config,
  onUpdate,
  onReset,
  onExport,
  presets = [],
}: TabsControlsProps) {
  // Helper to update nested config
  const update = <K extends keyof TabsThemeConfig>(
    key: K,
    value: TabsThemeConfig[K]
  ) => {
    onUpdate({ ...config, [key]: value });
  };

  const updateTab = <K extends keyof TabsThemeConfig["tab"]>(
    key: K,
    value: TabsThemeConfig["tab"][K]
  ) => {
    onUpdate({ ...config, tab: { ...config.tab, [key]: value } });
  };

  const updateIndicator = <K extends keyof TabsThemeConfig["indicator"]>(
    key: K,
    value: TabsThemeConfig["indicator"][K]
  ) => {
    onUpdate({ ...config, indicator: { ...config.indicator, [key]: value } });
  };

  const updateRoot = <K extends keyof TabsThemeConfig["root"]>(
    key: K,
    value: TabsThemeConfig["root"][K]
  ) => {
    onUpdate({ ...config, root: { ...config.root, [key]: value } });
  };

  const updateFlexContainer = <K extends keyof TabsThemeConfig["flexContainer"]>(
    key: K,
    value: TabsThemeConfig["flexContainer"][K]
  ) => {
    onUpdate({ ...config, flexContainer: { ...config.flexContainer, [key]: value } });
  };

  const updateScrollButtons = <K extends keyof TabsThemeConfig["scrollButtons"]>(
    key: K,
    value: TabsThemeConfig["scrollButtons"][K]
  ) => {
    onUpdate({ ...config, scrollButtons: { ...config.scrollButtons, [key]: value } });
  };

  const handlePresetApply = (preset: TabsThemeConfig) => {
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

      {/* Variant Selection */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Variant
        </Typography>
        <ToggleButtonGroup
          value={config.variant}
          exclusive
          size="small"
          fullWidth
          onChange={(e, value) => {
            if (value) update("variant", value);
          }}
        >
          <ToggleButton value="standard">Standard</ToggleButton>
          <ToggleButton value="scrollable">Scrollable</ToggleButton>
          <ToggleButton value="fullWidth">Full Width</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Root Settings */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Root Settings
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Min Height: {config.root.minHeight}px
          </Typography>
          <Slider
            value={config.root.minHeight}
            onChange={(_, v) => updateRoot("minHeight", v as number)}
            min={32}
            max={80}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <TextField
          label="Background Color"
          value={config.root.backgroundColor}
          onChange={(e) => updateRoot("backgroundColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.root.backgroundColor,
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

      {/* Tab Settings */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Tab Settings
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Min Height: {config.tab.minHeight}px
          </Typography>
          <Slider
            value={config.tab.minHeight}
            onChange={(_, v) => updateTab("minHeight", v as number)}
            min={32}
            max={80}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Padding X: {config.tab.paddingX}px
          </Typography>
          <Slider
            value={config.tab.paddingX}
            onChange={(_, v) => updateTab("paddingX", v as number)}
            min={0}
            max={32}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Font Size: {config.tab.fontSize}px
          </Typography>
          <Slider
            value={config.tab.fontSize}
            onChange={(_, v) => updateTab("fontSize", v as number)}
            min={11}
            max={18}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Font Weight: {config.tab.fontWeight}
          </Typography>
          <Slider
            value={config.tab.fontWeight}
            onChange={(_, v) => updateTab("fontWeight", v as number)}
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
          value={config.tab.textTransform}
          exclusive
          size="small"
          fullWidth
          onChange={(e, value) => {
            if (value) updateTab("textTransform", value);
          }}
        >
          <ToggleButton value="none">None</ToggleButton>
          <ToggleButton value="uppercase">UPPER</ToggleButton>
          <ToggleButton value="capitalize">Cap</ToggleButton>
          <ToggleButton value="lowercase">lower</ToggleButton>
        </ToggleButtonGroup>

        <TextField
          label="Default Color"
          value={config.tab.color}
          onChange={(e) => updateTab("color", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.tab.color,
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
          value={config.tab.hoverColor}
          onChange={(e) => updateTab("hoverColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.tab.hoverColor,
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
          value={config.tab.selectedColor}
          onChange={(e) => updateTab("selectedColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.tab.selectedColor,
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
          value={config.tab.selectedBackgroundColor}
          onChange={(e) => updateTab("selectedBackgroundColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.tab.selectedBackgroundColor,
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
          value={config.tab.borderRadius}
          onChange={(e) => updateTab("borderRadius", e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. 4px"
        />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Indicator Settings */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Indicator (下划线)
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Height: {config.indicator.height}px
          </Typography>
          <Slider
            value={config.indicator.height}
            onChange={(_, v) => updateIndicator("height", v as number)}
            min={0}
            max={8}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <TextField
          label="Background Color"
          value={config.indicator.backgroundColor}
          onChange={(e) => updateIndicator("backgroundColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.indicator.backgroundColor,
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
          value={config.indicator.borderRadius}
          onChange={(e) => updateIndicator("borderRadius", e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. 2px"
        />

        <TextField
          label="Transition Duration"
          value={config.indicator.transitionDuration}
          onChange={(e) => updateIndicator("transitionDuration", e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. 250ms"
        />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Spacing */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Spacing (Gap)
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Gap: {config.flexContainer.gap}px
          </Typography>
          <Slider
            value={config.flexContainer.gap}
            onChange={(_, v) => updateFlexContainer("gap", v as number)}
            min={0}
            max={16}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <TextField
          label="Scroll Buttons Color"
          value={config.scrollButtons.color}
          onChange={(e) => updateScrollButtons("color", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.scrollButtons.color,
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

      {/* Export Format */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Export Variant
        </Typography>
        <ToggleButtonGroup
          value={config.exportVariant ?? config.variant}
          exclusive
          size="small"
          fullWidth
          onChange={(e, value) => {
            if (value) update("exportVariant", value);
          }}
        >
          <ToggleButton value="standard">Standard</ToggleButton>
          <ToggleButton value="scrollable">Scrollable</ToggleButton>
          <ToggleButton value="fullWidth">Full Width</ToggleButton>
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
