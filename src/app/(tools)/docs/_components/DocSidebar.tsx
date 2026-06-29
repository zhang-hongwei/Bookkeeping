"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { muiDocs } from "../_config/doc-entries";

export function DocSidebar() {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        width: 260,
        minWidth: 260,
        borderRight: 1,
        borderColor: "divider",
        height: "100%",
        overflowY: "auto",
        py: 1,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ px: 2, py: 1, color: "text.secondary", fontWeight: 600 }}
      >
        MUI Theme Docs
      </Typography>
      <List dense disablePadding>
        <ListItemButton
          component={Link}
          href="/docs"
          selected={pathname === "/docs"}
          sx={{ borderRadius: 1, mx: 0.5 }}
        >
          <ListItemText primary="Overview" primaryTypographyProps={{ fontSize: 14 }} />
        </ListItemButton>
        {muiDocs.map((doc) => {
          const isActive = pathname === `/docs/${doc.slug}`;
          return (
            <ListItemButton
              key={doc.slug}
              component={Link}
              href={`/docs/${doc.slug}`}
              selected={isActive}
              sx={{ borderRadius: 1, mx: 0.5 }}
            >
              <ListItemText
                primary={doc.title}
                primaryTypographyProps={{ fontSize: 14 }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
