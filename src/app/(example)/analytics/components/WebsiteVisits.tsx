"use client";

import { Card, CardContent, Box, Typography } from "@mui/material";
import { Charts } from "@/components/ui/Charts";
import { WebsiteVisitData } from "../data";
import { useMemo } from "react";

interface WebsiteVisitsProps {
  data: WebsiteVisitData[];
}

export const WebsiteVisits = ({ data }: WebsiteVisitsProps) => {
  const chartOption = useMemo(() => {
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      legend: {
        data: ["Team A", "Team B"],
        bottom: 0,
        icon: "circle",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "10%",
        top: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.map((item) => item.month),
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: "value",
        splitLine: {
          lineStyle: {
            color: "#f0f0f0",
          },
        },
      },
      series: [
        {
          name: "Team A",
          type: "bar",
          data: data.map((item) => item.teamA),
          itemStyle: {
            color: "#00B8D9",
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: "20%",
        },
        {
          name: "Team B",
          type: "bar",
          data: data.map((item) => item.teamB),
          itemStyle: {
            color: "#FFAB00",
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: "20%",
        },
      ],
    };
  }, [data]);

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            Website visits
          </Typography>
          <Typography variant="caption" color="text.secondary">
            (+43%) than last year
          </Typography>
        </Box>

        {/* Chart */}
        <Box sx={{ height: 340 }}>
          <Charts option={chartOption} height="100%" />
        </Box>
      </CardContent>
    </Card>
  );
};
