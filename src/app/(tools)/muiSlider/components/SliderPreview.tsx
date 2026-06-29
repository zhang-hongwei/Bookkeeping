/**
 * MUI Slider Theme Designer - Preview Component
 * Live preview of the slider with current theme configuration
 */

"use client";

import React from "react";
import { Stack, Box, Typography, Slider, Paper } from "@mui/material";

export interface SliderPreviewProps {
  showMarks?: boolean;
  showValueLabel?: boolean;
  orientation?: "horizontal" | "vertical";
}

export function SliderPreview({
  showMarks = true,
  showValueLabel = true,
  orientation = "horizontal",
}: SliderPreviewProps) {
  const [value1, setValue1] = React.useState<number>(50);
  const [value2, setValue2] = React.useState<number[]>([20, 80]);
  const [value3, setValue3] = React.useState<number>(60);

  const marks = [
    { value: 0, label: "0" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 75, label: "75" },
    { value: 100, label: "100" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 4,
      }}
    >
      <Stack spacing={4} sx={{ width: "100%", maxWidth: 400 }}>
        {/* Single Slider with ValueLabel */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Single Slider
          </Typography>
          <Slider
            value={value1}
            onChange={(_, newValue) => setValue1(newValue as number)}
            valueLabelDisplay={showValueLabel ? "on" : "off"}
            marks={showMarks ? marks : false}
            orientation={orientation}
            sx={orientation === "vertical" ? { height: 200 } : {}}
          />
        </Box>

        {/* Range Slider */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Range Slider
          </Typography>
          <Slider
            value={value2}
            onChange={(_, newValue) => setValue2(newValue as number[])}
            valueLabelDisplay={showValueLabel ? "on" : "off"}
            marks={showMarks ? marks : false}
            orientation={orientation}
            sx={orientation === "vertical" ? { height: 200 } : {}}
          />
        </Box>

        {/* Slider with Steps */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Stepped Slider (step=5)
          </Typography>
          <Slider
            value={value3}
            onChange={(_, newValue) => setValue3(newValue as number)}
            valueLabelDisplay={showValueLabel ? "on" : "off"}
            step={5}
            marks={showMarks ? marks : false}
            min={0}
            max={100}
            orientation={orientation}
            sx={orientation === "vertical" ? { height: 200 } : {}}
          />
        </Box>
      </Stack>
    </Box>
  );
}
