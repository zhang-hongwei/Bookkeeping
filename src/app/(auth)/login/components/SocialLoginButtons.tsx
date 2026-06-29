import { Box, Button, alpha, useTheme } from "@mui/material";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

interface SocialLoginButtonsProps {
  onSocialLogin: (provider: string) => void;
}

/**
 * Social login buttons component
 * Provides Google and Apple login options
 */
export function SocialLoginButtons({
  onSocialLogin,
}: SocialLoginButtonsProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1.5, sm: 2 },
        mb: { xs: 2.5, sm: 3 },
      }}
    >
      <Button
        variant="outlined"
        size="large"
        fullWidth
        startIcon={<FcGoogle size={20} />}
        onClick={() => onSocialLogin("Google")}
        sx={{
          py: { xs: 1.25, sm: 1.5 },
          fontSize: { xs: "0.938rem", sm: "1rem" },
          borderColor: alpha(theme.palette.divider, 0.3),
          color: "text.primary",
          fontWeight: 500,
          textTransform: "none",
          "&:hover": {
            borderColor: alpha(theme.palette.divider, 0.5),
            bgcolor: alpha(theme.palette.action.hover, 0.05),
          },
        }}
      >
        Google
      </Button>
      <Button
        variant="outlined"
        size="large"
        fullWidth
        startIcon={<FaApple size={20} />}
        onClick={() => onSocialLogin("Apple")}
        sx={{
          py: { xs: 1.25, sm: 1.5 },
          fontSize: { xs: "0.938rem", sm: "1rem" },
          borderColor: alpha(theme.palette.divider, 0.3),
          color: "text.primary",
          fontWeight: 500,
          textTransform: "none",
          "&:hover": {
            borderColor: alpha(theme.palette.divider, 0.5),
            bgcolor: alpha(theme.palette.action.hover, 0.05),
          },
        }}
      >
        Apple
      </Button>
    </Box>
  );
}
