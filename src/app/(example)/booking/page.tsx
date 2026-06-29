"use client";

import { Stack } from "@mui/material";
import {
  TopStatsSection,
  MiddleStatsSection,
  RadialChartsSection,
  BottomStatsSection,
} from "./components";

export default function BookingPage() {
  return (
    <Stack>
      {/* Top Stats Cards */}
      <TopStatsSection />

      {/* Middle Row - Total Incomes, Booked Status, Tours Available */}
      <MiddleStatsSection />

      {/* Radial Charts Row - Sold & Pending for Payment */}
      <RadialChartsSection />

      {/* Bottom Row - Statistics & Customer Reviews */}
      <BottomStatsSection />
    </Stack>
  );
}
