import type { Components, Theme } from "@mui/material/styles";

export const MuiFormLabel: Components<Theme>["MuiFormLabel"] = {
  styleOverrides: {
    asterisk: {
      color: "#FF3B30", // 必填字段星号颜色
    },
  },
};
