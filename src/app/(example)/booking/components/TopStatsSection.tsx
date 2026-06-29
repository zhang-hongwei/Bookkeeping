import { Grid, Box, useTheme, alpha } from "@mui/material";
import { StatsCard } from "./StatsCard";

export function TopStatsSection() {
  const theme = useTheme();

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatsCard
          title="Total booking"
          value="714 k"
          trend="up"
          trendValue="+2.6 %"
          illustration={
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill={alpha(theme.palette.primary.main, 0.1)} />
                <rect
                  x="25"
                  y="20"
                  width="30"
                  height="40"
                  rx="4"
                  fill={theme.palette.primary.main}
                />
                <rect
                  x="30"
                  y="30"
                  width="20"
                  height="3"
                  rx="1.5"
                  fill="#fff"
                />
                <rect
                  x="30"
                  y="38"
                  width="20"
                  height="3"
                  rx="1.5"
                  fill="#fff"
                />
              </svg>
            </Box>
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatsCard
          title="Sold"
          value="311 k"
          trend="up"
          trendValue="+0.2 %"
          illustration={
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="#E0F2F1" />
                <rect
                  x="28"
                  y="25"
                  width="24"
                  height="30"
                  rx="2"
                  fill="#26A69A"
                />
                <circle cx="32" cy="35" r="2" fill="#fff" />
                <circle cx="48" cy="35" r="2" fill="#fff" />
                <path
                  d="M 32 45 Q 40 50 48 45"
                  stroke="#fff"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </Box>
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatsCard
          title="Canceled"
          value="124 k"
          trend="down"
          trendValue="-0.1 %"
          illustration={
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="#E3F2FD" />
                <rect
                  x="25"
                  y="20"
                  width="12"
                  height="35"
                  rx="2"
                  fill="#42A5F5"
                />
                <rect
                  x="43"
                  y="20"
                  width="12"
                  height="35"
                  rx="2"
                  fill="#42A5F5"
                />
                <circle cx="31" cy="18" r="3" fill="#42A5F5" />
                <circle cx="49" cy="18" r="3" fill="#42A5F5" />
              </svg>
            </Box>
          }
        />
      </Grid>
    </Grid>
  );
}
