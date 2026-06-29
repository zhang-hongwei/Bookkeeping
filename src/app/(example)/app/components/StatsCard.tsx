import { Card, CardContent, Box, Typography, Stack } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface StatsCardProps {
  title: string;
  value: string;
  trend: "up" | "down";
  trendValue: string;
  chartColor: string;
  chartData: number[];
}

export function StatsCard({
  title,
  value,
  trend,
  trendValue,
  chartColor,
  chartData,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {value}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {trend === "up" ? (
                <TrendingUpIcon sx={{ fontSize: 16, color: "success.main" }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 16, color: "error.main" }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: trend === "up" ? "success.main" : "error.main",
                  fontWeight: 600,
                }}
              >
                {trendValue}
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ width: 80, height: 50 }}>
            <svg width="80" height="50" viewBox="0 0 80 50">
              {chartData.map((value, i) => (
                <rect
                  key={i}
                  x={i * 16 + 2}
                  y={50 - value}
                  width="12"
                  height={value}
                  fill={chartColor}
                  opacity={0.8}
                  rx="2"
                />
              ))}
            </svg>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
