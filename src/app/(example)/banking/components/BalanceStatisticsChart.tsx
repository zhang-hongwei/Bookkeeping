import { Card, CardContent, Box, Typography, Stack, MenuItem, Select } from "@mui/material";
import { balanceStats } from "../data";

export function BalanceStatisticsChart() {
  const years = ["2018", "2019", "2020", "2021", "2022", "2023"];
  const maxValue = Math.max(...balanceStats.map(stat => stat.value));

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Balance statistics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Statistics on balance over time
            </Typography>
          </Box>
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

        {/* Legend */}
        <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
          {balanceStats.map((stat, index) => (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: stat.color,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {stat.label} ({stat.percentage} %)
              </Typography>
            </Stack>
          ))}
        </Stack>

        {/* Values */}
        <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
          {balanceStats.map((stat, index) => (
            <Box key={index}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {stat.value} €
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Bar Chart */}
        <Box sx={{ height: 200, position: "relative" }}>
          <Stack direction="row" spacing={4} alignItems="flex-end" sx={{ height: "100%" }}>
            {years.map((year, yearIndex) => (
              <Stack
                key={yearIndex}
                direction="row"
                spacing={0.5}
                alignItems="flex-end"
                sx={{ flex: 1, height: "100%" }}
              >
                {balanceStats.map((stat, statIndex) => {
                  // Generate random heights for demo (in real app, use actual data)
                  const randomHeight = 40 + Math.random() * 60;

                  return (
                    <Box
                      key={statIndex}
                      sx={{
                        flex: 1,
                        height: `${randomHeight}%`,
                        bgcolor: stat.color,
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          opacity: 0.8,
                          transform: "translateY(-4px)",
                        },
                      }}
                    />
                  );
                })}
              </Stack>
            ))}
          </Stack>

          {/* Y-axis labels */}
          <Stack
            spacing={1}
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
        </Box>

        {/* X-axis labels */}
        <Stack direction="row" spacing={4} sx={{ mt: 1 }}>
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
