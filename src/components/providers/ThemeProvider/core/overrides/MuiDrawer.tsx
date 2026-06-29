import type { Components, Theme } from "@mui/material/styles";
import { varAlpha } from "../../utils";

export const MuiDrawer: Components<Theme>["MuiDrawer"] = {
  styleOverrides: {
    paper: ({ theme }) => ({
      // 使用 CSS 变量来定义渐变背景，这样可以自动响应主题切换
      // Light mode 渐变（默认）
      background:
        "linear-gradient(180deg, rgb(241, 249, 252) 0%, rgb(246, 246, 246) 30%, rgb(255, 255, 255) 60%, rgb(253, 253, 251) 80%, rgb(255, 247, 246) 100%)",
      // Dark mode 渐变和阴影 - 使用正确的 CSS 变量选择器
      ...theme.applyStyles("dark", {
        background:
          "linear-gradient(180deg, rgb(18, 25, 30) 0%, rgb(25, 28, 33) 30%, rgb(30, 33, 38) 60%, rgb(28, 30, 35) 80%, rgb(25, 22, 28) 100%)",
        boxShadow: `${varAlpha(theme.vars.palette.common.blackChannel, 0.24)} -18px 20px 80px -8px`,
      }),
    }),
  },
};
