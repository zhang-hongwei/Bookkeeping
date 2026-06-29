/**
 * Clip Path Code Output
 * Displays generated CSS with copy and download buttons
 */

"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { Box, Paper, Typography, Button, Stack, Snackbar, Alert } from "@mui/material";
import { ContentCopy, Download } from "@mui/icons-material";
import { useClipPathStore, getClipPathConfig } from "@/store/clip-path";
import { generateClipPathCSS } from "../utils";

export function ClipPathCodeOutput() {
  const store = useClipPathStore();
  const clipPathCSS = useMemo(() => {
    const config = getClipPathConfig(store);
    return generateClipPathCSS(config);
  }, [store.mode, store.polygonPoints, store.circle, store.ellipse, store.inset]);

  const [copied, setCopied] = React.useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`clip-path: ${clipPathCSS};`);
      setCopied(true);
    } catch {
      // fallback
    }
  }, [clipPathCSS]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownloadPNG = useCallback(() => {
    const svgWidth = store.canvasSize.width;
    const svgHeight = store.canvasSize.height;

    // Build SVG string
    const config = getClipPathConfig(store);
    const clipPath = generateClipPathCSS(config);

    let shapeEl = "";
    if (store.mode === "polygon") {
      shapeEl = `<polygon points="${store.polygonPoints.map((p) => `${p.x},${p.y}`).join(" ")}" fill="${store.backgroundColor}" />`;
    } else if (store.mode === "circle") {
      shapeEl = `<circle cx="${store.circle.centerX}" cy="${store.circle.centerY}" r="${Math.max(0.1, store.circle.radius)}" fill="${store.backgroundColor}" />`;
    } else if (store.mode === "ellipse") {
      shapeEl = `<ellipse cx="${store.ellipse.centerX}" cy="${store.ellipse.centerY}" rx="${Math.max(0.1, store.ellipse.radiusX)}" ry="${Math.max(0.1, store.ellipse.radiusY)}" fill="${store.backgroundColor}" />`;
    } else if (store.mode === "inset") {
      shapeEl = `<rect x="${store.inset.left}" y="${store.inset.top}" width="${Math.max(0.1, 100 - store.inset.left - store.inset.right)}" height="${Math.max(0.1, 100 - store.inset.top - store.inset.bottom)}" rx="${store.inset.borderRadius}" fill="${store.backgroundColor}" />`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${svgWidth}" height="${svgHeight}">
      <rect width="100" height="100" fill="transparent"/>
      ${shapeEl}
    </svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = svgWidth * 2; // 2x for retina
      canvas.height = svgHeight * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(pngBlob);
        a.download = "clip-path.png";
        a.click();
        URL.revokeObjectURL(a.href);
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [store]);

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          fontFamily: "monospace",
          fontSize: 13,
          bgcolor: "action.hover",
          overflow: "auto",
        }}
      >
        <Typography
          component="pre"
          sx={{
            m: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          <Box component="span" sx={{ color: "text.secondary" }}>
            clip-path:
          </Box>{" "}
          {clipPathCSS};
        </Typography>
      </Paper>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ContentCopy />}
          onClick={handleCopy}
          sx={{ flex: 1 }}
        >
          Copy CSS
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownloadPNG}
          sx={{ flex: 1 }}
        >
          Download PNG
        </Button>
      </Stack>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setCopied(false)} variant="filled">
          CSS copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}
