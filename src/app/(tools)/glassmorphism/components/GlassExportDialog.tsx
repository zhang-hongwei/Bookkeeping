/**
 * Glass Export Dialog
 * Export glass effect in various formats
 */

"use client";

import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Tabs, Tab, TextField, IconButton, Snackbar, Alert,
} from "@mui/material";
import { ContentCopy as CopyIcon, Check as CheckIcon } from "@mui/icons-material";
import type { GlassConfig, GlassExportFormat } from "../types";
import { generateCode } from "../utils";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const FORMATS: { label: string; value: GlassExportFormat }[] = [
  { label: "CSS", value: "css" },
  { label: "SCSS", value: "scss" },
  { label: "Tailwind", value: "tailwind" },
  { label: "MUI", value: "mui" },
  { label: "JSON", value: "json" },
];

interface GlassExportDialogProps {
  open: boolean;
  config: GlassConfig;
  onClose: () => void;
}

export function GlassExportDialog({ open, config, onClose }: GlassExportDialogProps) {
  const [tabValue, setTabValue] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCopy = async (code: string, label: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(label);
      setSnackbarOpen(true);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleClose = () => {
    setTabValue(0);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Export{" "}
          {config.effectType === "glassmorphism"
            ? "Glassmorphism"
            : config.effectType === "liquidGlass"
              ? "Liquid Glass"
              : "Neumorphism"}{" "}
          Effect
        </DialogTitle>
        <DialogContent>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {FORMATS.map((f) => (
              <Tab key={f.value} label={f.label} />
            ))}
          </Tabs>

          {FORMATS.map((format, index) => {
            const code = generateCode(config, format.value);
            return (
              <TabPanel key={format.value} value={tabValue} index={index}>
                <Box sx={{ position: "relative" }}>
                  <TextField
                    multiline fullWidth rows={12} value={code}
                    InputProps={{
                      readOnly: true,
                      sx: { fontFamily: "monospace", fontSize: 13 },
                    }}
                  />
                  <IconButton
                    onClick={() => handleCopy(code, format.label)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    {copied === format.label ? <CheckIcon color="success" /> : <CopyIcon />}
                  </IconButton>
                </Box>
              </TabPanel>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}
