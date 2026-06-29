"use client";

import { Box, Paper, Typography, Stack, Divider, Button } from "@mui/material";
import Select from "@/components/ui/Select";
import { useChartStore } from "@/stores/charts/chart-store";
import { chartTypes, colorSchemes, type ColorScheme } from "../config";
import Toast from "@/components/ui/Toast";

interface ChartsSidebarProps {
  onChartTypeChange: (type: string) => void;
  onColorSchemeChange: (scheme: ColorScheme) => void;
}

export function ChartsSidebar({
  onChartTypeChange,
  onColorSchemeChange,
}: ChartsSidebarProps) {
  const { option } = useChartStore();

  // 获取当前图表类型
  const currentChartType =
    option.series && Array.isArray(option.series) && option.series[0]?.type
      ? option.series[0].type
      : "bar";

  // 转换图表类型数据为 Select 组件需要的格式
  const chartTypeOptions = chartTypes.map((type) => ({
    label: `${type.icon} ${type.label}`,
    value: type.value,
  }));

  return (
    <Paper
      sx={{
        height: "100%",
        p: 2,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
        minHeight: 0, // 确保内容可以收缩
      }}
    >
      <Typography variant="h6" gutterBottom>
        Chart Type
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Select
          options={chartTypeOptions}
          value={currentChartType}
          onChange={(value) => {
            if (value && typeof value === "string") {
              onChartTypeChange(value);
            }
          }}
          placeholder="Select chart type"
          sx={{
            "& .MuiAutocomplete-inputRoot": {
              py: 1.5,
            },
          }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Color Scheme
      </Typography>
      <Stack spacing={2} sx={{ flex: 1, overflow: "auto" }}>
        {colorSchemes.map((scheme) => (
          <Box key={scheme.name}>
            <Button
              variant="outlined"
              onClick={() => onColorSchemeChange(scheme)}
              sx={{
                width: "100%",
                justifyContent: "flex-start",
                mb: 1,
              }}
            >
              {scheme.name}
            </Button>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {scheme.colors.slice(0, 6).map((color, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 20,
                    height: 20,
                    backgroundColor: color,
                    borderRadius: 1,
                    border: "1px solid #ddd",
                  }}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
