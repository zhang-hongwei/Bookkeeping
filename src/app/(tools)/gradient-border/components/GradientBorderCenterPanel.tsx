/**
 * Center panel: preview, live CSS output, and preview size controls
 */

"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Popover,
} from "@mui/material";
import { ContentCopy as CopyIcon, Check as CheckIcon } from "@mui/icons-material";
import { RgbaColorPicker } from "react-colorful";
import { GradientBorderPreview } from "./GradientBorderPreview";
import { generateCSS } from "../utils";
import { useGradientBorderStore } from "@/store/gradient-border";

const PREVIEW_BG_COLORS = [
  { value: "#ffffff" },
  { value: "#1a1a2e" },
  { value: "transparent" },
];

function BgColorPicker({
  color,
  opacity,
  onChange,
}: {
  color: string;
  opacity: number;
  onChange: (color: string, opacity: number) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isCustom = !PREVIEW_BG_COLORS.some((c) => c.value === color);
  const hexColor = color.startsWith("#") ? color : "#ffffff";

  const rgbaColor = useMemo(() => {
    const h = hexColor.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a: opacity / 100,
    };
  }, [hexColor, opacity]);

  const handleChange = useCallback(
    (rgba: { r: number; g: number; b: number; a: number }) => {
      const toHex = (n: number) => n.toString(16).padStart(2, "0");
      onChange(`#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`, Math.round(rgba.a * 100));
    },
    [onChange],
  );

  return (
    <>
      <Tooltip title="Custom background color">
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            width: 24,
            height: 24,
            p: 0,
            borderRadius: "50%",
            border: isCustom ? `2px solid ${hexColor}` : "1px dashed rgba(0,0,0,0.3)",
          }}
        >
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundImage: `linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
                linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
                linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)`,
              backgroundSize: "6px 6px",
              backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0",
            }}
          />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { p: 1.5 } } }}
      >
        <Box
          sx={{
            "& .react-colorful": { width: 200, height: 200 },
            "& .react-colorful__saturation": { borderRadius: "6px 6px 0 0" },
            "& .react-colorful__hue": { height: 14, borderRadius: 3, mt: 0.5 },
            "& .react-colorful__alpha": { height: 14, borderRadius: 3, mt: 0.5 },
            "& .react-colorful__pointer": { width: 16, height: 16 },
          }}
        >
          <RgbaColorPicker color={rgbaColor} onChange={handleChange} />
        </Box>
      </Popover>
    </>
  );
}

export function GradientBorderCenterPanel() {
  const config = useGradientBorderStore((s) => s.config);
  const copied = useGradientBorderStore((s) => s.copied);
  const updateConfig = useGradientBorderStore((s) => s.updateConfig);
  const copyCSS = useGradientBorderStore((s) => s.copyCSS);

  return (
    <Stack spacing={2.5} sx={{ position: { lg: "sticky" }, top: 16 }}>
      {/* Preview */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">Preview</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Preview size */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Size</Typography>
              <TextField
                value={config.previewWidth}
                onChange={(e) => updateConfig({ previewWidth: Number(e.target.value) })}
                type="number" size="small" variant="outlined"
                sx={{ width: 76, "& input": { py: 0.4, px: 1, fontSize: 12, textAlign: "center" } }}
                slotProps={{ htmlInput: { min: 100, max: 1200 } }}
              />
              <Typography variant="caption" color="text.secondary">&times;</Typography>
              <TextField
                value={config.previewHeight}
                onChange={(e) => updateConfig({ previewHeight: Number(e.target.value) })}
                type="number" size="small" variant="outlined"
                sx={{ width: 76, "& input": { py: 0.4, px: 1, fontSize: 12, textAlign: "center" } }}
                slotProps={{ htmlInput: { min: 100, max: 800 } }}
              />
            </Box>

            {/* Divider */}
            <Box sx={{ width: 1, height: 20, bgcolor: "divider" }} />

            {/* Preset bg colors */}
            {PREVIEW_BG_COLORS.map((item) => (
              <IconButton
                key={item.value}
                size="small"
                onClick={() => updateConfig({ previewBgColor: item.value })}
                sx={{
                  width: 24,
                  height: 24,
                  p: 0,
                  borderRadius: "50%",
                  border: (theme) =>
                    config.previewBgColor === item.value
                      ? `2px solid ${theme.palette.primary.main}`
                      : "1px solid rgba(0,0,0,0.12)",
                  bgcolor: item.value === "transparent" ? undefined : item.value,
                  backgroundImage: item.value === "transparent"
                    ? `linear-gradient(45deg, #ccc 25%, transparent 25%),
                       linear-gradient(-45deg, #ccc 25%, transparent 25%),
                       linear-gradient(45deg, transparent 75%, #ccc 75%),
                       linear-gradient(-45deg, transparent 75%, #ccc 75%)`
                    : undefined,
                  backgroundSize: item.value === "transparent" ? "8px 8px" : undefined,
                  backgroundPosition: item.value === "transparent" ? "0 0, 0 4px, 4px -4px, -4px 0" : undefined,
                }}
              />
            ))}

            {/* Custom bg color (react-colorful) */}
            <BgColorPicker
              color={config.previewBgColor}
              opacity={config.previewBgOpacity ?? 100}
              onChange={(c, o) => updateConfig({ previewBgColor: c, previewBgOpacity: o })}
            />
          </Box>
        </Box>

        <GradientBorderPreview config={config} />
      </Paper>

      {/* Live CSS */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Live CSS</Typography>
            <Chip label={config.implementation} size="small" variant="outlined" color="primary" />
          </Box>
          <Tooltip title={copied ? "Copied!" : "Copy CSS"}>
            <IconButton size="small" onClick={copyCSS}>
              {copied ? <CheckIcon fontSize="small" color="success" /> : <CopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
        <Paper
          variant="outlined"
          sx={{ p: 2, fontFamily: "monospace", fontSize: 13, bgcolor: "action.hover", whiteSpace: "pre-wrap", overflow: "auto" }}
        >
          {generateCSS(config)}
        </Paper>
      </Paper>
    </Stack>
  );
}
