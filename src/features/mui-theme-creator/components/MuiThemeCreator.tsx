"use client";

import React from "react";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import ComponentNavDrawer from "./ComponentNavDrawer";
import MainWindow from "./MainWindow";
import SmallScreenWarning from "./SmallScreenWarning";
import ThemeConfigDrawer from "./ThemeConfigDrawer";
import Tutorial from "./Tutorial";
import ErrorBoundary from "./ErrorBoundary";
import ThemeWrapper from "./ThemeWrapper";

const AppRoot = styled(Box)({
  display: "flex",
  height: "100vh",
});

const HeaderNavAndMain = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
});

const NavAndMain = styled(Box)({
  flex: 1,
  display: "flex",
  minHeight: 0,
});

const Main = styled("main")({
  minWidth: 0,
  minHeight: 0,
  flex: 1,
  display: "flex",
  flexDirection: "column",
});

export interface MuiThemeCreatorProps {
  className?: string;
}

/**
 * MUI Theme Creator - Interactive theme editor for Material-UI
 *
 * A comprehensive theme customization tool that provides:
 * - Visual theme editor with live preview
 * - Code editor with TypeScript support
 * - Pre-built component samples
 * - Theme export and import functionality
 */
export const MuiThemeCreator: React.FC<MuiThemeCreatorProps> = ({
  className,
}) => {
  return (
    <ThemeWrapper>
      <AppRoot className={className}>
        <ErrorBoundary>
          <HeaderNavAndMain>
            <NavAndMain>
              <ComponentNavDrawer />

              <Main>
                <MainWindow />
              </Main>
            </NavAndMain>
          </HeaderNavAndMain>

          <ThemeConfigDrawer />
        </ErrorBoundary>
      </AppRoot>
      <SmallScreenWarning />
      <Tutorial />
    </ThemeWrapper>
  );
};
