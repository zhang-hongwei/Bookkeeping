import { Card, CardContent, Box, Typography, Stack, Chip } from "@mui/material";
import { TrendingUpOutlined, TrendingDownOutlined, HelpOutlineOutlined } from "@mui/icons-material";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  iconBg: string;
  chartColor: string;
}

function StatCard({ title, value, change, isPositive, icon, iconBg, chartColor }: StatCardProps) {
  // Simple line chart SVG
  const chartPoints = isPositive
    ? "M0,40 Q20,35 40,30 T80,25 T120,22 T160,20"
    : "M0,20 Q20,22 40,25 T80,30 T120,35 T160,40";

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              bgcolor: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            {icon}
          </Box>
          <Chip
            label={change}
            size="small"
            icon={isPositive ? <TrendingUpOutlined /> : <TrendingDownOutlined />}
            sx={{
              bgcolor: isPositive ? "success.lighter" : "error.lighter",
              color: isPositive ? "success.dark" : "error.dark",
              fontWeight: 600,
              "& .MuiChip-icon": {
                color: isPositive ? "success.dark" : "error.dark",
              },
            }}
          />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <HelpOutlineOutlined sx={{ fontSize: 14, color: "text.disabled" }} />
        </Stack>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          {value}
        </Typography>

        {/* Simple line chart */}
        <Box sx={{ height: 60, mt: 2 }}>
          <svg width="100%" height="60" viewBox="0 0 160 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={chartColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`${chartPoints} L160,60 L0,60 Z`}
              fill={`url(#gradient-${title})`}
            />
            <path
              d={chartPoints}
              fill="none"
              stroke={chartColor}
              strokeWidth="2"
            />
          </svg>
        </Box>
      </CardContent>
    </Card>
  );
}

export function IncomeExpenseCards() {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
      <Box sx={{ flex: 1 }}>
        <StatCard
          title="Income"
          value="9 990 €"
          change="+6.3%"
          isPositive={true}
          icon={<TrendingUpOutlined />}
          iconBg="#8B5CF6"
          chartColor="#8B5CF6"
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <StatCard
          title="Expenses"
          value="1 989 €"
          change="-4.6%"
          isPositive={false}
          icon={<TrendingDownOutlined />}
          iconBg="#F97316"
          chartColor="#F97316"
        />
      </Box>
    </Stack>
  );
}
