import type { Components, Theme } from "@mui/material/styles";

export const MuiSelect: Components<Theme>["MuiSelect"] = {
  defaultProps: {
    // 🔑 禁用 Select 下拉菜单的 Backdrop 遮罩和焦点锁定
    // 允许在 Select 打开时点击页面其他元素
    MenuProps: {
      BackdropProps: {
        invisible: true, // 移除遮罩
      },
      disableEnforceFocus: true, // 禁用焦点锁定 (关键!)
      disableAutoFocus: true, // 禁用自动聚焦
      disableScrollLock: true, // 禁用滚动锁定
    },
  },
  styleOverrides: {
    root: {
      // 可以在这里添加样式覆盖
    },
  },
};
