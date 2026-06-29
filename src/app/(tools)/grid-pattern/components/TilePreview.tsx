/**
 * TilePreview Component
 * Preview a single tile with shapes
 */

import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import type { GridLayer } from "../types";
import { generateShapeElement } from "../utils";

interface TilePreviewProps {
  layer: GridLayer;
  tileSize?: number;
}

export function TilePreview({ layer, tileSize }: TilePreviewProps) {
  const size = tileSize || layer.size + layer.spacing;

  // Generate SVG content for the tile
  const generateTileSVG = () => {
    const shapes = layer.shapes
      .filter((s) => s.type !== "path" || (s.params.d && s.params.d.length > 0))
      .map((shape) => {
        const { fill, stroke, strokeWidth, opacity } = shape;
        const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, "0");
        const strokeWithOpacity = stroke + opacityHex;
        const fillValue = fill === "transparent" ? "none" : fill + opacityHex;

        // Get the shape element and replace color attributes
        let element = generateShapeElement(shape, size);

        // Replace fill and stroke with opacity
        element = element.replace(/fill="([^"]*)"/, `fill="${fillValue}"`);
        element = element.replace(/stroke="([^"]*)"/, `stroke="${strokeWithOpacity}"`);

        return element;
      })
      .join("\n  ");

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="none" stroke="#ddd" stroke-width="1"/>
        ${shapes}
      </svg>
    `;
  };

  const svgContent = generateTileSVG();
  const encoded = encodeURIComponent(svgContent);
  const dataUrl = `data:image/svg+xml,${encoded}`;

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
        单个格子预览
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
        尺寸: {size}px × {size}px
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <img
          src={dataUrl}
          alt="Tile preview"
          style={{
            width: size,
            height: size,
            imageRendering: "pixelated",
          }}
        />
      </Box>

      {/* Shape count */}
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {layer.shapes.length} 个形状
        </Typography>
      </Box>
    </Paper>
  );
}
