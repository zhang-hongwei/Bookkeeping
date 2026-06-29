"use client";

import { useState } from "react";
import { Box, IconButton, ListItem, ListItemButton, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChevronLeft } from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { varAlpha } from "@/utils/color";
import type { ToolNavItem } from "../_config/nav-config";

interface ToolsSidebarProps {
  navData: ToolNavItem[];
}

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 56;

export function ToolsSidebar({ navData }: ToolsSidebarProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);

  const isOpen = !collapsed || hovered;
  const currentWidth = isOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <>
      {/* Floating Sidebar */}
      <Box
        component="nav"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          maxHeight: "80vh",
          overflowY: "auto",
          position: "fixed",
          left: 16,
          top: "50%",
          transform: "translateY(-50%)",
          width: currentWidth,
          minHeight: 200,
          py: 2,
          px: collapsed ? 0.5 : 1.5,
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
          display: "flex",
          flexDirection: "column",
          bgcolor: theme.vars.palette.background.paper,
          borderRadius: 2,
          border: `1px solid ${varAlpha(theme.vars.palette.grey["500Channel"], 0.12)}`,
          boxShadow: theme.shadows[8],
          zIndex: 1200,
          transition: theme.transitions.create(["width", "padding"], {
            easing: theme.transitions.easing.easeOut,
            duration: 200,
          }),
          ...theme.applyStyles("dark", {
            bgcolor: theme.vars.palette.grey[900],
          }),
        }}
      >
        {/* Header */}
        {isOpen && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
              minHeight: 32,
              pl: '12px'
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: theme.vars.palette.text.primary,
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              Dev Tools
            </Typography>

          </Box>
        )}

        {/* Navigation Items */}
        <Box
          component="ul"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            p: 0,
            m: 0,
            listStyle: "none",
          }}
        >
          {navData.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");

            const navItem = (
              <ListItem disableGutters disablePadding key={item.path}>
                <ListItemButton
                  disableGutters
                  component={Link}
                  href={item.path}
                  sx={{
                    py: 1,
                    px: collapsed && !hovered ? 0 : 1.5,
                    borderRadius: 1.5,
                    justifyContent: collapsed && !hovered ? "center" : "flex-start",
                    color: isActive
                      ? theme.vars.palette.primary.main
                      : theme.vars.palette.text.secondary,
                    bgcolor: isActive
                      ? varAlpha(theme.vars.palette.primary.mainChannel, 0.12)
                      : "transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: isActive
                        ? varAlpha(theme.vars.palette.primary.mainChannel, 0.2)
                        : varAlpha(theme.vars.palette.grey["500Channel"], 0.08),
                      color: isActive
                        ? theme.vars.palette.primary.main
                        : theme.vars.palette.text.primary,
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 24,
                      height: 24,
                    }}
                  >
                    {item.icon}
                  </Box>
                  {isOpen && (
                    <Typography
                      variant="body2"
                      sx={{
                        ml: 1.5,
                        fontWeight: isActive ? 600 : 400,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                      {item.title}
                    </Typography>
                  )}
                </ListItemButton>
              </ListItem>
            );

            // Show tooltip when collapsed and not hovered
            if (collapsed && !hovered) {
              return (
                <Tooltip
                  key={item.path}
                  title={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {item.title}
                      </Typography>
                      {item.description && (
                        <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                          {item.description}
                        </Typography>
                      )}
                    </Box>
                  }
                  placement="right"
                  arrow
                >
                  {navItem}
                </Tooltip>
              );
            }

            return navItem;
          })}
        </Box>
      </Box>
    </>
  );
}
