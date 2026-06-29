/**
 * Box Shadow Editor Page
 * Main page - integrated all components
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
} from "@mui/material";
import ShadowLayerList from "./components/ShadowLayerList";
import ShadowPreview from "./components/ShadowPreview";
import ShadowExportDialog from "./components/ShadowExportDialog";
import PresetGallery from "./components/PresetGallery";
import { useShadowLayers } from "./hooks/useShadowLayers";
import { getPresetByName } from "./presets";

/**
 * Box Shadow Editor main page
 */
export default function BoxShadowEditorPage() {
  const {
    layers,
    addLayer,
    removeLayer,
    updateLayer,
    duplicateLayerById,
    resetLayers,
    applyPreset,
  } = useShadowLayers();

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const handleApplyPreset = (presetName: string) => {
    const preset = getPresetByName(presetName);
    if (preset) {
      applyPreset(preset);
    }
  };
  const handleOpenExport = () => {
    setExportDialogOpen(true);
  };
  const handleCloseExport = () => {
    setExportDialogOpen(false);
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
              Box Shadow Editor
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and customize multi-layer box shadows with real-time preview
            </Typography>
          </Box>

          <Divider />

          {/* Main editing area - Three column layout */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "320px 1fr 280px",
              },
              gap: 3,
              alignItems: "start",
            }}
          >
            {/* Left: Layer control panel */}
            <Paper
              elevation={2}
              sx={{
                p: 2,
                height: {
                  xs: "auto",
                  md: "calc(100vh - 200px)",
                },
                display: "flex",
                flexDirection: "column",
                position: {
                  xs: "relative",
                  md: "sticky",
                },
                top: {
                  xs: 0,
                  md: 24,
                },
              }}
            >
              <ShadowLayerList
                layers={layers}
                onAddLayer={addLayer}
                onRemoveLayer={removeLayer}
                onUpdateLayer={updateLayer}
                onDuplicateLayer={duplicateLayerById}
                onReset={resetLayers}
                onApplyPreset={handleApplyPreset}
                onOpenExport={handleOpenExport}
              />
            </Paper>

            {/* Center: Real-time preview */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                position: {
                  xs: "relative",
                  md: "sticky",
                },
                top: {
                  xs: 0,
                  md: 24,
                },
              }}
            >
              <ShadowPreview layers={layers} />
            </Paper>

            {/* Right: Preset gallery */}
            <Paper
              elevation={2}
              sx={{
                p: 2,
                height: {
                  xs: "auto",
                  md: "calc(100vh - 200px)",
                },
                overflow: "auto",
                position: {
                  xs: "relative",
                  md: "sticky",
                },
                top: {
                  xs: 0,
                  md: 24,
                },
              }}
            >
              <PresetGallery
                currentLayers={layers}
                onSelectPreset={handleApplyPreset}
              />
            </Paper>
          </Box>


        </Stack>
      </Container>

      {/* Export dialog */}
      <ShadowExportDialog
        open={exportDialogOpen}
        layers={layers}
        onClose={handleCloseExport}
      />
    </Box>
  );
}
