import { Grid } from "@mui/material";
import { StatisticsCard } from "./StatisticsCard";
import { CustomerReviewsCard } from "./CustomerReviewsCard";

export function BottomStatsSection() {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        <StatisticsCard />
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <CustomerReviewsCard />
      </Grid>
    </Grid>
  );
}
