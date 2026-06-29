/**
 * Filter Export Dialog
 * Export filters in various formats
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
  IconButton,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { ContentCopy as CopyIcon, Check as CheckIcon } from "@mui/icons-material";
import type { FilterValues, FilterExportFormat } from "../types";
import { generateCode } from "../utils";

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

interface FilterExportDialogProps {
  open: boolean;
  values: FilterValues;
  onClose: () => void;
}

const FORMATS: { label: string; value: FilterExportFormat }[] = [
  { label: "CSS", value: "css" },
  { label: "SCSS", value: "scss" },
  { label: "Tailwind", value: "tailwind" },
  { label: "JSON", value: "json" },
];

export function FilterExportDialog({ open, values, onClose }: FilterExportDialogProps) {
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
        <DialogTitle>Export Filter</DialogTitle>
        <DialogContent>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {FORMATS.map((format) => (
              <Tab key={format.value} label={format.label} />
            ))}
          </Tabs>

          {FORMATS.map((format, index) => {
            const code = generateCode(values, format.value);
            return (
              <TabPanel key={format.value} value={tabValue} index={index}>
                <Box sx={{ position: "relative" }}>
                  <TextField
                    multiline
                    fullWidth
                    rows={8}
                    value={code}
                    InputProps={{
                      readOnly: true,
                      sx: {
                        fontFamily: "monospace",
                        fontSize: 13,
                      },
                    }}
                  />
                  <IconButton
                    onClick={() => handleCopy(code, format.label)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                    }}
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
