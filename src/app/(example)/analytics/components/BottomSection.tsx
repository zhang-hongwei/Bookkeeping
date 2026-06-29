"use client";

import { Box } from "@mui/material";
import { ConversionRates } from "./ConversionRates";
import { CurrentSubject } from "./CurrentSubject";
import { ConversionRateData } from "../data";

interface BottomSectionProps {
  conversionRatesData: ConversionRateData[];
}

export const BottomSection = ({ conversionRatesData }: BottomSectionProps) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, 1fr)",
        },
        gap: 3,
      }}
    >
      <ConversionRates data={conversionRatesData} />
      <CurrentSubject />
    </Box>
  );
};
