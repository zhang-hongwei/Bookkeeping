/**
 * Glass Presets Panel
 * Right panel with presets organized by effect type and background selector
 */

"use client";

import React, { useRef } from "react";
import { Box, Paper, Typography, Button, Divider, TextField, IconButton, Tooltip } from "@mui/material";
import { Download as ExportIcon, CloudUpload, Link as LinkIcon, Close } from "@mui/icons-material";
import { useGlassStore } from "@/store/glass";
import { getPresetsByType, BACKGROUND_PRESETS } from "../presets";

export function GlassPresetsPanel() {
  const config = useGlassStore((s) => s.config);
  const applyPreset = useGlassStore((s) => s.applyPreset);
  const setBackgroundPreset = useGlassStore((s) => s.setBackgroundPreset);
  const setBackgroundImage = useGlassStore((s) => s.setBackgroundImage);
  const handleFileUpload = useGlassStore((s) => s.handleFileUpload);
  const clearBackgroundImage = useGlassStore((s) => s.clearBackgroundImage);
  const setExportDialogOpen = useGlassStore((s) => s.setExportDialogOpen);
  const reset = useGlassStore((s) => s.reset);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [urlInput, setUrlInput] = React.useState("");
  const [urlMode, setUrlMode] = React.useState(false);

  const presets = getPresetsByType(config.effectType);

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
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Presets */}
      <Typography variant="subtitle2" gutterBottom>
        Presets ({config.effectType === "glassmorphism" ? "Glassmorphism" : config.effectType === "liquidGlass" ? "Liquid Glass" : "Neumorphism"})
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mb: 2 }}>
        {presets.map((preset) => (
          <Box
            key={preset.name}
            onClick={() => applyPreset(preset.name)}
            sx={{
              p: 1.25, borderRadius: 1.5, cursor: "pointer",
              border: 1, borderColor: "divider",
              transition: "all 0.15s",
              "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
            }}
          >
            <Typography variant="caption" fontWeight={600}>{preset.name}</Typography>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: 10 }}>
              {preset.description}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Background selector (only for glass/liquid) */}
      {config.effectType !== "neumorphism" && (
        <>
          <Typography variant="subtitle2" sx={{ mt: 1 }} gutterBottom>
            Background
          </Typography>

          {/* Image source row */}
          <Box sx={{ display: "flex", gap: 0.75, mb: 1 }}>
            <Button
              size="small" variant="outlined" startIcon={<CloudUpload sx={{ fontSize: 14 }} />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ flex: 1, fontSize: 11, textTransform: "none" }}
            >
              Upload
            </Button>
            <Tooltip title="Use image URL">
              <IconButton
                size="small"
                onClick={() => setUrlMode(!urlMode)}
                color={urlMode ? "primary" : "default"}
                sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <input
            ref={fileInputRef} type="file" accept="image/*" hidden
            onChange={handleFileUpload}
          />

          {/* URL input */}
          {urlMode && (
            <Box sx={{ display: "flex", gap: 0.5, mb: 1 }}>
              <TextField
                size="small" placeholder="https://..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && urlInput.trim()) {
                    setBackgroundImage(urlInput.trim());
                  }
                }}
                sx={{ flex: 1, "& input": { fontSize: 11, py: 0.5 } }}
              />
              <Button
                size="small" variant="contained"
                disabled={!urlInput.trim()}
                onClick={() => setBackgroundImage(urlInput.trim())}
                sx={{ minWidth: 40, fontSize: 11 }}
              >
                Go
              </Button>
            </Box>
          )}

          {/* Current image indicator */}
          {config.backgroundImage && (
            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 0.75, mb: 1,
                p: 0.75, borderRadius: 1, bgcolor: "action.hover",
              }}
            >
              <Box
                sx={{
                  width: 28, height: 28, borderRadius: 0.5, flexShrink: 0,
                  backgroundImage: `url(${config.backgroundImage})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                }}
              />
              <Typography variant="caption" noWrap sx={{ flex: 1, fontSize: 10 }}>
                Custom image
              </Typography>
              <IconButton size="small" onClick={clearBackgroundImage} sx={{ p: 0.25 }}>
                <Close sx={{ fontSize: 12 }} />
              </IconButton>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block" }}>
            Gradients
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0.75, mb: 2 }}>
            {BACKGROUND_PRESETS.map((bg) => (
              <Box
                key={bg.name}
                onClick={() => { setBackgroundPreset(bg.value); setUrlInput(""); }}
                title={bg.name}
                sx={{
                  height: 36, borderRadius: 1, cursor: "pointer",
                  backgroundImage: bg.value,
                  border: !config.backgroundImage && config.backgroundPreset === bg.value ? 2 : 1,
                  borderColor: !config.backgroundImage && config.backgroundPreset === bg.value ? "primary.main" : "divider",
                  opacity: config.backgroundImage ? 0.5 : 1,
                  transition: "border-color 0.15s, opacity 0.15s",
                  "&:hover": { borderColor: "primary.light", opacity: config.backgroundImage ? 0.7 : 1 },
                }}
              />
            ))}
          </Box>
          <Divider sx={{ my: 1 }} />
        </>
      )}

      {/* Actions */}
      <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
        <Button
          variant="contained" fullWidth startIcon={<ExportIcon />}
          onClick={() => setExportDialogOpen(true)}
          size="small"
        >
          Export Code
        </Button>
        <Button variant="outlined" fullWidth onClick={reset} size="small" color="inherit">
          Reset
        </Button>
      </Box>
    </Paper>
  );
}
