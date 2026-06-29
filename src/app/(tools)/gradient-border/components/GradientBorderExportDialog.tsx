/**
 * Gradient Border Export Dialog
 * Dialog for exporting gradient border CSS code in various formats
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import { ContentCopy as CopyIcon } from "@mui/icons-material";
import type { GradientBorderConfig } from "../types";
import { generateCSS, generateMUISx, generateReactStyle, generateTailwind } from "../utils";

interface GradientBorderExportDialogProps {
  open: boolean;
  config: GradientBorderConfig;
  onClose: () => void;
}

type ExportFormat = "css" | "mui" | "react" | "tailwind";

export function GradientBorderExportDialog({ open, config, onClose }: GradientBorderExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("css");
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    switch (format) {
      case "css":
        return generateCSS(config);
      case "mui":
        return generateMUISx(config);
      case "react":
        return generateReactStyle(config);
      case "tailwind":
        return generateTailwind(config);
    }
  }, [config, format]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Export Code</DialogTitle>
      <DialogContent>
        <Tabs
          value={format}
          onChange={(_, v: ExportFormat) => setFormat(v)}
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
        >
          <Tab label="CSS" value="css" />
          <Tab label="MUI sx" value="mui" />
          <Tab label="React" value="react" />
          <Tab label="Tailwind" value="tailwind" />
        </Tabs>

        <Box sx={{ position: "relative" }}>
          <Tooltip title={copied ? "Copied!" : "Copy code"}>
            <IconButton
              onClick={handleCopy}
              size="small"
              sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              fontFamily: "monospace",
              fontSize: 14,
              bgcolor: "action.hover",
              whiteSpace: "pre-wrap",
              minHeight: 120,
            }}
          >
            {code}
          </Paper>
        </Box>

        {config.implementation === "border-image" && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Note: border-image does not work with border-radius. Use background-clip or pseudo-element for rounded borders.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy Code"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
