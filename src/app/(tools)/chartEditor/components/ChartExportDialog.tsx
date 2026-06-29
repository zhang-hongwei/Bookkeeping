/**
 * Chart Export Dialog
 * Export ECharts option in JSON, TypeScript, or React Component format
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { ContentCopy as CopyIcon, Check as CheckIcon } from "@mui/icons-material";
import { useChartEditorStore } from "@/store/chart-editor";
import type { ChartExportFormat } from "../types";
import { generateExportCode } from "../utils";

const FORMAT_OPTIONS: { label: string; value: ChartExportFormat }[] = [
  { label: "JSON", value: "json" },
  { label: "TypeScript", value: "typescript" },
  { label: "React Component", value: "react-component" },
];

interface ChartExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ChartExportDialog({ open, onClose }: ChartExportDialogProps) {
  const config = useChartEditorStore((s) => s.config);
  const copied = useChartEditorStore((s) => s.copied);
  const setCopied = useChartEditorStore((s) => s.setCopied);

  const [format, setFormat] = useState<ChartExportFormat>("json");

  const code = useMemo(() => generateExportCode(config, format), [config, format]);

  const handleFormatChange = useCallback((_: React.MouseEvent<HTMLElement>, newFormat: ChartExportFormat | null) => {
    if (newFormat !== null) {
      setFormat(newFormat);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [code, setCopied]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Export Chart Code</DialogTitle>
      <DialogContent>
        <ToggleButtonGroup
          value={format}
          exclusive
          onChange={handleFormatChange}
          size="small"
          sx={{ mb: 2 }}
        >
          {FORMAT_OPTIONS.map((opt) => (
            <ToggleButton key={opt.value} value={opt.value}>
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Paper
          sx={{
            bgcolor: "#1e1e1e",
            p: 2,
            maxHeight: 400,
            overflow: "auto",
            position: "relative",
          }}
        >
          <Tooltip title={copied ? "Copied!" : "Copy code"}>
            <IconButton
              onClick={handleCopy}
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "rgba(255,255,255,0.7)",
                "&:hover": { color: "#fff" },
              }}
            >
              {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Typography
            component="pre"
            sx={{
              m: 0,
              fontFamily: "monospace",
              fontSize: 13,
              color: "#d4d4d4",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            <code>{code}</code>
          </Typography>
        </Paper>
      </DialogContent>
      <DialogActions>
        {copied && (
          <Typography variant="body2" color="success.main" sx={{ mr: "auto", pl: 1 }}>
            Copied!
          </Typography>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
