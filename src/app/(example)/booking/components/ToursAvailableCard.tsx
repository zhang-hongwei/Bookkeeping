import { Card, CardContent, Box, Typography, Stack, useTheme } from "@mui/material";
import { GaugeChart } from "@/components/ui/Charts";

export function ToursAvailableCard() {
  const theme = useTheme();

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Tours available
        </Typography>
        <GaugeChart
          value={186}
          max={286}
          title="Tours"
          height={200}
          showPointer={false}
          color={[theme.palette.primary.main, theme.palette.grey[300]]}
        />
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: theme.palette.primary.main,
                  borderRadius: "50%",
                }}
              />
              <Typography variant="body2">Sold out</Typography>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              120 tours
            </Typography>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: theme.palette.grey[300],
                  borderRadius: "50%",
                }}
              />
              <Typography variant="body2">Available</Typography>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              66 tours
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
