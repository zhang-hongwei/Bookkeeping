"use client";

import { Card, CardContent, Box, Typography, Stack } from "@mui/material";
import { DonutChart } from "@/components/ui/Charts";
import { VisitData } from "../data";
import { ECHARTS_COLOR_PALETTE } from "@/config/echarts";

interface CurrentVisitsProps {
  data: VisitData[];
}

export const CurrentVisits = ({ data }: CurrentVisitsProps) => {
  // Legend 颜色与图表保持一致
  const legendColors = data.map((_, index) => ECHARTS_COLOR_PALETTE[index]);

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Current visits
        </Typography>
        <DonutChart
          data={data.map((item) => ({
            name: item.name,
            value: item.value,
          }))}
          height={280}
          centerText=""
          centerSubText=""
        />
        <Stack spacing={1.5} sx={{ mt: 3 }}>
          {data.map((item, index) => (
            <Stack
              key={index}
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
                {item.value}%
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};
