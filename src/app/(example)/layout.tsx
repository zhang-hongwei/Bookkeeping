"use client";

import { useState } from "react";
import { useTheme } from "@mui/material/styles";

import { NavDesktop } from "@/components/layouts/main/MainNav";
import { useNavData } from "@/components/layouts/main/nav-config";
import { HeaderActions } from "@/components/layouts/main/HeaderActions";

import { HeaderSection } from "@/components/layouts/core/header-section";
import { dashboardLayoutVars } from "@/components/layouts/core/css-vars";
import { layoutClasses } from "@/components/layouts/core/classes";

import MainLayout from "@/components/layouts/core/layout";
import { useLayoutStore } from "@/store/layoutStore";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const layoutQuery = "md" as const;
  const navData = useNavData();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const { compact } = useLayoutStore();

  const handleToggleNav = () => {
    setNavCollapsed((prev) => !prev);
  };

  const renderHeader = () => {
    const headerSlots = {
      rightArea: <HeaderActions />,
    };

    return (
      <HeaderSection
        disableElevation
        layoutQuery={layoutQuery}
        slots={headerSlots}
        slotProps={{
          container: { maxWidth: false },
        }}
      />
    );
  };

  return (
    <MainLayout
      headerSlot={renderHeader()}
      sidebarSlot={
        <NavDesktop
          data={navData}
          layoutQuery={layoutQuery}
          collapsed={navCollapsed}
          onToggleCollapse={handleToggleNav}
        />
      }
      compact={compact}
      cssVars={dashboardLayoutVars(theme)}
      sx={{
        [`& .${layoutClasses.sidebarContainer}`]: {
          [theme.breakpoints.up(layoutQuery)]: {
            pl: navCollapsed ? "80px" : "var(--layout-nav-vertical-width)",
            transition: theme.transitions.create(["padding-left"], {
              easing: "var(--layout-transition-easing)",
              duration: "var(--layout-transition-duration)",
            }),
          },
        },
        height: "100%",
      }}
    >
      {/* <MainSection>{children}</MainSection> */}
      {children}
    </MainLayout>
  );
};
export default Layout;
