import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { Charts } from "@/components/ui/Charts";
import type { EChartsOption } from "echarts";
import {
  ECHARTS_COLOR_PALETTE,
  ECHARTS_GRID_CONFIG,
  ECHARTS_AXIS_CONFIG,
  ECHARTS_TOOLTIP_CONFIG,
} from "@/config/echarts";

interface AreaInstalledCardProps {
  yearFilter: string;
  onYearFilterChange: (year: string) => void;
}

export function AreaInstalledCard({
  yearFilter,
  onYearFilterChange,
}: AreaInstalledCardProps) {

  // 定义系列颜色顺序：success -> warning -> info
  const seriesColors = [
    ECHARTS_COLOR_PALETTE[2], // Asia - success.main
    ECHARTS_COLOR_PALETTE[3], // Europe - warning.main
    ECHARTS_COLOR_PALETTE[1], // Americas - info.main
  ];

  // 图表配置
  const chartOption: EChartsOption = {
    color: seriesColors, // 设置调色盘，系列会自动按顺序使用
    grid: ECHARTS_GRID_CONFIG,
    xAxis: {
      type: "category",
      data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      ...ECHARTS_AXIS_CONFIG,
    },
    yAxis: {
      type: "value",
      max: 100,
      ...ECHARTS_AXIS_CONFIG,
    },
    series: [
      {
        name: "Asia",
        type: "bar",
        stack: "total",
        data: [10, 40, 25, 15, 40, 10, 50, 45, 15, 50, 25, 65],
        itemStyle: {
          borderRadius: [0, 0, 2, 2],
        },
        barMaxWidth: 40,
      },
      {
        name: "Europe",
        type: "bar",
        stack: "total",
        data: [20, 20, 15, 10, 25, 8, 25, 20, 10, 30, 15, 30],
        itemStyle: {
          borderRadius: 0,
        },
        barMaxWidth: 40,
      },
      {
        name: "Americas",
        type: "bar",
        stack: "total",
        data: [25, 20, 20, 15, 20, 12, 25, 20, 15, 20, 20, 25],
        itemStyle: {
          borderRadius: [2, 2, 0, 0],
        },
        barMaxWidth: 40,
      },
    ],
    tooltip: ECHARTS_TOOLTIP_CONFIG,
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Area installed
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (+43%) than last year
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={yearFilter}
              onChange={(e) => onYearFilterChange(e.target.value)}
            >
              <MenuItem value="2023">2023</MenuItem>
              <MenuItem value="2024">2024</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Legend */}
        <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: seriesColors[0], // Asia
                borderRadius: "50%",
              }}
            />
            <Typography variant="body2">Asia</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              1,23 k
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: seriesColors[1], // Europe
                borderRadius: "50%",
              }}
            />
            <Typography variant="body2">Europe</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              6,79 k
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: seriesColors[2], // Americas
                borderRadius: "50%",
              }}
            />
            <Typography variant="body2">Americas</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              1,01 k
            </Typography>
          </Stack>
        </Stack>

        {/* Stacked Bar Chart - 使用 ECharts */}
        <Box sx={{ height: 360, }}>
          <Charts option={chartOption} height={360} />
        </Box>
      </CardContent>
    </Card>
  );
}
