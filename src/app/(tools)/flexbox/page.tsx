/**
 * Flexbox Generator Page
 * Interactive flexbox playground
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { FlexPreview } from "./components/FlexPreview";
import { FlexExportDialog } from "./components/FlexExportDialog";
import { FLEX_PRESETS, getPresetByName } from "./presets";
import type { FlexContainerConfig, FlexItemConfig, FlexDirection, JustifyContent, AlignItems, FlexWrap } from "./types";
import { generateContainerCSS } from "./utils";

const DEFAULT_CONTAINER: FlexContainerConfig = {
  direction: "row",
  wrap: "nowrap",
  justifyContent: "flex-start",
  alignItems: "stretch",
  gap: 16,
};

const DEFAULT_ITEM: FlexItemConfig = {
  width: 80,
  height: 80,
};

export default function FlexboxGeneratorPage() {
  const [config, setConfig] = useState<FlexContainerConfig>(DEFAULT_CONTAINER);
  const [items, setItems] = useState<FlexItemConfig[]>([
    { ...DEFAULT_ITEM },
    { ...DEFAULT_ITEM },
    { ...DEFAULT_ITEM },
  ]);
  const [itemColor, setItemColor] = useState("#6366f1");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const updateConfig = <K extends keyof FlexContainerConfig>(key: K, value: FlexContainerConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handlePresetApply = (presetName: string) => {
    const preset = getPresetByName(presetName);
    if (preset && preset.container) {
      setConfig({ ...DEFAULT_CONTAINER, ...preset.container });
    }
  };

  const addItem = () => {
    setItems([...items, { ...DEFAULT_ITEM }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, key: keyof FlexItemConfig, value: number | string) => {
    setItems(
      items.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    );
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
              Flexbox Generator
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Interactive playground for CSS flexbox layouts
            </Typography>
          </Box>

          <Divider />

          {/* Main editing area */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "400px 1fr",
              },
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
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Presets
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {FLEX_PRESETS.map((preset) => (
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

              {/* Direction */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Direction</InputLabel>
                <Select
                  value={config.direction}
                  label="Direction"
                  onChange={(e) =>
                    updateConfig("direction", e.target.value as FlexDirection)
                  }
                >
                  <MenuItem value="row">Row</MenuItem>
                  <MenuItem value="row-reverse">Row Reverse</MenuItem>
                  <MenuItem value="column">Column</MenuItem>
                  <MenuItem value="column-reverse">Column Reverse</MenuItem>
                </Select>
              </FormControl>

              {/* Wrap */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Wrap</InputLabel>
                <Select
                  value={config.wrap}
                  label="Wrap"
                  onChange={(e) => updateConfig("wrap", e.target.value as FlexWrap)}
                >
                  <MenuItem value="nowrap">No Wrap</MenuItem>
                  <MenuItem value="wrap">Wrap</MenuItem>
                  <MenuItem value="wrap-reverse">Wrap Reverse</MenuItem>
                </Select>
              </FormControl>

              {/* Justify Content */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Justify Content</InputLabel>
                <Select
                  value={config.justifyContent}
                  label="Justify Content"
                  onChange={(e) =>
                    updateConfig("justifyContent", e.target.value as JustifyContent)
                  }
                >
                  <MenuItem value="flex-start">Flex Start</MenuItem>
                  <MenuItem value="flex-end">Flex End</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="space-between">Space Between</MenuItem>
                  <MenuItem value="space-around">Space Around</MenuItem>
                  <MenuItem value="space-evenly">Space Evenly</MenuItem>
                </Select>
              </FormControl>

              {/* Align Items */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Align Items</InputLabel>
                <Select
                  value={config.alignItems}
                  label="Align Items"
                  onChange={(e) =>
                    updateConfig("alignItems", e.target.value as AlignItems)
                  }
                >
                  <MenuItem value="flex-start">Flex Start</MenuItem>
                  <MenuItem value="flex-end">Flex End</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="baseline">Baseline</MenuItem>
                  <MenuItem value="stretch">Stretch</MenuItem>
                </Select>
              </FormControl>

              {/* Gap */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Gap: {config.gap}px
                </Typography>
                <Slider
                  value={config.gap}
                  onChange={(_, v) => updateConfig("gap", v as number)}
                  min={0}
                  max={64}
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Items control */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2">Items ({items.length})</Typography>
                <Button startIcon={<AddIcon />} size="small" onClick={addItem}>
                  Add
                </Button>
              </Box>

              {/* Item color */}
              <TextField
                label="Item Color"
                value={itemColor}
                onChange={(e) => setItemColor(e.target.value)}
                size="small"
                type="color"
                fullWidth
                sx={{ mb: 2 }}
              />

              {/* Item controls */}
              <Box sx={{ flex: 1, overflow: "auto" }}>
                {items.map((item, index) => (
                  <Paper
                    key={index}
                    variant="outlined"
                    sx={{ p: 1.5, mb: 1 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="caption">Item {index + 1}</Typography>
                      <IconButton size="small" onClick={() => removeItem(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                      <TextField
                        label="Width"
                        value={item.width}
                        onChange={(e) => updateItem(index, "width", Number(e.target.value))}
                        type="number"
                        size="small"
                      />
                      <TextField
                        label="Height"
                        value={item.height}
                        onChange={(e) => updateItem(index, "height", Number(e.target.value))}
                        type="number"
                        size="small"
                      />
                      <TextField
                        label="Grow"
                        value={item.flexGrow || 0}
                        onChange={(e) => updateItem(index, "flexGrow", Number(e.target.value))}
                        type="number"
                        size="small"
                      />
                      <TextField
                        label="Shrink"
                        value={item.flexShrink ?? 1}
                        onChange={(e) => updateItem(index, "flexShrink", Number(e.target.value))}
                        type="number"
                        size="small"
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>

              {/* Export button */}
              <Button
                variant="contained"
                fullWidth
                onClick={() => setExportDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                Export Code
              </Button>
            </Paper>

            {/* Right: Preview */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <FlexPreview config={config} items={items} itemColor={itemColor} />

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
                    overflow: "auto",
                    maxHeight: 200,
                  }}
                >
                  {generateContainerCSS(config)}
                </Paper>
              </Box>
            </Paper>
          </Box>

          {/* Tips */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: "info.light",
              color: "info.contrastText",
            }}
          >
            <Typography variant="body2" gutterBottom fontWeight="bold">
              Tips:
            </Typography>
            <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
              <Typography component="li" variant="caption">
                Use flex-grow to make items expand to fill available space
              </Typography>
              <Typography component="li" variant="caption">
                gap property is a shorthand for row-gap and column-gap
              </Typography>
              <Typography component="li" variant="caption">
                flex-wrap: wrap is essential for responsive layouts
              </Typography>
              <Typography component="li" variant="caption">
                Combine justify-content and align-items for perfect centering
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      {/* Export dialog */}
      <FlexExportDialog
        open={exportDialogOpen}
        config={config}
        items={items}
        onClose={() => setExportDialogOpen(false)}
      />
    </Box>
  );
}
