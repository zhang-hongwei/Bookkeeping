/**
 * 渐变边框编辑器页面
 * 三栏布局：属性控制 | 预览 | 预设
 */

"use client";

import React, { useRef } from "react";
import { Box, Container, Typography } from "@mui/material";
import { Gradient } from "@mui/icons-material";
import { GradientBorderControls } from "./components/GradientBorderControls";
import { GradientBorderCenterPanel } from "./components/GradientBorderCenterPanel";
import { GradientBorderPresetsPanel } from "./components/GradientBorderPresetsPanel";
import { GradientBorderExportDialog } from "./components/GradientBorderExportDialog";
import { useGradientBorderStore } from "@/store/gradient-border";

export default function GradientBorderEditorPage() {
  const config = useGradientBorderStore((s) => s.config);
  const exportDialogOpen = useGradientBorderStore((s) => s.exportDialogOpen);
  const setExportDialogOpen = useGradientBorderStore((s) => s.setExportDialogOpen);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", py: 3 }}>
      <Container maxWidth="xl">
        {/* Page header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Gradient sx={{ fontSize: 36, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1">渐变边框</Typography>
            <Typography variant="body2" color="text.secondary">
              创建和自定义渐变边框，实时预览效果
            </Typography>
          </Box>
        </Box>

        {/* Three-column layout */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "300px 1fr 280px" }, gap: 2.5, alignItems: "start" }}>
          <GradientBorderControls fileInputRef={fileInputRef} />
          <GradientBorderCenterPanel />
          <GradientBorderPresetsPanel />
        </Box>
      </Container>

      <GradientBorderExportDialog open={exportDialogOpen} config={config} onClose={() => setExportDialogOpen(false)} />
    </Box>
  );
}
