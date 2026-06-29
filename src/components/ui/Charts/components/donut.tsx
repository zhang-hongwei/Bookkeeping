"use client";

import React, { forwardRef, ForwardedRef } from "react";
import Charts from "./base";
import * as echarts from "echarts";
import type { DonutChartProps } from "../types";

const DonutChart = forwardRef<any, DonutChartProps>(
  (
    {
      data = [],
      title,
      centerText,
      centerSubText,
      width = "100%",
      height = "100%",
      radius = ["40%", "65%"],
      colors,
      showLabel = true,
      showLegend: _showLegend = false, // 未使用，保留以供将来扩展
      legendPosition: _legendPosition = "bottom", // 未使用，保留以供将来扩展
      onEvents,
      theme = "auto",
    }: DonutChartProps,
    ref: ForwardedRef<any>
  ) => {
    // 处理数据：移除 data 中的 color 属性，让主题颜色生效
    const processedData = colors
      ? data // 如果传入了 colors 参数，保留原始数据（可能包含 color）
      : data.map(({ name, value }) => ({ name, value })); // 否则移除 color，使用主题

    const option: echarts.EChartsOption = {
      // 只有传入自定义颜色时才覆盖主题，否则使用 registerTheme 中的颜色
      ...(colors && { color: colors }),
      title: title
        ? {
          text: title,
          left: "center",
          top: 20,
          textStyle: {
            color: theme === "dark" ? "#ffffff" : "#333333",
            fontSize: 16,
            fontWeight: "bolder" as const,
          },
        }
        : undefined,
      tooltip: {
        show: false,
      },
      legend: {
        show: false,
      },
      series: [
        {
          name: title || "数据",
          type: "pie",
          radius: radius,
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          label: showLabel
            ? {
              show: true,
              position: "outside",
              formatter: "{b}: {c}",
              color: theme === "dark" ? "#ffffff" : "#333333",
            }
            : {
              show: false,
            },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bolder" as const,
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          labelLine: showLabel
            ? {
              show: true,
            }
            : {
              show: false,
            },
          data: processedData
        },
      ],
      graphic: centerText
        ? [
          {
            type: "text",
            left: "center",
            top: "35%", // 数字稍微上移
            style: {
              text: centerText,
              fill: theme === "dark" ? "#ffffff" : "#333333",
              fontSize: 18,
              fontWeight: "bolder" as const,
              textAlign: "center",
            },
          } as any,
          ...(centerSubText
            ? [
              {
                type: "text",
                left: "center",
                top: "60%", // 标签稍微下移
                style: {
                  text: centerSubText,
                  fill: theme === "dark" ? "#cccccc" : "#666666",
                  fontSize: 12,
                  textAlign: "center",
                },
              } as any,
            ]
            : []),
        ]
        : undefined,
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

DonutChart.displayName = "DonutChart";

export default DonutChart;
