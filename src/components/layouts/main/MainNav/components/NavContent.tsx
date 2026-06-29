import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import type { NavContentProps } from "../types";
import { NavLogo } from "./NavLogo";
import { NavItemParent } from "./NavItemParent";
import { useNavExpansion } from "../hooks/useNavExpansion";

export function NavContent({ data, slots, sx, collapsed = false }: NavContentProps) {
  const pathname = usePathname();
  const { toggleExpand, isExpanded } = useNavExpansion();

  return (
    <>
      {/* Logo */}
      <NavLogo collapsed={collapsed} />

      {!collapsed && slots?.topArea}

      {/* Scrollable Navigation */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Box
          component="nav"
          sx={[
            {
              display: "flex",
              flex: "1 1 auto",
              flexDirection: "column",
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <Box
            component="ul"
            sx={{
              gap: 0.5,
              display: "flex",
              flexDirection: "column",
              px: 0,
            }}
          >
            {data.map((item) => {
              const isActive = item.path === pathname;
              const hasChildren = item.children && item.children.length > 0;
              const expanded = isExpanded(item.path);
              const isChildActive = Boolean(
                hasChildren &&
                item.children?.some((child) => child.path === pathname)
              );

              return (
                <NavItemParent
                  key={item.path}
                  item={item}
                  collapsed={collapsed}
                  isActive={isActive}
                  hasChildren={hasChildren}
                  isExpanded={expanded}
                  isChildActive={isChildActive}
                  onToggleExpand={toggleExpand}
                />
              );
            })}
          </Box>
        </Box>
      </Box>
    </>
  );
}
