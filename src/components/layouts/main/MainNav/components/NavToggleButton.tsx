import { IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import type { Breakpoint } from "@mui/material/styles";
import { varAlpha } from "@/utils/color";
import { NAV_CONSTANTS } from "../styles/navStyles";

interface NavToggleButtonProps {
  collapsed: boolean;
  onToggle: () => void;
  layoutQuery: Breakpoint;
}

export function NavToggleButton({
  collapsed,
  onToggle,
  layoutQuery,
}: NavToggleButtonProps) {
  const theme = useTheme();

  return (
    <IconButton
      onClick={onToggle}
      sx={{
        position: "absolute",
        top: "calc(var(--layout-header-desktop-height, 80px) / 2)",
        left: collapsed ? "80px" : "var(--layout-nav-vertical-width)",
        transform: "translate(-50%, -50%)",
        zIndex: "var(--layout-nav-zIndex)",
        color: theme.vars.palette.action.active,
        bgcolor: theme.vars.palette.background.default,
        border: `1px solid ${varAlpha(theme.vars.palette.grey["500Channel"], 0.12)}`,
        transition: theme.transitions.create(["left"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        "&:hover": {
          bgcolor: theme.vars.palette.background.default,
          borderColor: varAlpha(theme.vars.palette.grey["500Channel"], 0.24),
        },
        [theme.breakpoints.down(layoutQuery)]: {
          display: "none",
        },
        width: NAV_CONSTANTS.toggleButtonSize,
        height: NAV_CONSTANTS.toggleButtonSize,
        boxShadow: 5,
      }}
    >
      {collapsed ? (
        <ChevronRight sx={{ fontSize: NAV_CONSTANTS.toggleButtonSize }} />
      ) : (
        <ChevronLeft sx={{ fontSize: NAV_CONSTANTS.toggleButtonSize }} />
      )}
    </IconButton>
  );
}
