import React from "react";
import { Box, ListItem, ListItemButton, Collapse } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { layoutClasses } from "@/components/layouts/core/classes";
import type { NavItemComponentProps } from "../types";
import {
  NAV_CONSTANTS,
  getNavItemBaseStyles,
  getNavItemHoverStyles,
  getNavItemActiveStyles,
} from "../styles/navStyles";
import { NavItemChild } from "./NavItemChild";
import { usePathname } from "next/navigation";

export function NavItemParent({
  item,
  collapsed,
  isActive,
  hasChildren,
  isExpanded,
  isChildActive,
  onToggleExpand,
}: NavItemComponentProps) {
  const theme = useTheme();
  const pathname = usePathname();

  return (
    <React.Fragment>
      <ListItem disableGutters disablePadding>
        <ListItemButton
          disableGutters
          component={hasChildren ? "div" : Link}
          href={hasChildren ? undefined : item.path}
          onClick={hasChildren ? () => onToggleExpand(item.path) : undefined}
          className={layoutClasses.nav.vertical}
          sx={[
            (theme) => ({
              ...getNavItemBaseStyles(theme, collapsed),
              minHeight: NAV_CONSTANTS.parentMinHeight,
              ...getNavItemHoverStyles(theme),
              ...theme.applyStyles("dark", {
                color: theme.vars.palette.text.primary,
              }),
              ...((isActive || isChildActive) && getNavItemActiveStyles(theme)),
            }),
          ]}
        >
          <Box
            component="span"
            sx={{
              width: NAV_CONSTANTS.iconSize,
              height: NAV_CONSTANTS.iconSize,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {item.icon}
          </Box>

          {!collapsed && (
            <>
              <Box component="span" sx={{ flexGrow: 1 }}>
                {item.title}
              </Box>

              {item.info && item.info}

              {hasChildren &&
                (isExpanded ? <ExpandLess /> : <ExpandMore />)}
            </>
          )}
        </ListItemButton>
      </ListItem>

      {/* Render children with Collapse animation */}
      {hasChildren && !collapsed && item.children && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 4 }}>
            {item.children.map((child) => {
              const isChildActived = child.path === pathname;
              return (
                <NavItemChild
                  key={child.path}
                  item={child}
                  isActive={isChildActived}
                />
              );
            })}
          </Box>
        </Collapse>
      )}
    </React.Fragment>
  );
}
