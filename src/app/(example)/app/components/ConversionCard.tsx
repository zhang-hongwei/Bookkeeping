import { Card, CardContent, Typography, Box } from "@mui/material";
import { Charts } from "@/components/ui/Charts";
import type { EChartsOption } from "echarts";

interface ConversionCardProps {
  percentage: number;
  value: string;
  label: string;
  gradient: string;
}

export function ConversionCard({
  percentage,
  value,
  label,
  gradient,
}: ConversionCardProps) {
  // 圆形进度条配置 - 使用 ECharts Gauge
  const chartOption: EChartsOption = {
    series: [
      {
        type: "gauge",
        startAngle: 90,
        endAngle: -270,
        radius: "90%",
        center: ["50%", "50%"],
        pointer: {
          show: false,
        },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: {
            color: "white",
          },
        },
        axisLine: {
          lineStyle: {
            width: 4,
            color: [[1, "rgba(255, 255, 255, 0.3)"]],
          },
        },
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        data: [
          {
            value: percentage,
          },
        ],
        detail: {
          show: false,
        },
      },
    ],
  };

  return (
    <Card
      sx={{
        background: gradient,
        color: "white",
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
      }}
    >
      {/* Decorative background circles */}
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          bgcolor: "rgba(255, 255, 255, 0.08)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 20,
          right: 40,
          width: 100,
          height: 100,
          borderRadius: "50%",
          bgcolor: "rgba(255, 255, 255, 0.08)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -30,
          right: 20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: "rgba(255, 255, 255, 0.08)",
        }}
      />

      <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          {/* Circular progress indicator */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, position: "relative", zIndex: 2 }}
            >
              {percentage}%
            </Typography>
            {/* 圆形进度条 - 使用 ECharts */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            >
              <Charts option={chartOption} height={80} width={80} />
            </Box>
          </Box>

          {/* Text content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 0.5, letterSpacing: -0.5 }}
            >
              {value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {label}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
