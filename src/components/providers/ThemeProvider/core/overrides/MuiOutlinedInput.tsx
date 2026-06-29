import type { Components, Theme } from "@mui/material/styles";
import { varAlpha } from "../../utils";

export const MuiOutlinedInput: Components<Theme>["MuiOutlinedInput"] = {
  styleOverrides: {
    notchedOutline: ({ theme }) => ({
      borderColor: varAlpha(theme.vars.palette.grey["500Channel"], 0.2),
    }),
  },
};
