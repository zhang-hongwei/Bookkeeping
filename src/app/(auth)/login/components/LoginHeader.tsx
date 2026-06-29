import { Box, Typography } from "@mui/material";

/**
 * Login page header component
 * Displays welcome title and description
 */
export function LoginHeader() {
  return (
    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
      <Typography
        variant="h4"
        gutterBottom
        fontWeight={700}
        sx={{
          mb: { xs: 0.75, sm: 1 },
          fontSize: { xs: "1.75rem", sm: "2rem", md: "2.125rem" },
        }}
      >
        Welcome Back
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ fontSize: { xs: "0.938rem", sm: "1rem" } }}
      >
        Enter your email and password to access your account.
      </Typography>
    </Box>
  );
}
