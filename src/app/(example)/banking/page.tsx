"use client";

import { Box, Grid, Stack } from "@mui/material";
import { BalanceHeader } from "./components/BalanceHeader";
import { IncomeExpenseCards } from "./components/IncomeExpenseCards";
import { BalanceStatisticsChart } from "./components/BalanceStatisticsChart";
import { ExpensesCategoriesChart } from "./components/ExpensesCategoriesChart";
import { RecentTransitions } from "./components/RecentTransitions";
import { RightSidebar } from "./components/RightSidebar";

export default function BankingPage() {
  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3, overflowY: "auto" }}>
        {/* Header with Total Balance and Actions */}
        <BalanceHeader totalBalance="49 990 €" />

        {/* Income and Expenses Cards */}
        <IncomeExpenseCards />

        {/* Balance Statistics Chart */}
        <Box sx={{ mb: 3 }}>
          <BalanceStatisticsChart />
        </Box>

        {/* Expenses Categories and Recent Transitions */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <ExpensesCategoriesChart />
          </Grid>
          <Grid size={{ xs: 12, lg: 7 }}>
            <RecentTransitions />
          </Grid>
        </Grid>
      </Box>

      {/* Right Sidebar */}
      <RightSidebar />
    </Box>
  );
}
