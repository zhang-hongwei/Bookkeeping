/**
 * SourceCard Component
 * Collapsible source citation panel for RAG responses
 */

"use client";

import { useState } from "react";
import { Box, Typography, IconButton, Collapse } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { Source } from "../types";

interface SourceCardProps {
  sources: Source[];
}

export function SourceCard({ sources }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!sources.length) return null;

  return (
    <Box sx={{ mt: 1.5 }}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          cursor: "pointer",
          color: "primary.main",
          "&:hover": { color: "primary.dark" },
        }}
      >
        <IconButton size="small" sx={{ p: 0 }}>
          <ChevronRightIcon
            sx={{
              fontSize: 16,
              transition: "transform 0.2s",
              transform: expanded ? "rotate(90deg)" : "none",
            }}
          />
        </IconButton>
        <Typography variant="caption" fontWeight={500}>
          参考来源 ({sources.length})
        </Typography>
      </Box>

      <Collapse in={expanded} timeout="auto">
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
          {sources.map((src, idx) => (
            <Box
              key={idx}
              sx={{
                p: 1.5,
                bgcolor: "grey.50",
                border: 1,
                borderColor: "grey.200",
                borderRadius: 1.5,
                _dark: { bgcolor: "grey.900", borderColor: "grey.800" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", mr: 1 }}
                >
                  {src.document_name || src.doc_name || src.source || "文档"}
                </Typography>
                {src.score != null && (
                  <Typography variant="caption" color="primary.main" sx={{ flexShrink: 0 }}>
                    {(src.score * 100).toFixed(1)}%
                  </Typography>
                )}
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.6,
                }}
              >
                {src.content || src.chunk_text || src.text || ""}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
