import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { statisticsData } from "../data";
import { useState, useMemo } from "react";
import { Charts } from "@/components/ui/Charts";

export function StatisticsCard() {
  const [yearFilter, setYearFilter] = useState("Yearly");
  const theme = useTheme();

  // ECharts option configuration
  const chartOption = useMemo(() => {
    return {
      grid: {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40,
      },
      xAxis: {
        type: "category",
        data: statisticsData.map((item) => item.year),
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontSize: 12,
          color: "#666",
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontSize: 10,
          color: "#999",
        },
        splitLine: {
          lineStyle: {
            color: "#f0f0f0",
            type: "dashed",
          },
        },
      },
      series: [
        {
          name: "Sold",
          type: "bar",
          data: statisticsData.map((item) => item.sold),
          itemStyle: {
            color: theme.palette.primary.main,
            borderRadius: [4, 4, 0, 0],
          },
          barMaxWidth: 30,
        },
        {
          name: "Canceled",
          type: "bar",
          data: statisticsData.map((item) => item.canceled),
          itemStyle: {
            color: theme.palette.error.light,
            borderRadius: [4, 4, 0, 0],
          },
          barMaxWidth: 30,
        },
      ],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
    };
  }, [theme]);

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Statistics
            </Typography>
            <Stack direction="row" spacing={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: theme.palette.primary.main,
                    borderRadius: 1,
                  }}
                />
                <Typography variant="body2">Sold</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  6.79 k
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: theme.palette.error.light,
                    borderRadius: 1,
                  }}
                />
                <Typography variant="body2">Canceled</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  1.23 k
                </Typography>
              </Stack>
            </Stack>
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <MenuItem value="Yearly">Yearly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Bar Chart */}
        <Box sx={{ height: 300 }}>
          <Charts option={chartOption} />
        </Box>

        {/* Newest booking */}
        <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid #f0f0f0" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Newest booking
              </Typography>
              <Typography variant="caption" color="text.secondary">
                8 bookings
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <IconButton size="small">
                <ChevronLeftIcon />
              </IconButton>
              <IconButton size="small">
                <ChevronRightIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
