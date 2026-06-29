"use client";

import { Box, Grid } from "@mui/material";
import { StatsCard } from "./StatsCard";
import { StatsCardData } from "../data";

interface TopStatsCardsProps {
  data: StatsCardData[];
}

export const TopStatsCards = ({ data }: TopStatsCardsProps) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
        gap: 3,
        mb: 3,
      }}
    >
      {data.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </Box>
  );
};
