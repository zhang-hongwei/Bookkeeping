import { Card, CardContent, Box, Typography, Stack, useTheme } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Charts } from "@/components/ui/Charts";
import type { EChartsOption } from "echarts";

// Sample data for the chart
const data = [80, 60, 65, 55, 45, 40];

export function TotalIncomesCard() {
  const theme = useTheme();

  const chartOption: EChartsOption = {
    grid: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    xAxis: {
      type: "category",
      show: false,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      show: false,
    },
    series: [
      {
        type: "line",
        data: data,
        smooth: true,
        symbol: "none",
        lineStyle: {
          color: "#fff",
          width: 3,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(255, 255, 255, 0.5)",
              },
              {
                offset: 1,
                color: "rgba(255, 255, 255, 0)",
              },
            ],
          },
        },
      },
    ],
  };

  return (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: "white",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
              Total incomes
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              18 765 €
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <TrendingUpIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              +2.6 %
            </Typography>
          </Stack>
        </Stack>
        <Typography
          variant="caption"
          sx={{ opacity: 0.8, display: "block", mb: 3 }}
        >
          Last month
        </Typography>
        <Box sx={{ height: 120, mt: -2 }}>
          <Charts option={chartOption} height="100%" width="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}
