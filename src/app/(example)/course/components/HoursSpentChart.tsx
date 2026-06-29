import { Card, CardContent, Box, Typography, Stack, Select, MenuItem } from "@mui/material";
import { hoursSpentData } from "../data";

export function HoursSpentChart() {
  const maxHours = Math.max(...hoursSpentData.map((d) => d.hours));
  const years = hoursSpentData.map((d) => d.year);
  const hours = hoursSpentData.map((d) => d.hours);

  // Create smooth curve path
  const createSmoothPath = () => {
    const points = hours.map((h, i) => {
      const x = (i / (hours.length - 1)) * 100;
      const y = 100 - (h / maxHours) * 100;
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;

      path += ` Q ${controlX} ${current.y}, ${controlX} ${(current.y + next.y) / 2}`;
      path += ` T ${next.x} ${next.y}`;
    }

    return path;
  };

  const linePath = createSmoothPath();

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Hours spent
          </Typography>
          <Select
            size="small"
            defaultValue="Yearly"
            sx={{
              minWidth: 100,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "divider",
              },
            }}
          >
            <MenuItem value="Yearly">Yearly</MenuItem>
            <MenuItem value="Monthly">Monthly</MenuItem>
            <MenuItem value="Weekly">Weekly</MenuItem>
          </Select>
        </Stack>

        {/* Chart */}
        <Box sx={{ height: 200, position: "relative", mt: 2 }}>
          {/* Y-axis labels */}
          <Stack
            spacing={0}
            sx={{
              position: "absolute",
              left: -40,
              top: 0,
              height: "100%",
              justifyContent: "space-between",
            }}
          >
            {[100, 80, 60, 40, 20, 0].map((value, index) => (
              <Typography key={index} variant="caption" color="text.disabled">
                {value}
              </Typography>
            ))}
          </Stack>

          {/* Chart SVG */}
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradient-hours" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Fill area */}
            <path
              d={`${linePath} L 100 100 L 0 100 Z`}
              fill="url(#gradient-hours)"
            />
            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#6366F1"
              strokeWidth="0.5"
            />
          </svg>
        </Box>

        {/* X-axis labels */}
        <Stack direction="row" spacing={0} sx={{ mt: 1, justifyContent: "space-between" }}>
          {years.map((year, index) => (
            <Box key={index} sx={{ flex: 1, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                {year}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
