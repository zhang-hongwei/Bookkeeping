"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

export function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export function SectionHeader({ title, badge }: { title: string; badge: string }) {
  return (
    <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
      <Typography variant="h5" fontWeight={700}>
        {title}
      </Typography>
      <Chip label={badge} size="small" color="primary" variant="outlined" />
    </Box>
  );
}
