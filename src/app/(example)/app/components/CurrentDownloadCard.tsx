import { Card, CardContent, Box, Typography, Stack } from "@mui/material";
import { DonutChart } from "@/components/ui/Charts";
import { ECHARTS_COLOR_PALETTE } from "@/config/echarts";

export function CurrentDownloadCard() {
  // 图表数据 - 使用主题调色盘
  const chartData = [
    { name: "Mac", value: 47235 },      // 自动使用 ECHARTS_COLOR_PALETTE[0] - primary
    { name: "Windows", value: 62548 },  // 自动使用 ECHARTS_COLOR_PALETTE[1] - info
    { name: "iOS", value: 39187 },      // 自动使用 ECHARTS_COLOR_PALETTE[2] - success
    { name: "Android", value: 39275 },  // 自动使用 ECHARTS_COLOR_PALETTE[3] - warning
  ];

  // Legend 使用的颜色（与图表保持一致）
  const legendColors = [
    ECHARTS_COLOR_PALETTE[0], // Mac - primary
    ECHARTS_COLOR_PALETTE[1], // Windows - info
    ECHARTS_COLOR_PALETTE[2], // iOS - success
    ECHARTS_COLOR_PALETTE[3], // Android - warning
  ];

  // 计算总数
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card sx={{ height: "100%" }} >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Current download
        </Typography>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Downloaded by operating system
        </Typography>

        {/* Donut Chart - 使用 ECharts */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            my: 3,
            height: 240,
          }}
        >
          <DonutChart
            data={chartData}
            centerText={total.toLocaleString()}
            centerSubText="Total"
            height={240}
            width={240}
            radius={["40%", "70%"]}
            showLabel={false}
            showLegend={false}
          />
        </Box>

        <Stack spacing={1.5}>
          {chartData.map((item, index) => (
            <Stack
              key={item.name}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: legendColors[index],
                    borderRadius: "50%",
                  }}
                />
                <Typography variant="body2">{item.name}</Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.value.toLocaleString()}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
