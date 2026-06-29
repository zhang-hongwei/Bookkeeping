/**
 * Clip Path Editor Page
 * Interactive clip path generator with draggable canvas, presets, and CSS export
 */

"use client";

import React from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import { Code } from "@mui/icons-material";
import { ClipPathCanvas } from "./components/ClipPathCanvas";
import { ClipPathControls } from "./components/ClipPathControls";
import { ClipPathPresetsPanel } from "./components/ClipPathPresetsPanel";
import { ClipPathCodeOutput } from "./components/ClipPathCodeOutput";
import { ClipPathExportDialog } from "./components/ClipPathExportDialog";
import { useClipPathStore, useClipPathActions, getClipPathConfig } from "@/store/clip-path";

export default function ClipPathEditorPage() {
  const exportDialogOpen = useClipPathStore((s) => s.exportDialogOpen);
  const { setExportDialogOpen } = useClipPathActions();

  const store = useClipPathStore();
  const clipPathConfig = getClipPathConfig(store);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        py: 3,
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Page header */}
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              Clip Path Generator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create custom clip paths with interactive canvas. Drag points to reshape, click edges to add points, double-click to remove.
            </Typography>
          </Box>

          <Divider />

          {/* Main layout: Controls | Canvas + Code | Presets */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "280px 1fr 220px",
              },
              gap: 3,
              alignItems: "start",
            }}
          >
            {/* Left: Controls */}
            <Paper
              elevation={2}
              sx={{
                position: { xs: "relative", md: "sticky" },
                top: { xs: 0, md: 24 },
                maxHeight: { md: "calc(100vh - 120px)" },
                overflow: "auto",
              }}
            >
              <ClipPathControls />
            </Paper>

            {/* Center: Canvas + Code Output */}
            <Stack spacing={2}>
              {/* Interactive Canvas */}
              <ClipPathCanvas />

              {/* CSS Code Output */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    CSS Output
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Code />}
                    onClick={() => setExportDialogOpen(true)}
                  >
                    Export
                  </Button>
                </Stack>
                <ClipPathCodeOutput />
              </Box>

              {/* Tips */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: "info.main",
                  color: "info.contrastText",
                  opacity: 0.9,
                }}
              >
                <Typography variant="body2" gutterBottom fontWeight={600}>
                  Quick Guide
                </Typography>
                <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
                  <Typography component="li" variant="caption">
                    <strong>Add Points:</strong> Click &quot;Add Point&quot; or click on a polygon edge between handles.
                  </Typography>
                  <Typography component="li" variant="caption">
                    <strong>Delete Points:</strong> Double-click any handle to remove it (min. 3 required).
                  </Typography>
                  <Typography component="li" variant="caption">
                    <strong>Refine Shape:</strong> Drag handles to reshape. Use coordinate inputs for precision.
                  </Typography>
                  <Typography component="li" variant="caption">
                    <strong>Center:</strong> Click the center icon to snap the shape to the canvas center.
                  </Typography>
                  <Typography component="li" variant="caption">
                    <strong>Background:</strong> Upload your own image or change the preview color.
                  </Typography>
                </Stack>
              </Paper>
            </Stack>

            {/* Right: Presets */}
            <Paper
              elevation={2}
              sx={{
                position: { xs: "relative", md: "sticky" },
                top: { xs: 0, md: 24 },
                maxHeight: { md: "calc(100vh - 120px)" },
                overflow: "auto",
              }}
            >
              <ClipPathPresetsPanel />
            </Paper>
          </Box>
        </Stack>
      </Container>

      {/* Export dialog */}
      <ClipPathExportDialog
        open={exportDialogOpen}
        config={clipPathConfig}
        onClose={() => setExportDialogOpen(false)}
      />
    </Box>
  );
}
