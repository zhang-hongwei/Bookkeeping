import { Box, Typography, Avatar, Stack } from "@mui/material";

export function WelcomeHeader() {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Hi, Frankie 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Let's learn something new today!
        </Typography>
      </Box>

      <Avatar
        sx={{
          width: 56,
          height: 56,
          bgcolor: "primary.main",
          fontSize: "1.5rem",
        }}
      >
        🧔
      </Avatar>
    </Stack>
  );
}
