"use client";

import { Box, Grid, Stack } from "@mui/material";
import { WelcomeHeader } from "./components/WelcomeHeader";
import { StatsCards } from "./components/StatsCards";
import { HoursSpentChart } from "./components/HoursSpentChart";
import { StrengthChart } from "./components/StrengthChart";
import { RemindersCard } from "./components/RemindersCard";
import { CourseProgressChart } from "./components/CourseProgressChart";
import { ContinueCourseList } from "./components/ContinueCourseList";

export default function CoursePage() {
  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3, overflowY: "auto" }}>
        {/* Welcome Header */}
        <WelcomeHeader />

        {/* Stats Cards */}
        <StatsCards />

        {/* Hours Spent Chart */}
        <Box sx={{ mb: 3 }}>
          <HoursSpentChart />
        </Box>

        {/* Course Progress and Continue Course */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <CourseProgressChart />
          </Grid>
          <Grid size={{ xs: 12, lg: 7 }}>
            <ContinueCourseList />
          </Grid>
        </Grid>
      </Box>

      {/* Right Sidebar */}
      <Box
        sx={{
          width: 360,
          borderLeft: 1,
          borderColor: "divider",
          p: 3,
          overflowY: "auto",
          display: { xs: "none", xl: "block" },
        }}
      >
        <Stack spacing={3}>
          <StrengthChart />
          <RemindersCard />
        </Stack>
      </Box>
    </Box>
  );
}
