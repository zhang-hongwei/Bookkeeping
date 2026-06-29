"use client";

import { Box, Paper, Typography } from "@mui/material";
import { Charts } from "@/components/ui/Charts";
import { useChartStore } from "@/stores/charts/chart-store";

export function ChartsPreview() {
  const { option } = useChartStore();

  return (
    <Paper sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: { xs: 1, sm: 2 },
        minHeight: 0,
        overflow: "hidden" // 防止内容溢出
      }}>
      <Typography variant="h6" gutterBottom sx={{ flexShrink: 0 }}>
        Live Preview
      </Typography>
      <Box
        sx={{
          flex: 1,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          minHeight: 0, // 关键：允许内容收缩
          display: "flex",
          overflow: "hidden", // 防止图表溢出
          backgroundColor: "background.paper"
        }}
      >
        <Charts option={option} width="100%" height="100%" />
      </Box>
    </Paper>
  );
}