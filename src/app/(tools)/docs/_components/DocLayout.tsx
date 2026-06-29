"use client";

import { Box } from "@mui/material";
import { DocSidebar } from "./DocSidebar";

export function DocLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <DocSidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
