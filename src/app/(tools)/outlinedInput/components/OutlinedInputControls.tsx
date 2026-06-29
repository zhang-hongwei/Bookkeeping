/**
 * MUI OutlinedInput Theme Designer - Control Panel
 * Writes directly to Zustand store for zero-prop-drilling updates
 */

"use client";

import React from "react";
import {
  Box,
  Typography,
  Stack,
  Slider,
  TextField,
  Divider,
  Button,
} from "@mui/material";
import type { OutlinedInputThemeConfig } from "../types";
import { useOutlinedInputStore } from "../store";

const selector = (s: {
  config: OutlinedInputThemeConfig;
  updateSection: <K extends keyof OutlinedInputThemeConfig>(
    section: K,
    updates: Partial<OutlinedInputThemeConfig[K]>,
  ) => void;
  updateConfig: (config: OutlinedInputThemeConfig) => void;
  reset: () => void;
  setExportDialogOpen: (open: boolean) => void;
}) => s;

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

const ColorField = React.memo(function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      type="color"
      slotProps={{
        input: {
          startAdornment: (
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: value,
                mr: 1,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            />
          ),
        },
      }}
    />
  );
});

export function OutlinedInputControls() {
  const { config, updateSection, reset, setExportDialogOpen } =
    useOutlinedInputStore(selector);

  return (
    <Stack spacing={1} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Presets */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Presets
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {/* Presets will be wired separately */}
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Border */}
      <Typography variant="subtitle2" fontWeight={600}>
        Border
      </Typography>
      <Stack spacing={1.5}>
        <ColorField
          label="Border Color"
          value={config.border.borderColor}
          onChange={(v) => updateSection("border", { borderColor: v })}
        />
        <Box>
          <Typography variant="caption" color="text.secondary">
            Width: {config.border.borderWidth}px
          </Typography>
          <Slider
            value={config.border.borderWidth}
            onChange={(_, v) => updateSection("border", { borderWidth: v as number })}
            min={0}
            max={4}
            step={0.5}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>
        <TextField
          label="Border Radius"
          value={config.border.borderRadius}
          onChange={(e) => updateSection("border", { borderRadius: e.target.value })}
          size="small"
          fullWidth
          placeholder="e.g. 4px, 50%"
        />
        <ColorField
          label="Hover Color"
          value={config.border.hoverBorderColor}
          onChange={(v) => updateSection("border", { hoverBorderColor: v })}
        />
        <ColorField
          label="Focus Color"
          value={config.border.focusBorderColor}
          onChange={(v) => updateSection("border", { focusBorderColor: v })}
        />
        <ColorField
          label="Error Color"
          value={config.border.errorBorderColor}
          onChange={(v) => updateSection("border", { errorBorderColor: v })}
        />
        <ColorField
          label="Disabled Color"
          value={config.border.disabledBorderColor}
          onChange={(v) => updateSection("border", { disabledBorderColor: v })}
        />
      </Stack>

      <Divider sx={{ my: 1 }} />

      {/* Input */}
      <Typography variant="subtitle2" fontWeight={600}>
        Input
      </Typography>
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Height: {config.input.height}px
          </Typography>
          <Slider
            value={config.input.height}
            onChange={(_, v) => updateSection("input", { height: v as number })}
            min={36}
            max={80}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Padding: {config.input.padding}px
          </Typography>
          <Slider
            value={config.input.padding}
            onChange={(_, v) => updateSection("input", { padding: v as number })}
            min={4}
            max={24}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Font Size: {config.input.fontSize}px
          </Typography>
          <Slider
            value={config.input.fontSize}
            onChange={(_, v) => updateSection("input", { fontSize: v as number })}
            min={12}
            max={24}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Font Weight: {config.input.fontWeight}
          </Typography>
          <Slider
            value={config.input.fontWeight}
            onChange={(_, v) => updateSection("input", { fontWeight: v as number })}
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
        <ColorField
          label="Text Color"
          value={config.input.color}
          onChange={(v) => updateSection("input", { color: v })}
        />
        <ColorField
          label="Placeholder Color"
          value={config.input.placeholderColor}
          onChange={(v) => updateSection("input", { placeholderColor: v })}
        />
        <ColorField
          label="Disabled Color"
          value={config.input.disabledColor}
          onChange={(v) => updateSection("input", { disabledColor: v })}
        />
        <ColorField
          label="Background"
          value={config.input.backgroundColor}
          onChange={(v) => updateSection("input", { backgroundColor: v })}
        />
      </Stack>

      <Divider sx={{ my: 1 }} />

      {/* Adornment */}
      <Typography variant="subtitle2" fontWeight={600}>
        Adornment
      </Typography>
      <Stack spacing={1.5}>
        <ColorField
          label="Color"
          value={config.adornment.color}
          onChange={(v) => updateSection("adornment", { color: v })}
        />
        <ColorField
          label="Hover Color"
          value={config.adornment.hoverColor}
          onChange={(v) => updateSection("adornment", { hoverColor: v })}
        />
        <Box>
          <Typography variant="caption" color="text.secondary">
            Icon Size: {config.adornment.fontSize}px
          </Typography>
          <Slider
            value={config.adornment.fontSize}
            onChange={(_, v) => updateSection("adornment", { fontSize: v as number })}
            min={16}
            max={32}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>
      </Stack>

      <Divider sx={{ my: 1 }} />

      {/* Notch / Legend */}
      <Typography variant="subtitle2" fontWeight={600}>
        Notch / Legend
      </Typography>
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Legend Font Size: {config.notch.legendFontSize}px
          </Typography>
          <Slider
            value={config.notch.legendFontSize}
            onChange={(_, v) => updateSection("notch", { legendFontSize: v as number })}
            min={10}
            max={16}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>
        <ColorField
          label="Legend Color"
          value={config.notch.legendColor}
          onChange={(v) => updateSection("notch", { legendColor: v })}
        />
        <ColorField
          label="Legend Focus Color"
          value={config.notch.legendFocusColor}
          onChange={(v) => updateSection("notch", { legendFocusColor: v })}
        />
      </Stack>

      {/* Actions */}
      <Box sx={{ mt: "auto", display: "flex", gap: 1, pt: 2 }}>
        <Button variant="contained" fullWidth onClick={() => setExportDialogOpen(true)}>
          Export
        </Button>
        <Button variant="outlined" onClick={reset}>
          Reset
        </Button>
      </Box>
    </Stack>
  );
}
