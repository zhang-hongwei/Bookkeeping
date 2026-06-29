import type { Components, Theme } from "@mui/material/styles";
import { varAlpha } from "../../utils";

export const MuiBackdrop: Components<Theme>["MuiBackdrop"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      backgroundColor: varAlpha(theme.vars.palette.grey["900Channel"], 0.8),
    }),
    invisible: {
      background: "transparent",
    },
  },
};
