import { Grid, Card, CardContent, Box, Typography, useTheme } from "@mui/material";
import { GaugeChart } from "@/components/ui/Charts";

export function RadialChartsSection() {
  const theme = useTheme();

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Card>
          <CardContent
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box sx={{ textAlign: "center", width: "100%" }}>
              <Box sx={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GaugeChart
                  value={73.9}
                  color={theme.palette.primary.main}
                  width={140}
                  height={140}
                  showDetail={false}
                  showPointer={false}
                />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, mt: 1 }}>
                38 566
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sold
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Card>
          <CardContent
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box sx={{ textAlign: "center", width: "100%" }}>
              <Box sx={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GaugeChart
                  value={45.6}
                  color={theme.palette.warning.main}
                  width={140}
                  height={140}
                  showDetail={false}
                  showPointer={false}
                />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, mt: 1 }}>
                18 472
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending for payment
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
