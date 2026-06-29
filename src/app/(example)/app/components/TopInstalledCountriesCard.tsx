import { Card, CardContent, Typography, Stack, Box } from "@mui/material";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";

interface Country {
  name: string;
  flag: string;
  stats: string[];
}

interface TopInstalledCountriesCardProps {
  countries: Country[];
}

export function TopInstalledCountriesCard({
  countries,
}: TopInstalledCountriesCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Top installed countries
        </Typography>
        <Stack spacing={2.5}>
          {countries.map((country, index) => (
            <Stack key={index} direction="row" spacing={2} alignItems="center">
              <Box
                component="img"
                src={country.flag}
                sx={{ width: 28, height: 28 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {country.name}
                </Typography>
                <Stack direction="row" spacing={2}>
                  {country.stats.map((stat, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                    >
                      <CloudDownloadOutlinedIcon
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {stat}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
