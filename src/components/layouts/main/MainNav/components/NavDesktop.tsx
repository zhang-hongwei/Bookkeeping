import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { varAlpha } from "@/utils/color";
import type { NavDesktopProps } from "../types";
import { NavContent } from "./NavContent";
import { NavToggleButton } from "./NavToggleButton";

export function NavDesktop({
  sx,
  data,
  slots,
  layoutQuery = "md",
  collapsed = false,
  onToggleCollapse,
}: NavDesktopProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        flexShrink: 0,
        pt: 2.5,
        px: 2.5,
        height: 1,
        display: "none",
        position: "relative",
        flexDirection: "column",
        zIndex: "var(--layout-nav-zIndex)",
        width: collapsed ? "80px" : "var(--layout-nav-vertical-width)",
        borderRight: `1px solid ${varAlpha(theme.vars.palette.grey["500Channel"], 0.12)}`,
        ...theme.applyStyles("dark", {
          backgroundColor: theme.vars.palette.background.paper,
        }),
        transition: theme.transitions.create(["width"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        [theme.breakpoints.up(layoutQuery)]: {
          display: "flex",
        },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} collapsed={collapsed} />

      {/* Toggle Button */}
      {onToggleCollapse && (
        <NavToggleButton
          collapsed={collapsed}
          onToggle={onToggleCollapse}
          layoutQuery={layoutQuery}
        />
      )}
    </Box>
  );
}
