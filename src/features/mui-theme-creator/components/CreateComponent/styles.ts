import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

// Container for the whole page
export const PageContainer = styled(Box)({
  display: "flex",
  height: "100%",
  overflow: "hidden",
});

// Left sidebar
export const Sidebar = styled(Box)(({ theme }) => ({
  width: 280,
  borderRight: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  overflow: "auto",
  backgroundColor: theme.palette.background.paper,
}));

// Editor area
export const EditorArea = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  overflow: "auto",
  backgroundColor: theme.palette.background.default,
  position: "relative",
}));

// Component wrapper with delete button
export const ComponentWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  marginBottom: theme.spacing(2),
  "&:hover .delete-button": {
    opacity: 1,
  },
}));
