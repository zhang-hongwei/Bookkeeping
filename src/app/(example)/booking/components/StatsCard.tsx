import { Card, CardContent, Box, Typography, Stack } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface StatsCardProps {
  title: string;
  value: string;
  trend?: "up" | "down";
  trendValue?: string;
  illustration?: React.ReactNode;
}

export function StatsCard({
  title,
  value,
  trend,
  trendValue,
  illustration,
}: StatsCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3, position: "relative" }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>
        {trend && trendValue && (
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
        )}
        {illustration && (
          <Box
            sx={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 80,
              height: 80,
            }}
          >
            {illustration}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
