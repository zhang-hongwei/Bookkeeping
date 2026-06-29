import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface NavLogoProps {
  collapsed: boolean;
}

export function NavLogo({ collapsed }: NavLogoProps) {
  const theme = useTheme();

  if (collapsed) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        sx={{
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "-0.5px",
          textAlign: "center",
          ...theme.applyStyles("dark", {
            color: theme.vars.palette.text.primary,
          }),
        }}
      >
        Prduct Hub
      </Typography>
    </Box>
  );
}
