/**
 * MUI TextField Theme Designer - Control Panel
 * All configurable parameters for MUI TextField customization
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
import type { TextFieldThemeConfig } from "../types";

interface TextFieldControlsProps {
  config: TextFieldThemeConfig;
  onUpdate: (config: TextFieldThemeConfig) => void;
  onReset: () => void;
  onExport: () => void;
  presets?: Array<{ name: string; description: string; config: TextFieldThemeConfig }>;
}

export function TextFieldControls({
  config,
  onUpdate,
  onReset,
  onExport,
  presets = [],
}: TextFieldControlsProps) {
  // Helper to update nested config
  const update = <K extends keyof TextFieldThemeConfig>(
    key: K,
    value: TextFieldThemeConfig[K]
  ) => {
    onUpdate({ ...config, [key]: value });
  };

  const updateInputBase = <K extends keyof TextFieldThemeConfig["inputBase"]>(
    key: K,
    value: TextFieldThemeConfig["inputBase"][K]
  ) => {
    onUpdate({ ...config, inputBase: { ...config.inputBase, [key]: value } });
  };

  const updateOutlined = <K extends keyof TextFieldThemeConfig["outlined"]>(
    key: K,
    value: TextFieldThemeConfig["outlined"][K]
  ) => {
    onUpdate({ ...config, outlined: { ...config.outlined, [key]: value } });
  };

  const updateFilled = <K extends keyof TextFieldThemeConfig["filled"]>(
    key: K,
    value: TextFieldThemeConfig["filled"][K]
  ) => {
    onUpdate({ ...config, filled: { ...config.filled, [key]: value } });
  };

  const updateStandard = <K extends keyof TextFieldThemeConfig["standard"]>(
    key: K,
    value: TextFieldThemeConfig["standard"][K]
  ) => {
    onUpdate({ ...config, standard: { ...config.standard, [key]: value } });
  };

  const updateLabel = <K extends keyof TextFieldThemeConfig["label"]>(
    key: K,
    value: TextFieldThemeConfig["label"][K]
  ) => {
    onUpdate({ ...config, label: { ...config.label, [key]: value } });
  };

  const updateHelperText = <K extends keyof TextFieldThemeConfig["helperText"]>(
    key: K,
    value: TextFieldThemeConfig["helperText"][K]
  ) => {
    onUpdate({ ...config, helperText: { ...config.helperText, [key]: value } });
  };

  const updateAdornment = <K extends keyof TextFieldThemeConfig["adornment"]>(
    key: K,
    value: TextFieldThemeConfig["adornment"][K]
  ) => {
    onUpdate({ ...config, adornment: { ...config.adornment, [key]: value } });
  };

  const handlePresetApply = (preset: TextFieldThemeConfig) => {
    onUpdate(preset);
  };

  const currentVariant = config.variant;

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
          <ToggleButton value="outlined">Outlined</ToggleButton>
          <ToggleButton value="filled">Filled</ToggleButton>
          <ToggleButton value="standard">Standard</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Input Base Settings */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Input Base
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Height: {config.inputBase.height}px
          </Typography>
          <Slider
            value={config.inputBase.height}
            onChange={(_, v) => updateInputBase("height", v as number)}
            min={32}
            max={80}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Padding: {config.inputBase.padding}px
          </Typography>
          <Slider
            value={config.inputBase.padding}
            onChange={(_, v) => updateInputBase("padding", v as number)}
            min={0}
            max={30}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Font Size: {config.inputBase.fontSize}px
          </Typography>
          <Slider
            value={config.inputBase.fontSize}
            onChange={(_, v) => updateInputBase("fontSize", v as number)}
            min={12}
            max={24}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Font Weight: {config.inputBase.fontWeight}
          </Typography>
          <Slider
            value={config.inputBase.fontWeight}
            onChange={(_, v) => updateInputBase("fontWeight", v as number)}
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
          label="Input Color"
          value={config.inputBase.color}
          onChange={(e) => updateInputBase("color", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.inputBase.color,
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

      {/* Variant-specific settings */}
      {currentVariant === "outlined" && (
        <>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Outlined Variant
            </Typography>

            <TextField
              label="Border Color"
              value={config.outlined.borderColor}
              onChange={(e) => updateOutlined("borderColor", e.target.value)}
              size="small"
              fullWidth
              type="color"
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: config.outlined.borderColor,
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
                Border Width: {config.outlined.borderWidth}px
              </Typography>
              <Slider
                value={config.outlined.borderWidth}
                onChange={(_, v) => updateOutlined("borderWidth", v as number)}
                min={1}
                max={4}
                valueLabelDisplay="auto"
                size="small"
              />
            </Box>

            <TextField
              label="Border Radius"
              value={config.outlined.borderRadius}
              onChange={(e) => updateOutlined("borderRadius", e.target.value)}
              size="small"
              fullWidth
              placeholder="e.g. 4px"
            />

            <TextField
              label="Hover Border Color"
              value={config.outlined.hoverBorderColor}
              onChange={(e) => updateOutlined("hoverBorderColor", e.target.value)}
              size="small"
              fullWidth
              type="color"
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: config.outlined.hoverBorderColor,
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
              label="Focus Border Color"
              value={config.outlined.focusBorderColor}
              onChange={(e) => updateOutlined("focusBorderColor", e.target.value)}
              size="small"
              fullWidth
              type="color"
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: config.outlined.focusBorderColor,
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
              label="Error Border Color"
              value={config.outlined.errorBorderColor}
              onChange={(e) => updateOutlined("errorBorderColor", e.target.value)}
              size="small"
              fullWidth
              type="color"
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: config.outlined.errorBorderColor,
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
        </>
      )}

      {currentVariant === "filled" && (
        <>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Filled Variant
            </Typography>

            <TextField
              label="Background Color"
              value={config.filled.backgroundColor}
              onChange={(e) => updateFilled("backgroundColor", e.target.value)}
              size="small"
              fullWidth
              type="color"
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: config.filled.backgroundColor,
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
              value={config.filled.hoverBackgroundColor}
              onChange={(e) => updateFilled("hoverBackgroundColor", e.target.value)}
              size="small"
              fullWidth
              type="color"
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: config.filled.hoverBackgroundColor,
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
              label="Focus Background Color"
              value={config.filled.focusBackgroundColor}
              onChange={(e) => updateFilled("focusBackgroundColor", e.target.value)}
              size="small"
              fullWidth
              type="color"
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: config.filled.focusBackgroundColor,
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
              value={config.filled.borderRadius}
              onChange={(e) => updateFilled("borderRadius", e.target.value)}
              size="small"
              fullWidth
              placeholder="e.g. 4px"
            />
          </Stack>

          <Divider sx={{ my: 1.5 }} />
        </>
      )}

      {currentVariant === "standard" && (
        <>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Standard Variant
            </Typography>

            <TextField
              label="Border Bottom Color"
              value={config.standard.borderBottomColor}
              onChange={(e) => updateStandard("borderBottomColor", e.target.value)}
              size="small"
              fullWidth
              type="color"
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: config.standard.borderBottomColor,
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
                Border Bottom Width: {config.standard.borderBottomWidth}px
              </Typography>
              <Slider
                value={config.standard.borderBottomWidth}
                onChange={(_, v) => updateStandard("borderBottomWidth", v as number)}
                min={1}
                max={4}
                valueLabelDisplay="auto"
                size="small"
              />
            </Box>

            <TextField
              label="Hover Border Bottom Color"
              value={config.standard.hoverBorderBottomColor}
              onChange={(e) => updateStandard("hoverBorderBottomColor", e.target.value)}
              size="small"
              fullWidth
              type="color"
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: config.standard.hoverBorderBottomColor,
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
              label="Focus Border Bottom Color"
              value={config.standard.focusBorderBottomColor}
              onChange={(e) => updateStandard("focusBorderBottomColor", e.target.value)}
              size="small"
              fullWidth
              type="color"
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: config.standard.focusBorderBottomColor,
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
        </>
      )}

      {/* Label Settings */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Label
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Font Size: {config.label.fontSize}px
          </Typography>
          <Slider
            value={config.label.fontSize}
            onChange={(_, v) => updateLabel("fontSize", v as number)}
            min={12}
            max={20}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Font Weight: {config.label.fontWeight}
          </Typography>
          <Slider
            value={config.label.fontWeight}
            onChange={(_, v) => updateLabel("fontWeight", v as number)}
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
          label="Label Color"
          value={config.label.color}
          onChange={(e) => updateLabel("color", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.label.color,
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
          label="Focus Label Color"
          value={config.label.focusColor}
          onChange={(e) => updateLabel("focusColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.label.focusColor,
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
          label="Error Label Color"
          value={config.label.errorColor}
          onChange={(e) => updateLabel("errorColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.label.errorColor,
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

      {/* Helper Text Settings */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Helper Text
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Font Size: {config.helperText.fontSize}px
          </Typography>
          <Slider
            value={config.helperText.fontSize}
            onChange={(_, v) => updateHelperText("fontSize", v as number)}
            min={10}
            max={16}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        <TextField
          label="Helper Text Color"
          value={config.helperText.color}
          onChange={(e) => updateHelperText("color", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.helperText.color,
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
          label="Error Helper Text Color"
          value={config.helperText.errorColor}
          onChange={(e) => updateHelperText("errorColor", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.helperText.errorColor,
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

      {/* Adornment Settings */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Adornment (Icons)
        </Typography>

        <TextField
          label="Adornment Color"
          value={config.adornment.color}
          onChange={(e) => updateAdornment("color", e.target.value)}
          size="small"
          fullWidth
          type="color"
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: config.adornment.color,
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
            Icon Size: {config.adornment.fontSize}px
          </Typography>
          <Slider
            value={config.adornment.fontSize}
            onChange={(_, v) => updateAdornment("fontSize", v as number)}
            min={16}
            max={32}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Export Format */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Export Variant
        </Typography>
        <ToggleButtonGroup
          value={config.exportVariant ?? currentVariant}
          exclusive
          size="small"
          fullWidth
          onChange={(e, value) => {
            if (value) update("exportVariant", value);
          }}
        >
          <ToggleButton value="outlined">Outlined</ToggleButton>
          <ToggleButton value="filled">Filled</ToggleButton>
          <ToggleButton value="standard">Standard</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary">
          Export code for specific variant
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
