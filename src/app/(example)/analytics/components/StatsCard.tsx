"use client";

import { Card, CardContent, Box, Typography, Stack } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { StatsCardData } from "../data";

export const StatsCard = ({
  title,
  value,
  trend,
  trendValue,
  bgColor,
  icon: Icon,
  chartData,
}: StatsCardData) => (
  <Card
    sx={{
      height: "100%",
      background: bgColor,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: "rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon sx={{ fontSize: 28, color: "rgba(0,0,0,0.6)" }} />
      </Box>

      <Typography
        variant="body2"
        sx={{ color: "rgba(0,0,0,0.7)", mb: 2, fontWeight: 500 }}
      >
        {title}
      </Typography>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: "#000" }}>
        {value}
      </Typography>

      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 2 }}>
        {trend === "up" ? (
          <TrendingUpIcon sx={{ fontSize: 16, color: "#000" }} />
        ) : (
          <TrendingDownIcon sx={{ fontSize: 16, color: "#000" }} />
        )}
        <Typography variant="caption" sx={{ color: "#000", fontWeight: 600 }}>
          {trendValue}
        </Typography>
      </Stack>

      {/* Mini sparkline chart */}
      <Box sx={{ height: 40 }}>
        <svg width="100%" height="100%" viewBox="0 0 120 40">
          <defs>
            <pattern
              id={`dots-${title}`}
              x="0"
              y="0"
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="rgba(0,0,0,0.1)" />
            </pattern>
          </defs>
          <rect width="120" height="40" fill={`url(#dots-${title})`} />
          <polyline
            points={chartData
              .map((chartValue, index) => {
                const x = (index / (chartData.length - 1)) * 120;
                const y = 40 - chartValue;
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="rgba(0,0,0,0.6)"
            strokeWidth="2"
          />
        </svg>
      </Box>
    </CardContent>
  </Card>
);
