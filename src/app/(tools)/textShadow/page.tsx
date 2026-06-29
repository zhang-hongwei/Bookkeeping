/**
 * Text Shadow Editor Page
 * Visual text shadow editor with presets
 */

"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
  Slider,
  Button,
  Chip,
  TextField,
  IconButton,
  Grid,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { TEXT_SHADOW_PRESETS, getPresetByName } from "./presets";
import type { TextShadowLayer } from "./types";
import { generateTextShadowCSS, generateCode } from "./utils";

const DEFAULT_LAYER: TextShadowLayer = {
  offsetX: 2,
  offsetY: 2,
  blur: 4,
  color: "#000000",
  opacity: 0.25,
};

export default function TextShadowEditorPage() {
  const [layers, setLayers] = useState<TextShadowLayer[]>([DEFAULT_LAYER]);
  const [text, setText] = useState("Text Shadow");
  const [textColor, setTextColor] = useState("#333333");
  const [fontSize, setFontSize] = useState(48);
  const [bgColor, setBgColor] = useState("#f5f5f5");
  const [copied, setCopied] = useState(false);

  const addLayer = () => {
    setLayers([...layers, { ...DEFAULT_LAYER }]);
  };

  const removeLayer = (index: number) => {
    setLayers(layers.filter((_, i) => i !== index));
  };

  const updateLayer = (index: number, key: keyof TextShadowLayer, value: number | string) => {
    setLayers(
      layers.map((layer, i) =>
        i === index ? { ...layer, [key]: value } : layer
      )
    );
  };

  const handlePresetApply = (presetName: string) => {
    const preset = getPresetByName(presetName);
    if (preset) {
      setLayers(preset.layers);
    }
  };

  const handleCopy = async (format: string) => {
    const code = generateCode(layers, format as any);
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Page header */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Text Shadow Editor
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create beautiful text shadow effects with real-time preview
            </Typography>
          </Box>

          <Divider />

          {/* Main editing area */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "400px 1fr" },
              gap: 3,
              alignItems: "start",
            }}
          >
            {/* Left: Control panel */}
            <Paper
              elevation={2}
              sx={{
                p: 2,
                height: { xs: "auto", md: "calc(100vh - 200px)" },
                display: "flex",
                flexDirection: "column",
                position: { xs: "relative", md: "sticky" },
                top: { xs: 0, md: 24 },
                overflow: "auto",
              }}
            >
              {/* Presets */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Presets
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {TEXT_SHADOW_PRESETS.map((preset) => (
                    <Chip
                      key={preset.name}
                      label={preset.name}
                      onClick={() => handlePresetApply(preset.name)}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Preview settings */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preview Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      label="Text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={4}>
                    <TextField
                      label="Color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      size="small"
                      type="color"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={4}>
                    <TextField
                      label="Size"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      size="small"
                      type="number"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={4}>
                    <TextField
                      label="Background"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      size="small"
                      type="color"
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Shadow layers */}
              <Box sx={{ flex: 1, overflow: "auto" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle2">
                    Shadow Layers ({layers.length})
                  </Typography>
                  <Button startIcon={<AddIcon />} onClick={addLayer} size="small">
                    Add Layer
                  </Button>
                </Box>

                {layers.map((layer, index) => (
                  <Paper
                    key={index}
                    variant="outlined"
                    sx={{ p: 1.5, mb: 1 }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="caption">Layer {index + 1}</Typography>
                      {layers.length > 1 && (
                        <IconButton size="small" onClick={() => removeLayer(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Grid container spacing={1}>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary">
                          X: {layer.offsetX}px
                        </Typography>
                        <Slider
                          value={layer.offsetX}
                          onChange={(_, v) => updateLayer(index, "offsetX", v as number)}
                          min={-50}
                          max={50}
                          size="small"
                        />
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary">
                          Y: {layer.offsetY}px
                        </Typography>
                        <Slider
                          value={layer.offsetY}
                          onChange={(_, v) => updateLayer(index, "offsetY", v as number)}
                          min={-50}
                          max={50}
                          size="small"
                        />
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary">
                          Blur: {layer.blur}px
                        </Typography>
                        <Slider
                          value={layer.blur}
                          onChange={(_, v) => updateLayer(index, "blur", v as number)}
                          min={0}
                          max={50}
                          size="small"
                        />
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary">
                          Opacity: {layer.opacity}
                        </Typography>
                        <Slider
                          value={layer.opacity}
                          onChange={(_, v) => updateLayer(index, "opacity", v as number)}
                          min={0}
                          max={1}
                          step={0.05}
                          size="small"
                        />
                      </Grid>
                      <Grid size={12}>
                        <TextField
                          label="Color"
                          value={layer.color}
                          onChange={(e) => updateLayer(index, "color", e.target.value)}
                          size="small"
                          type="color"
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>

              {/* Copy buttons */}
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Button variant="outlined" onClick={() => handleCopy("css")} sx={{ flex: 1 }}>
                  {copied ? "Copied!" : "Copy CSS"}
                </Button>
                <Button variant="outlined" onClick={() => handleCopy("mui")} sx={{ flex: 1 }}>
                  MUI
                </Button>
                <Button variant="outlined" onClick={() => handleCopy("json")} sx={{ flex: 1 }}>
                  JSON
                </Button>
              </Box>
            </Paper>

            {/* Right: Preview */}
            <Paper elevation={2} sx={{ p: 3 }}>
              {/* Preview */}
              <Box
                sx={{
                  minHeight: 300,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor: bgColor,
                  borderRadius: 2,
                  transition: "background-color 0.3s ease",
                }}
              >
                <Typography
                  sx={{
                    fontSize: fontSize,
                    fontWeight: 700,
                    color: textColor,
                    textShadow: generateTextShadowCSS(layers),
                    transition: "text-shadow 0.3s ease",
                    textAlign: "center",
                  }}
                >
                  {text}
                </Typography>
              </Box>

              {/* Live CSS preview */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Generated CSS
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    fontFamily: "monospace",
                    fontSize: 12,
                    bgcolor: "action.hover",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  text-shadow: {generateTextShadowCSS(layers)};
                </Paper>
              </Box>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
