"use client";

import { Grid, Stack } from "@mui/material";
import { useState } from "react";
import { WelcomeCard } from "./components/WelcomeCard";
import { FeaturedAppCard } from "./components/FeaturedAppCard";
import { StatsCard } from "./components/StatsCard";
import { CurrentDownloadCard } from "./components/CurrentDownloadCard";
import { AreaInstalledCard } from "./components/AreaInstalledCard";
import { NewInvoicesCard } from "./components/NewInvoicesCard";
import { RelatedApplicationsCard } from "./components/RelatedApplicationsCard";
import { TopInstalledCountriesCard } from "./components/TopInstalledCountriesCard";
import { TopAuthorsCard } from "./components/TopAuthorsCard";
import { ConversionCard } from "./components/ConversionCard";
import {
  stats,
  invoices,
  relatedApps,
  countries,
  authors,
} from "./data";

export default function AppPage() {
  const [tabValue, setTabValue] = useState(0);
  const [yearFilter, setYearFilter] = useState("2023");

  return (
    <Grid container spacing={3}>
      {/* Welcome Section */}
      <Grid size={{ xs: 12, md: 8 }}>
        <WelcomeCard />
      </Grid>

      {/* Featured App Carousel */}
      <Grid size={{ xs: 12, md: 4 }}>
        <FeaturedAppCard />
      </Grid>

      {/* Stats Cards */}
      {stats.map((stat, index) => (
        <Grid key={index} size={{ xs: 12, md: 4 }}>
          <StatsCard {...stat} />
        </Grid>
      ))}

      {/* Current Download - Donut Chart */}
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <CurrentDownloadCard />
      </Grid>

      {/* Area Installed - Stacked Bar Chart */}
      <Grid size={{ xs: 12, md: 6, lg: 8 }}>
        <AreaInstalledCard
          yearFilter={yearFilter}
          onYearFilterChange={setYearFilter}
        />
      </Grid>

      {/* New Invoices */}
      <Grid size={{ xs: 12, md: 6, lg: 8 }}>
        <NewInvoicesCard invoices={invoices} />
      </Grid>

      {/* Related Applications */}
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <RelatedApplicationsCard
          tabValue={tabValue}
          onTabChange={setTabValue}
          relatedApps={relatedApps}
        />
      </Grid>

      {/* Top Installed Countries */}
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <TopInstalledCountriesCard countries={countries} />
      </Grid>

      {/* Top Authors */}
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <TopAuthorsCard authors={authors} />
      </Grid>

      {/* Conversion Cards */}
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Stack spacing={3}>
          <ConversionCard
            percentage={48}
            value="38 566"
            label="Conversion"
            gradient="linear-gradient(135deg, #00AB55 0%, #007B55 100%)"
          />
          <ConversionCard
            percentage={75}
            value="55 566"
            label="Applications"
            gradient="linear-gradient(135deg, #00B8D9 0%, #006C9C 100%)"
          />
        </Stack>
      </Grid>
    </Grid>
  );
}
