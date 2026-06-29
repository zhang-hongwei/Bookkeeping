/**
 * GridCanvas styled components
 * Uses MUI theme tokens + applyStyles for dark mode
 */

import { Box, styled } from "@mui/material";

/**
 * Main container for the grid canvas
 * Responsive width and height
 */
export const Container = styled("div")(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "calc(100vh - 380px)",
  minHeight: 400,
  [theme.breakpoints.down("md")]: {
    height: 400,
    minHeight: 300,
  },
}));

/**
 * Grid container with border and background
 */
export const GridContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  // border: `1px solid ${theme.palette.primary.main}`,
  // p: '10px',
  borderRadius: theme.shape.borderRadius,
  width: "100%",
  height: "100%",
  backgroundColor: theme.palette.grey[50],
  boxShadow: theme.shadows[2],
  ...theme.applyStyles("dark", {
    backgroundColor: theme.palette.grey[900],
  }),
}));

/**
 * Grid layer for positioning grid items
 */
export const GridLayer = styled("section", {
  shouldForwardProp: (prop: PropertyKey) =>
    typeof prop === "string" && !prop.startsWith("$"),
})<{
  $colTemplate: string;
  $rowTemplate: string;
  $columnGap: number;
  $rowGap: number;
}>(({ $colTemplate, $rowTemplate, $columnGap, $rowGap }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "grid",
  gridTemplateColumns: $colTemplate,
  gridTemplateRows: $rowTemplate,
  columnGap: `${$columnGap}px`,
  rowGap: `${$rowGap}px`,
}));

/**
 * Individual grid box for drag selection
 */
export const GridBox = styled("div", {
  shouldForwardProp: (prop: PropertyKey) =>
    typeof prop === "string" && !prop.startsWith("$"),
})<{ $area?: string; $color?: string }>(({ theme }) => ({
  position: "relative",
  backgroundColor: "transparent",
  border: `1px dashed ${theme.palette.divider}`,
  transition: "all 0.15s ease",
  cursor: "crosshair",
  userSelect: "none",
  WebkitUserSelect: "none",

  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    ...theme.applyStyles("dark", {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    }),
  },
}));

/**
 * Child area item - named grid area
 */
export const ChildArea = styled(Box, {
  shouldForwardProp: (prop: PropertyKey) =>
    typeof prop === "string" && !prop.startsWith("$"),
})<{ $area: string; $color: string }>(({ theme, $area, $color }) => ({
  position: "relative",
  gridArea: $area,
  backgroundColor: $color,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius / 2,
  transition: "all 0.2s ease",
  pointerEvents: "auto",

  "&:hover": {
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
  },

  "&:hover button": {
    opacity: 1,
  },
}));

/**
 * Delete button for child areas
 */
export const DeleteButton = styled("button")(({ theme }) => ({
  position: "absolute",
  right: 0,
  top: 0,
  padding: "0 6px",
  margin: 0,
  color: theme.palette.common.white,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  border: "none",
  borderRadius: `0 ${theme.shape.borderRadius / 2}px 0 4px`,
  fontSize: "14px",
  cursor: "pointer",
  opacity: 0,
  transition: "opacity 0.2s ease",

  "&:hover": {
    backgroundColor: theme.palette.error.main,
  },
}));

/**
 * Area label text
 */
export const AreaLabel = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  padding: "2px 8px",
  textAlign: "center",
  color: theme.palette.common.white,
  fontSize: "12px",
  fontWeight: 500,
  pointerEvents: "none",
  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
}));
