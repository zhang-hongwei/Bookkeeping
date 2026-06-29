/**
 * Flex Preview Component
 * Interactive flexbox playground
 */

"use client";

import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import type { FlexContainerConfig, FlexItemConfig } from "../types";

interface FlexPreviewProps {
  config: FlexContainerConfig;
  items: FlexItemConfig[];
  itemColor: string;
}

export function FlexPreview({ config, items, itemColor }: FlexPreviewProps) {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: config.direction,
    flexWrap: config.wrap,
    justifyContent: config.justifyContent,
    alignItems: config.alignItems,
    gap: config.gap ? `${config.gap}px` : undefined,
    minHeight: 300,
    padding: 16,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderRadius: 8,
    border: "2px dashed rgba(99, 102, 241, 0.3)",
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Preview container */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: (theme) =>
            theme.vars.palette.mode === "dark" ? "grey.900" : "grey.100",
          borderRadius: 2,
        }}
      >
        <Box style={containerStyle}>
          {items.map((item, index) => (
            <Box
              key={index}
              sx={{
                width: item.width ? `${item.width}px` : 80,
                height: item.height ? `${item.height}px` : 80,
                backgroundColor: itemColor,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                flexGrow: item.flexGrow,
                flexShrink: item.flexShrink,
                flexBasis: item.flexBasis,
                alignSelf: item.alignSelf,
                order: item.order,
                transition: "all 0.3s ease",
              }}
            >
              {index + 1}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Labels */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{ px: 1, py: 0.5, bgcolor: "action.hover", borderRadius: 1 }}
        >
          direction: {config.direction || "row"}
        </Typography>
        <Typography
          variant="caption"
          sx={{ px: 1, py: 0.5, bgcolor: "action.hover", borderRadius: 1 }}
        >
          justify: {config.justifyContent || "flex-start"}
        </Typography>
        <Typography
          variant="caption"
          sx={{ px: 1, py: 0.5, bgcolor: "action.hover", borderRadius: 1 }}
        >
          align: {config.alignItems || "stretch"}
        </Typography>
        {config.gap && (
          <Typography
            variant="caption"
            sx={{ px: 1, py: 0.5, bgcolor: "action.hover", borderRadius: 1 }}
          >
            gap: {config.gap}px
          </Typography>
        )}
      </Box>
    </Box>
  );
}
