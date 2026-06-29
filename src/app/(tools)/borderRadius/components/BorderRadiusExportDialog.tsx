/**
 * Border Radius Export Dialog
 * Export border radius in various formats
 */

"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  Typography,
  IconButton,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { ContentCopy as CopyIcon, Check as CheckIcon } from "@mui/icons-material";
import type { BorderRadiusValues, BorderUnit } from "../types";
import {
  generateCSS,
  generateMUISx,
  generateTailwind,
  generateInlineStyle,
  generateReactStyle,
  generateJSON,
} from "../utils";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface BorderRadiusExportDialogProps {
  open: boolean;
  values: BorderRadiusValues;
  unit: BorderUnit;
  onClose: () => void;
}

export function BorderRadiusExportDialog({
  open,
  values,
  unit,
  onClose,
}: BorderRadiusExportDialogProps) {
  const [tabValue, setTabValue] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const formats = [
    { label: "CSS", code: generateCSS(values, unit) },
    { label: "MUI sx", code: generateMUISx(values, unit) },
    { label: "Tailwind", code: generateTailwind(values, unit) },
    { label: "Inline Style", code: generateInlineStyle(values, unit) },
    { label: "React Style", code: generateReactStyle(values, unit) },
    { label: "JSON", code: generateJSON(values, unit) },
  ];

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
        <DialogTitle>Export Border Radius</DialogTitle>
        <DialogContent>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {formats.map((format) => (
              <Tab key={format.label} label={format.label} />
            ))}
          </Tabs>

          {formats.map((format, index) => (
            <TabPanel key={format.label} value={tabValue} index={index}>
              <Box sx={{ position: "relative" }}>
                <TextField
                  multiline
                  fullWidth
                  rows={6}
                  value={format.code}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      fontFamily: "monospace",
                      fontSize: 14,
                    },
                  }}
                />
                <IconButton
                  onClick={() => handleCopy(format.code, format.label)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                  }}
                >
                  {copied === format.label ? (
                    <CheckIcon color="success" />
                  ) : (
                    <CopyIcon />
                  )}
                </IconButton>
              </Box>
            </TabPanel>
          ))}
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
