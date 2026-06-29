import type { Components, Theme } from "@mui/material/styles";

export const MuiCard: Components<Theme>["MuiCard"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      zIndex: 0,
      position: "relative",
      boxShadow: theme.vars.customShadows.card,
      borderRadius: (theme.shape.borderRadius as number) * 2,
    }),
  },
};
