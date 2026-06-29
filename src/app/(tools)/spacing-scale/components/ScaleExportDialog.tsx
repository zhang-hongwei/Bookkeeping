/**
 * Scale Export Dialog
 * Export spacing scale to various formats
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { ContentCopy as CopyIcon, Download as DownloadIcon } from "@mui/icons-material";
import type { ScaleStep, ScaleConfig, ExportFormat } from "../types";
import { exportScale } from "../utils";

interface ScaleExportDialogProps {
  open: boolean;
  scale: ScaleStep[];
  config: ScaleConfig;
  onClose: () => void;
}

export function ScaleExportDialog({ open, scale, config, onClose }: ScaleExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("css");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const code = useMemo(() => {
    return exportScale(scale, config, format);
  }, [scale, config, format]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setSnackbar({ open: true, message: "Copied to clipboard!" });
  };

  const handleDownload = () => {
    const ext = format === "json" ? "json" : format === "tailwind" || format === "mui" ? "js" : "css";
    const filename = `spacing-scale.${ext}`;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Export Spacing Scale
          <Box>
            <IconButton onClick={handleCopy} size="small" sx={{ mr: 1 }}>
              <CopyIcon />
            </IconButton>
            <IconButton onClick={handleDownload} size="small">
              <DownloadIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Format
            </Typography>
            <ToggleButtonGroup
              value={format}
              exclusive
              onChange={(_, newFormat) => newFormat && setFormat(newFormat)}
              size="small"
            >
              <ToggleButton value="css">CSS Variables</ToggleButton>
              <ToggleButton value="tailwind">Tailwind</ToggleButton>
              <ToggleButton value="mui">MUI Theme</ToggleButton>
              <ToggleButton value="json">JSON</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box
            sx={{
              bgcolor: "action.hover",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: 13,
              whiteSpace: "pre-wrap",
              overflow: "auto",
              maxHeight: 400,
            }}
          >
            {code}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button variant="contained" onClick={handleCopy} startIcon={<CopyIcon />}>
            Copy Code
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
