/**
 * CSS Grid Generator
 * Main component - Grid canvas with controls panel
 */

import React from "react";
import { Box } from "@mui/material";
import GridCanvas from "./components/GridCanvas";
import GridControls from "./components/GridControls";

/**
 * CSS Grid Generator main component
 * Two-column layout: Canvas (left) + Controls (right)
 */
export default function CSSGridGenerator() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: {
          xs: "column",
          md: "row",
        },
        gap: 0,
        minHeight: {
          xs: "auto",
          md: "calc(100vh - 300px)",
        },
      }}
    >
      {/* Left: Grid Canvas */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          p: 3,
          // backgroundColor: "grey.100",
          padding: "50px 70px",
          // border: '1px solid red'
        }}
      >
        <GridCanvas />
      </Box>

      {/* Right: Controls Panel */}
      <Box
        sx={{
          width: {
            xs: "100%",
            md: 320,
          },
          flexShrink: 0,
          borderLeft: '1px solid',
          borderColor: 'divider',
          borderTop: {
            xs: 1,
            md: "none",
          },
        }}
      >
        <GridControls />
      </Box>
    </Box>
  );
}
