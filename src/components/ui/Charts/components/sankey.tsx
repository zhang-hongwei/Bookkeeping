"use client";

import { forwardRef, useMemo } from "react";
import Charts from "./base";
import type { EChartsOption } from "echarts";
import type { SankeyChartProps } from "../types";

const SankeyChart = forwardRef<any, SankeyChartProps>((props, ref) => {
  const {
    data,
    width = "100%",
    height = 400,
    theme = "auto",
    title = "需求映射拆分图",
    nodeWidth = 20,
    nodeGap = 8,
    layoutIterations = 32,
    orient = "horizontal",
    draggable = true,
    focusNodeAdjacency = "allEdges",
    levels = [],
    onNodeClick,
    onLinkClick,
  } = props;

  const option: EChartsOption = useMemo(() => {
    const baseOption: EChartsOption = {
      title: {
        text: title,
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove",
        formatter: function (params: any) {
          if (params.dataType === "edge") {
            return `${params.data.source} → ${params.data.target}<br/>权重: ${params.data.value}`;
          } else if (params.dataType === "node") {
            return `${params.data.name}<br/>值: ${params.data.value || 0}`;
          }
          return "";
        },
      },
      series: [
        {
          type: "sankey",
          data: data.nodes,
          links: data.links,
          emphasis: {
            focus: "adjacency",
          },
          lineStyle: {
            color: "gradient",
            curveness: 0.5,
            opacity: 0.6,
          },
          itemStyle: {
            borderWidth: 1,
            borderColor: "#aaa",
          },
          label: {
            show: true,
            position: "right",
            formatter: "{b}",
            fontSize: 12,
          },
          nodeWidth: nodeWidth,
          nodeGap: nodeGap,
          layoutIterations: layoutIterations,
          orient: orient,
          draggable: draggable,
          focusNodeAdjacency: focusNodeAdjacency,
          levels: levels,
        },
      ],
      animationDuration: 1000,
      animationEasing: "cubicOut",
    };

    return baseOption;
  }, [
    data,
    title,
    nodeWidth,
    nodeGap,
    layoutIterations,
    orient,
    draggable,
    focusNodeAdjacency,
    levels,
  ]);

  const events = useMemo(() => {
    const eventHandlers: Record<string, (params: any) => void> = {};

    if (onNodeClick) {
      eventHandlers.click = (params: any) => {
        if (params.dataType === "node") {
          onNodeClick(params);
        }
      };
    }

    if (onLinkClick) {
      eventHandlers.click = (params: any) => {
        if (params.dataType === "edge") {
          onLinkClick(params);
        }
      };
    }

    return eventHandlers;
  }, [onNodeClick, onLinkClick]);

  return (
    <Charts
      ref={ref}
      width={width}
      height={height}
      option={option}
      theme={theme}
      onEvents={events}
    />
  );
});

SankeyChart.displayName = "SankeyChart";

export default SankeyChart;