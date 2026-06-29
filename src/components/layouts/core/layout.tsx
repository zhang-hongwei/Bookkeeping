import type { Theme, SxProps, CSSObject } from "@mui/material/styles";

import { mergeClasses } from "@/utils/classes";

import { styled } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";

import { layoutClasses } from "./classes";
import { MainLayoutVars } from "./css-vars";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { createContext, useContext, useRef } from "react";
import { Container } from "@mui/material";

// ----------------------------------------------------------------------

// Create context for scroll container ref
export const ScrollContainerContext =
  createContext<React.RefObject<HTMLElement | null> | null>(null);

// Hook to access scroll container ref
export function useScrollContainer() {
  return useContext(ScrollContainerContext);
}


// ----------------------------------------------------------------------

export type MainLayoutProps = React.ComponentProps<"div"> & {
  sx?: SxProps<Theme>;
  cssVars?: CSSObject;
  children?: React.ReactNode;
  footerSlot?: React.ReactNode;
  headerSlot?: React.ReactNode;
  sidebarSlot?: React.ReactNode;
  compact?: boolean;
};

const MainLayout = ({
  sx,
  cssVars,
  children,
  footerSlot,
  headerSlot,
  sidebarSlot,
  compact = false,
  className,
  ...other
}: MainLayoutProps) => {
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  const inputGlobalStyles = (
    <GlobalStyles
      styles={(theme) => ({ body: { ...MainLayoutVars(theme), ...cssVars } })}
    />
  );

  return (
    <>
      {inputGlobalStyles}

      <Stack
        id="root__layout"
        sx={{
          ...sx,
          // border: '1px solid red'
        }}
        direction={"row"}
        height={"100%"}
        {...other}
      >
        {sidebarSlot ? (
          <>
            {sidebarSlot}
            <ScrollContainerContext.Provider value={scrollContainerRef}>
              <Box
                sx={{
                  // border: '1px solid blue',
                  flexGrow: 1,
                  overflow: 'auto'

                }}
                ref={scrollContainerRef as React.Ref<HTMLDivElement>}
              >
                {headerSlot}

                <Box component={'main'}>
                  <Container
                    maxWidth={compact ? "xl" : false}
                  >
                    {children}
                  </Container>
                </Box>

              </Box>
            </ScrollContainerContext.Provider>
          </>
        ) : (
          <>
            {headerSlot}
            {children}
          </>
        )}
      </Stack>
    </>
  );
};

export default MainLayout;
