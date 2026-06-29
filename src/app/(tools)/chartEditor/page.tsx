/**
 * Chart Editor Page
 * Three-column layout: controls | preview | presets
 */

"use client";

import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { TimelineOutlined } from "@mui/icons-material";
import { ChartControls } from "./components/ChartControls";
import { ChartPreview } from "./components/ChartPreview";
import { ChartPresetsPanel } from "./components/ChartPresetsPanel";
import { ChartExportDialog } from "./components/ChartExportDialog";
import { useChartEditorStore } from "@/store/chart-editor";

export default function ChartEditorPage() {
  const exportDialogOpen = useChartEditorStore((s) => s.exportDialogOpen);
  const setExportDialogOpen = useChartEditorStore((s) => s.setExportDialogOpen);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", py: 3 }}>
      <Container maxWidth="xl">
        {/* Page header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <TimelineOutlined sx={{ fontSize: 36, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1">Chart Editor</Typography>
            <Typography variant="body2" color="text.secondary">
              Visual ECharts editor with live preview and code export
            </Typography>
          </Box>
        </Box>

        {/* Three-column layout */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "320px 1fr 280px" }, gap: 2.5, alignItems: "start" }}>
          <ChartControls />
          <ChartPreview />
          <ChartPresetsPanel />
        </Box>
      </Container>

      <ChartExportDialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} />
    </Box>
  );
}
