"use client";

import { Box } from "@mui/material";
import { CurrentVisits } from "./CurrentVisits";
import { WebsiteVisits } from "./WebsiteVisits";
import { VisitData, WebsiteVisitData } from "../data";

interface ChartsSectionProps {
  visitsData: VisitData[];
  websiteVisitsData: WebsiteVisitData[];
}

export const ChartsSection = ({
  visitsData,
  websiteVisitsData,
}: ChartsSectionProps) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, 1fr)",
        },
        gap: 3,
        mb: 3,
      }}
    >
      <CurrentVisits data={visitsData} />
      <WebsiteVisits data={websiteVisitsData} />
    </Box>
  );
};
