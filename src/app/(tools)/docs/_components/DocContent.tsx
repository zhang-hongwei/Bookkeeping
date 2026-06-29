"use client";

import { Box } from "@mui/material";
import MarkdownContent from "@/app/(ai)/chat/components/MarkdownContent";

export function DocContent({ content }: { content: string }) {
  return (
    <Box
      sx={{
        maxWidth: 900,
        py: 3,
        px: 4,
        "& h1": { mt: 0 },
      }}
    >
      <MarkdownContent content={content} />
    </Box>
  );
}
