/**
 * MUI ToggleButton Theme Designer - Export Dialog
 * Export theme configuration in various formats
 */

"use client";

import React, { useState, useCallback } from "react";
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
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import type { ToggleButtonThemeConfig } from "../types";
import { exportConfig } from "../utils";

type ExportFormat = "createTheme" | "theme-components" | "css" | "json";
type ExportVariant = "standard" | "outlined" | "contained";

interface ToggleButtonExportDialogProps {
  open: boolean;
  onClose: () => void;
  config: ToggleButtonThemeConfig;
}

export function ToggleButtonExportDialog({
  open,
  onClose,
  config,
}: ToggleButtonExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("createTheme");
  const [variant, setVariant] = useState<ExportVariant>(
    config.exportVariant ?? "standard"
  );
  const [copied, setCopied] = useState(false);

  const code = exportConfig({ ...config, exportVariant: variant }, format);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleDownload = useCallback(() => {
    const extension = format === "json" ? "json" : "ts";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toggle-button-theme.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, format]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: "80vh", display: "flex", flexDirection: "column" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6">Export ToggleButton Theme</Typography>
        <IconButton edge="end" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Format Selection */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Export Format
          </Typography>
          <ToggleButtonGroup
            value={format}
            exclusive
            size="small"
            fullWidth
            onChange={(e, value) => value && setFormat(value)}
          >
            <ToggleButton value="createTheme">createTheme</ToggleButton>
            <ToggleButton value="theme-components">
              theme.components
            </ToggleButton>
            <ToggleButton value="css">CSS</ToggleButton>
            <ToggleButton value="json">JSON</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Variant Selection */}
        {format !== "json" && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Variant Style
            </Typography>
            <ToggleButtonGroup
              value={variant}
              exclusive
              size="small"
              fullWidth
              onChange={(e, value) => value && setVariant(value)}
            >
              <ToggleButton value="standard">Standard</ToggleButton>
              <ToggleButton value="outlined">Outlined</ToggleButton>
              <ToggleButton value="contained">Contained</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Code Preview */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Typography variant="subtitle2" gutterBottom>
            Preview
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              p: 2,
              overflow: "auto",
              bgcolor: "background.default",
            }}
          >
            <Typography
              component="pre"
              sx={{
                m: 0,
                fontFamily: "Monaco, Consolas, 'Courier New', monospace",
                fontSize: 12,
                whiteSpace: "pre",
                overflow: "auto",
              }}
            >
              {code}
            </Typography>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          startIcon={<ContentCopyIcon />}
          onClick={handleCopy}
          variant={copied ? "contained" : "outlined"}
          color={copied ? "success" : "primary"}
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
        <Button
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          variant="outlined"
        >
          Download
        </Button>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
