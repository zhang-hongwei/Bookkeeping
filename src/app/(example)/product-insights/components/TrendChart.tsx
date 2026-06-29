"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { ECharts } from "echarts";
import { TrendData } from "../types";
import { Box } from "@mui/material";
import { ECHARTS_COLOR_PALETTE } from "@/config/echarts";

interface TrendChartProps {
  data: TrendData[];
  width?: number;
  height?: number;
  color?: string;
}

export default function TrendChart({
  data,
  width = 120,
  height = 40,
  color = ECHARTS_COLOR_PALETTE[0], // 使用主题配置中的 primary.main
}: TrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    // Initialize chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;

    // Prepare data
    const xData = data.map((item) => item.date);
    const yData = data.map((item) => item.value);

    // Configure chart options
    const option: echarts.EChartsOption = {
      grid: {
        left: 0,
        right: 0,
        top: 2,
        bottom: 2,
      },
      xAxis: {
        type: "category",
        data: xData,
        show: false,
      },
      yAxis: {
        type: "value",
        show: false,
      },
      series: [
        {
          type: "line",
          data: yData,
          smooth: true,
          symbol: "none",
          lineStyle: {
            color: color,
            width: 2,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: `${color}40`,
              },
              {
                offset: 1,
                color: `${color}00`,
              },
            ]),
          },
        },
      ],
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const param = params[0];
          return `${param.value.toLocaleString()}`;
        },
      },
    };

    chart.setOption(option);

    // Handle resize
    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
      chartInstance.current = null;
    };
  }, [data, color]);

  // Show placeholder for empty data
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <Box
        sx={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
          fontSize: 12,
        }}
      >
        —
      </Box>
    );
  }

  return <div ref={chartRef} style={{ width, height }} />;
}
