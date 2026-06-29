"use client";

import React, { forwardRef, ForwardedRef } from "react";
import Charts from "./base";
import * as echarts from "echarts";
import { ECHARTS_COLOR_PALETTE } from "@/config/echarts";
import type { GaugeChartProps } from "../types";

const GaugeChart = forwardRef<any, GaugeChartProps>(
  (
    {
      value = 0,
      max = 100,
      title,
      unit = "",
      width = "100%",
      height = "100%",
      color,
      showPointer = true,
      showDetail = true,
      onEvents,
      theme = "auto",
    }: GaugeChartProps,
    ref: ForwardedRef<any>
  ) => {
    // Use theme colors for gauge gradient
    const defaultColor = [
      [0.2, ECHARTS_COLOR_PALETTE[1]], // info.main
      [0.8, ECHARTS_COLOR_PALETTE[1]], // info.main
      [1, ECHARTS_COLOR_PALETTE[4]], // error.main
    ];

    // Determine the color configuration for axisLine
    const axisLineColor = (() => {
      if (Array.isArray(color)) {
        // Multiple colors: create gradient
        return color.map(
          (c, index) => [index / (color.length - 1), c] as [number, string]
        );
      } else if (color) {
        // Single color: use solid color for entire arc
        return [[1, color]] as [number, string][];
      } else {
        // No color specified: use default gradient
        return defaultColor as [number, string][];
      }
    })();

    const option: echarts.EChartsOption = {
      series: [
        {
          name: title || "仪表盘",
          type: "gauge",
          center: ["50%", "60%"],
          startAngle: 200,
          endAngle: -40,
          min: 0,
          max: max,
          splitNumber: 5,
          itemStyle: {
            // 主题会自动应用颜色
            shadowColor: "rgba(0,138,255,0.45)",
            shadowBlur: 10,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
          },
          progress: {
            show: true,
            roundCap: true,
            width: 18,
            itemStyle: {
              // Set color based on the color prop
              ...(color && {
                color: Array.isArray(color)
                  ? {
                      type: "linear",
                      x: 0,
                      y: 0,
                      x2: 1,
                      y2: 0,
                      colorStops: color.map((c, index) => ({
                        offset: index / (color.length - 1),
                        color: c,
                      })),
                    }
                  : color, // Use solid color directly
              }),
            },
          },
          pointer: showPointer
            ? {
                icon: "path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,616.42982 2092.96551,616.42982 2094.08535,615.30999 L2094.08535,615.30999 C2095.20518,614.19016 2095.20518,612.70837 2094.08535,611.58854 L2094.08535,611.58854 C2092.96551,610.46871 2091.48372,610.46871 2090.36389,611.58854 L2090.36389,611.58854 C2089.24407,612.70837 2089.24407,614.19016 2090.36389,615.30999 Z",
                length: "75%",
                width: 16,
                offsetCenter: [0, "5%"],
                itemStyle: {
                  color: "#C0C0C0",
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                  shadowBlur: 15,
                },
              }
            : {
                show: false,
              },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 18,
              color: axisLineColor,
            },
          },
          axisTick: {
            distance: -45,
            splitNumber: 5,
            lineStyle: {
              width: 2,
              color: theme === "dark" ? "#ffffff" : "#999",
            },
          },
          splitLine: {
            distance: -52,
            length: 14,
            lineStyle: {
              width: 3,
              color: theme === "dark" ? "#ffffff" : "#999",
            },
          },
          axisLabel: {
            distance: -20,
            color: theme === "dark" ? "#ffffff" : "#999",
            fontSize: 14,
          },
          anchor: {
            show: showPointer,
            showAbove: true,
            size: 25,
            itemStyle: {
              borderWidth: 15,
              borderColor: "#C0C0C0",
              color: "#C0C0C0",
              shadowColor: "rgba(0, 0, 0, 0.5)",
              shadowBlur: 15,
            },
          },
          title: title
            ? {
                show: true,
                fontSize: 16,
                fontWeight: "bolder" as const,
                color: theme === "dark" ? "#ffffff" : "#333",
                offsetCenter: [0, "20%"],
              }
            : undefined,
          detail: showDetail
            ? {
                valueAnimation: true,
                fontSize: 30,
                fontWeight: "bolder" as const,
                color: theme === "dark" ? "#ffffff" : "#333",
                offsetCenter: [0, "-15%"],
                formatter: `{value}${unit}`,
              }
            : undefined,
          data: [
            {
              value: value,
              name: title,
            },
          ],
        },
      ],
    };

    return (
      <Charts
        ref={ref}
        width={width}
        height={height}
        option={option}
        onEvents={onEvents}
        theme={theme}
      />
    );
  }
);

GaugeChart.displayName = "GaugeChart";

export default GaugeChart;
