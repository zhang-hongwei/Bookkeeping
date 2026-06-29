import type { Components, Theme } from "@mui/material/styles";

export const MuiTableCell: Components<Theme>["MuiTableCell"] = {
  styleOverrides: {
    head: ({ theme }) => ({
      fontSize: theme.typography.pxToRem(14),
      color: theme.vars.palette.text.secondary,
      fontWeight: theme.typography.fontWeightSemiBold,
      // backgroundColor: theme.vars.palette.background.neutral,
    }),
  },
};
