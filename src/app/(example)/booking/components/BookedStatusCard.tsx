import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  LinearProgress,
} from "@mui/material";
import { bookedStatus } from "../data";

export function BookedStatusCard() {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Booked
        </Typography>
        <Stack spacing={2.5}>
          {bookedStatus.map((status, index) => (
            <Box key={index}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "#666" }}
                >
                  {status.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {status.value.toLocaleString()} k
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={status.percentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "#f0f0f0",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: status.color,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
