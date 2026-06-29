import { Card, CardContent, Box, Typography, Stack, Grid } from "@mui/material";
import { expensesCategories } from "../data";

export function ExpensesCategoriesChart() {
  const total = expensesCategories.reduce((sum, cat) => sum + cat.value, 0);
  let currentAngle = 0;

  // Calculate path for each pie slice
  const getSlicePath = (percentage: number, startAngle: number) => {
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;

    const x1 = 100 + 80 * Math.cos(((startAngle - 90) * Math.PI) / 180);
    const y1 = 100 + 80 * Math.sin(((startAngle - 90) * Math.PI) / 180);
    const x2 = 100 + 80 * Math.cos(((endAngle - 90) * Math.PI) / 180);
    const y2 = 100 + 80 * Math.sin(((endAngle - 90) * Math.PI) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    return `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Expenses categories
        </Typography>

        <Grid container spacing={3}>
          {/* Pie Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 300,
              }}
            >
              <Box sx={{ position: "relative", width: 240, height: 240 }}>
                <svg width="240" height="240" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle cx="100" cy="100" r="85" fill="none" stroke="#2D3748" strokeWidth="10" />

                  {/* Pie slices */}
                  {expensesCategories.map((category, index) => {
                    const percentage = category.value;
                    const path = getSlicePath(percentage, currentAngle);
                    currentAngle += (percentage / 100) * 360;

                    return (
                      <path
                        key={index}
                        d={path}
                        fill={category.color}
                        opacity={0.9}
                        style={{
                          cursor: "pointer",
                          transition: "opacity 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "0.9";
                        }}
                      />
                    );
                  })}

                  {/* Center circle */}
                  <circle cx="100" cy="100" r="50" fill="#1A202C" />
                </svg>
              </Box>
            </Box>
          </Grid>

          {/* Legend */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              {expensesCategories.slice(0, 4).map((category, index) => (
                <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: category.color,
                      }}
                    />
                    <Typography variant="body2" color="text.primary">
                      {category.label}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    ({category.value} €)
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
              <Stack spacing={2}>
                {expensesCategories.slice(4).map((category, index) => (
                  <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: category.color,
                        }}
                      />
                      <Typography variant="body2" color="text.primary">
                        {category.label}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      ({category.value} €)
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Totals */}
          <Grid size={{ xs: 12 }}>
            <Stack
              direction="row"
              justifyContent="space-around"
              sx={{
                mt: 2,
                pt: 3,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  Categories
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {expensesCategories.length}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  Categories
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                  ${total.toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
