"use client";

import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ToolsSidebar } from "./_components/ToolsSidebar";
import { useToolsNavData } from "./_config/nav-config";
import { SettingsPopover } from "@/components/common/SettingsPopover";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const navData = useToolsNavData();

  return (
    <Box
      sx={{
        px: '100px',
        overflow: 'hidden',
        height: '100vh'
      }}
    >
      <ToolsSidebar navData={navData} />
      <Box
        component="main"
        sx={{
          height: "100vh",
          overflow: 'hidden',
          transition: theme.transitions.create(["padding-left"], {
            easing: theme.transitions.easing.easeOut,
            duration: 200,
          }),
        }}
      >
        {children}
      </Box>
      <SettingsPopover />
    </Box>
  );
}
