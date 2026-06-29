/**
 * Filter Preview Component
 * Visual preview with sample image
 */

"use client";

import React from "react";
import { Box, Paper } from "@mui/material";
import type { FilterValues } from "../types";
import { generateFilterCSS, generateDropShadowCSS } from "../utils";

interface FilterPreviewProps {
  values: FilterValues;
  previewImage?: string;
}

export function FilterPreview({ values, previewImage }: FilterPreviewProps) {
  const mainFilter = generateFilterCSS(values);
  const dropShadow = generateDropShadowCSS(values);

  const filterStyle: React.CSSProperties = {
    filter: `${mainFilter} ${dropShadow}`.trim() || 'none',
    transition: 'filter 0.3s ease',
  };

  // Default gradient background for preview
  const defaultPreview = (
    <Box
      sx={{
        width: '100%',
        height: 250,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #fda085 100%)',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 32,
        fontWeight: 700,
        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
        ...filterStyle,
      }}
    >
      Filter Preview
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Preview container */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: (theme) => theme.vars.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
        }}
      >
        {previewImage ? (
          <Box
            component="img"
            src={previewImage}
            alt="Preview"
            sx={{
              maxWidth: '100%',
              maxHeight: 300,
              borderRadius: 2,
              objectFit: 'cover',
              ...filterStyle,
            }}
          />
        ) : (
          defaultPreview
        )}
      </Paper>

      {/* Side by side comparison */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              height: 100,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Original
          </Box>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              height: 100,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              ...filterStyle,
            }}
          >
            Filtered
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
