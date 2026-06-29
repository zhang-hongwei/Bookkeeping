import type { Theme } from "@mui/material/styles";

// ----------------------------------------------------------------------

export function MainLayoutVars(theme: Theme) {
  return {
    "--layout-nav-zIndex": theme.zIndex.drawer + 1,
    "--layout-nav-mobile-width": "288px",
    "--layout-header-blur": "8px",
    "--layout-header-zIndex": theme.zIndex.appBar + 1,
    "--layout-header-mobile-height": "64px",
    "--layout-header-desktop-height": "72px",
  };
}

export function dashboardLayoutVars(theme: Theme) {
  return {
    "--layout-nav-vertical-width": "280px",
    "--layout-nav-horizontal-height": "64px",
    "--layout-transition-duration": "0.3s",
    "--layout-transition-easing": theme.transitions.easing.sharp,
    ...MainLayoutVars(theme),
  };
}
