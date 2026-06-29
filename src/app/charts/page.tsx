"use client";

import { useCallback } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { ChartsSidebar } from "./components/ChartsSidebar";
import { ChartsConfigPanel } from "./components/ChartsConfigPanel";
import { ChartsPreview } from "./components/ChartsPreview";
import { useChartStore } from "@/stores/charts/chart-store";
import Toast from "@/components/ui/Toast";

export default function ChartsEditor() {
  const { updateChartType, updateColors } = useChartStore();

  // Event handlers
  const handleChartTypeChange = useCallback(
    (type: string) => {
      updateChartType(type as any);
      Toast.success(`Switched to ${type} chart`);
    },
    [updateChartType]
  );

  const handleColorSchemeChange = useCallback(
    (scheme: any) => {
      updateColors(scheme.colors);
      Toast.success(`Applied ${scheme.name} color scheme`);
    },
    [updateColors]
  );

  return (
    <Box
      sx={{
        height: "100vh", // 使用动态视口高度，避免移动端地址栏影响
        display: "flex",
        flexDirection: "column",
        // overflow: "hidden",
        backgroundColor: "background.default",
        border: "1px solid red",
        overflow: "auto",
      }}
    >
      <Box
        sx={{
          p: { xs: 1, sm: 2 },
          pb: 1,
          borderBottom: "1px solid divider",
          backgroundColor: "background.paper",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontSize: { xs: "h5.fontSize", sm: "h4.fontSize" } }}
        >
          ECharts Visual Editor
        </Typography>
      </Box>

      <Grid
        container
        spacing={2}
        sx={{
          flex: 1,
          p: { xs: 1, sm: 2 },
          pt: 2,
          minHeight: 0, // 关键：允许内容收缩
          overflow: "hidden", // 防止容器溢出
        }}
      >
        {/* Left sidebar: Chart type selection */}
        <Grid size={{ xs: 12, md: 2 }} sx={{ minHeight: 0 }}>
          <ChartsSidebar
            onChartTypeChange={handleChartTypeChange}
            onColorSchemeChange={handleColorSchemeChange}
          />
        </Grid>

        {/* Middle: Configuration panel */}
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{ minHeight: 0, height: "900px" }}
        >
          <ChartsConfigPanel />
        </Grid>

        {/* Right: Preview area */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ minHeight: 0, height: "900px" }}
        >
          <ChartsPreview />
        </Grid>
      </Grid>
    </Box>
  );
}
