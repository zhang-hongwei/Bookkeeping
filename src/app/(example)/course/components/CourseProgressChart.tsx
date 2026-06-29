import { Card, CardContent, Box, Typography, Stack } from "@mui/material";
import { courseProgress } from "../data";

export function CourseProgressChart() {
  const total = courseProgress.reduce((sum, item) => sum + item.value, 0);

  // Calculate pie chart segments
  let currentAngle = 0;
  const segments = courseProgress.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle: currentAngle,
    };
  });

  const centerX = 100;
  const centerY = 100;
  const radius = 70;

  // Helper function to convert polar to cartesian
  const polarToCartesian = (angle: number) => {
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(radian),
      y: centerY + radius * Math.sin(radian),
    };
  };

  // Create arc path
  const createArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle);
    const end = polarToCartesian(endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
      `M ${centerX} ${centerY}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      "Z",
    ].join(" ");
  };

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Course progress
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box sx={{ position: "relative", width: 200, height: 200 }}>
            {/* Pie chart */}
            <svg width="200" height="200" viewBox="0 0 200 200">
              {segments.map((segment, index) => (
                <path
                  key={index}
                  d={createArc(segment.startAngle, segment.endAngle)}
                  fill={segment.color}
                />
              ))}
              {/* Center circle */}
              <circle cx={centerX} cy={centerY} r={45} fill="#1F2937" />
            </svg>

            {/* Total in center */}
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Total
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
                {total}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Legend */}
        <Stack direction="row" spacing={3} justifyContent="center">
          {courseProgress.map((item, index) => (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: item.color,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
