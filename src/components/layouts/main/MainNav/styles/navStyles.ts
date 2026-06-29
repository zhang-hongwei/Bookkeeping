import type { Theme } from "@mui/material/styles";
import { varAlpha } from "@/utils/color";

// Constants
export const NAV_CONSTANTS = {
  iconSize: 24,
  parentMinHeight: 44,
  childMinHeight: 40,
  childDotSize: 6,
  toggleButtonSize: 12,
} as const;

// Reusable style functions
export const getNavItemBaseStyles = (_theme: Theme, collapsed: boolean) => ({
  pl: collapsed ? 0 : 2,
  py: 1,
  gap: 2,
  pr: collapsed ? 0 : 1.5,
  borderRadius: 0.75,
  typography: "body2",
  transition: "all 0.3s ease-in-out",
  justifyContent: collapsed ? "center" : "flex-start",
});

export const getNavItemHoverStyles = (theme: Theme) => ({
  "&:hover": {
    transition: "all 0.3s ease-in-out",
    bgcolor: "rgba(255,255,255,0.1)",
  },
  ...theme.applyStyles("dark", {
    "&:hover": {
      bgcolor: theme.vars.palette.action.hover,
    },
  }),
});

export const getNavItemActiveStyles = (theme: Theme) => ({
  fontWeight: "bold",
  color: theme.vars.palette.primary.main,
  bgcolor: "rgba(255,255,255,1)",
  "&:hover": {
    transition: "all 0.3s ease-in-out",
    fontWeight: "bold",
    color: theme.vars.palette.primary.main,
    bgcolor: "rgba(255,255,255,1)",
  },
  ...theme.applyStyles("dark", {
    color: theme.vars.palette.primary.light,
    bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
    "&:hover": {
      color: theme.vars.palette.primary.light,
      bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.24),
    },
  }),
});

export const getChildNavItemActiveStyles = (theme: Theme) => ({
  fontWeight: "600",
  color: theme.vars.palette.primary.main,
  bgcolor: "rgba(255,255,255,0.5)",
  ...theme.applyStyles("dark", {
    color: theme.vars.palette.primary.light,
    bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
  }),
});

export const getChildNavItemDarkStyles = (theme: Theme) =>
  theme.applyStyles("dark", {
    color: theme.vars.palette.text.secondary,
    "&:hover": {
      bgcolor: theme.vars.palette.action.hover,
    },
  });
