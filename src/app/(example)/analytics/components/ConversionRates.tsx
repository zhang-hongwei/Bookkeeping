"use client";

import { Card, CardContent, Box, Typography, Stack } from "@mui/material";
import { ConversionRateData } from "../data";

interface ConversionRatesProps {
  data: ConversionRateData[];
}

export const ConversionRates = ({ data }: ConversionRatesProps) => {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            Conversion rates
          </Typography>
          <Typography variant="caption" color="text.secondary">
            (+43%) than last year
          </Typography>
        </Box>

        <Stack spacing={2.5}>
          {data.map((rateData, index) => (
            <Box key={index}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {rateData.country}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {rateData.total}
                </Typography>
              </Stack>
              <Box sx={{ position: "relative", height: 8 }}>
                {/* Background bar */}
                <Box
                  sx={{
                    position: "absolute",
                    width: "100%",
                    height: 8,
                    bgcolor: "#E0E0E0",
                    borderRadius: 4,
                  }}
                />
                {/* Progress bar */}
                <Box
                  sx={{
                    position: "absolute",
                    width: `${rateData.value}%`,
                    height: 8,
                    bgcolor: "#00AB55",
                    borderRadius: 4,
                  }}
                />
                {/* Value label */}
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    right: `${100 - rateData.value - 3}%`,
                    top: -2,
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  {rateData.total}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};
