"use client";

import { Grid, Typography, Stack } from "@mui/material";
import {
  TopStatsCards,
  ChartsSection,
  BottomSection,
} from "./components";
import {
  topStatsData,
  visitsData,
  websiteVisitsData,
  conversionRatesData,
} from "./data";

export default function AnalyticsPage() {
  return (
    <Stack >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Hi, Welcome back 👋
      </Typography>

      <TopStatsCards data={topStatsData} />

      <ChartsSection
        visitsData={visitsData}
        websiteVisitsData={websiteVisitsData}
      />

      <BottomSection conversionRatesData={conversionRatesData} />
    </Stack>
  );
}
