"use client";

import { Box, Typography } from "@mui/material";
import { usePathname } from "next/navigation";

export function HeaderBreadcrumb() {
  const pathname = usePathname();

  // Generate breadcrumb based on pathname
  const getBreadcrumb = () => {
    const paths = pathname.split("/").filter(Boolean);
    const lastPath = paths[paths.length - 1] || "home";
    const pageName = lastPath.charAt(0).toUpperCase() + lastPath.slice(1);

    return {
      path: `Home / ${pageName}`,
      title: pageName,
    };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <Box>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", mb: 0.5, fontSize: "13px" }}
      >
        {breadcrumb.path}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {breadcrumb.title}
      </Typography>
    </Box>
  );
}
