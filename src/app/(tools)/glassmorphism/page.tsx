/**
 * Glass Effect Generator Page
 * Three-column layout: controls | preview | presets
 */

"use client";

import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { LensBlurOutlined } from "@mui/icons-material";
import { GlassControls } from "./components/GlassControls";
import { GlassCenterPanel } from "./components/GlassCenterPanel";
import { GlassPresetsPanel } from "./components/GlassPresetsPanel";
import { GlassExportDialog } from "./components/GlassExportDialog";
import { useGlassStore } from "@/store/glass";

export default function GlassmorphismGeneratorPage() {
  const config = useGlassStore((s) => s.config);
  const exportDialogOpen = useGlassStore((s) => s.exportDialogOpen);
  const setExportDialogOpen = useGlassStore((s) => s.setExportDialogOpen);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", py: 3 }}>
      <Container maxWidth="xl">
        {/* Page header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <LensBlurOutlined sx={{ fontSize: 36, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1">Glass Effect Generator</Typography>
            <Typography variant="body2" color="text.secondary">
              Create glassmorphism, liquid glass, and neumorphism effects with live preview
            </Typography>
          </Box>
        </Box>

        {/* Three-column layout */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "300px 1fr 280px" }, gap: 2.5, alignItems: "start" }}>
          <GlassControls />
          <GlassCenterPanel />
          <GlassPresetsPanel />
        </Box>
      </Container>

      <GlassExportDialog open={exportDialogOpen} config={config} onClose={() => setExportDialogOpen(false)} />
    </Box>
  );
}
