import type { Components, Theme } from "@mui/material/styles";

export const MuiMenu: Components<Theme>["MuiMenu"] = {
  defaultProps: {
    // 全局禁用 Menu 的 Backdrop 和焦点锁定
    BackdropProps: {
      invisible: true,
    },
    disableEnforceFocus: true,
    disableAutoFocus: true,
    disableScrollLock: true,
  },
};
