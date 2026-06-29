import { Box, ListItem, ListItemButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import type { NavItemChildProps } from "../types";
import {
  NAV_CONSTANTS,
  getNavItemBaseStyles,
  getNavItemHoverStyles,
  getChildNavItemActiveStyles,
  getChildNavItemDarkStyles,
} from "../styles/navStyles";

export function NavItemChild({ item, isActive }: NavItemChildProps) {
  const theme = useTheme();

  return (
    <ListItem disableGutters disablePadding>
      <ListItemButton
        disableGutters
        component={Link}
        href={item.path}
        sx={[
          (theme) => ({
            ...getNavItemBaseStyles(theme, false),
            minHeight: NAV_CONSTANTS.childMinHeight,
            ...getNavItemHoverStyles(theme),
            ...getChildNavItemDarkStyles(theme),
            ...(isActive && getChildNavItemActiveStyles(theme)),
          }),
        ]}
      >
        <Box
          component="span"
          sx={{
            width: NAV_CONSTANTS.childDotSize,
            height: NAV_CONSTANTS.childDotSize,
            borderRadius: "50%",
            bgcolor: "currentColor",
            opacity: 0.5,
          }}
        />
        <Box component="span" sx={{ flexGrow: 1 }}>
          {item.title}
        </Box>
      </ListItemButton>
    </ListItem>
  );
}
