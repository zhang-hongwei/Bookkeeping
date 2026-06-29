import type { Components, Theme } from "@mui/material/styles";

export const MuiTableRow: Components<Theme>["MuiTableRow"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      // 正常状态：使用实体背景色
      backgroundColor: theme.vars.palette.background.paper,

      // hover 状态：使用不透明背景色
      "&.MuiTableRow-hover:hover": {
        // 浅色模式：柔和的浅灰色
        backgroundColor: "rgba(247, 248, 249, 1)",
        // 暗色模式：稍亮的深灰色
        ...theme.applyStyles("dark", {
          backgroundColor: "rgba(39, 49, 58, 1)",
        }),
      },
    }),
  },
};
