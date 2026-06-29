import type { Theme } from "@mui/material/styles";

export const MuiCssBaseline = {
  styleOverrides: {
    "::selection": {
      backgroundColor: "var(--palette-primary-main)",
      color: "var(--palette-primary-contrastText)",
    },
  },
} as const;
