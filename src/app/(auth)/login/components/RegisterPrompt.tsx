import { Box, Typography, Link as MuiLink, useTheme } from "@mui/material";
import Link from "next/link";

/**
 * Register prompt component
 * Displays a link to the registration page for users without an account
 */
export function RegisterPrompt() {
  const theme = useTheme();

  return (
    <Box sx={{ mt: { xs: 2.5, sm: 3 }, textAlign: "center" }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: { xs: "0.813rem", sm: "0.875rem" } }}
      >
        Don&apos;t Have An Account?{" "}
        <MuiLink
          component={Link}
          href="/signup"
          underline="none"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 600,
            fontSize: { xs: "0.813rem", sm: "0.875rem" },
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          Register Now.
        </MuiLink>
      </Typography>
    </Box>
  );
}
