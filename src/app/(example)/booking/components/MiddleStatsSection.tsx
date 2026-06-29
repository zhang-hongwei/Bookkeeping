import { Grid } from "@mui/material";
import { TotalIncomesCard } from "./TotalIncomesCard";
import { BookedStatusCard } from "./BookedStatusCard";
import { ToursAvailableCard } from "./ToursAvailableCard";

export function MiddleStatsSection() {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <TotalIncomesCard />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <BookedStatusCard />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <ToursAvailableCard />
      </Grid>
    </Grid>
  );
}
