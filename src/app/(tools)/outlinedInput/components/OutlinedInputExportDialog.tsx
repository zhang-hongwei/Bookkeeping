/**
 * MUI OutlinedInput Theme Designer - Export Dialog
 * Reads config from store, generates code on demand (low frequency)
 */

"use client";

import React, { useState } from "react";
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
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import type { OutlinedInputExportFormat } from "../types";
import { exportConfig } from "../utils";
import { useOutlinedInputStore } from "../store";

export function OutlinedInputExportDialog() {
  const { config, exportDialogOpen, setExportDialogOpen } = useOutlinedInputStore();
  const [format, setFormat] = useState<OutlinedInputExportFormat>("createTheme");
  const [copied, setCopied] = useState(false);

  const onClose = () => setExportDialogOpen(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportConfig(config, format));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const code = exportConfig(config, format);

  return (
    <Dialog open={exportDialogOpen} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Export OutlinedInput Theme</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Tabs
          value={format}
          onChange={(_, v) => setFormat(v as OutlinedInputExportFormat)}
          sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="createTheme" value="createTheme" />
          <Tab label="theme.components" value="theme-components" />
          <Tab label="CSS" value="css" />
          <Tab label="JSON" value="json" />
        </Tabs>

        <Paper variant="outlined" sx={{ p: 2, position: "relative", maxHeight: 500, overflow: "auto" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {format === "json" ? "Configuration JSON" : "Generated Code"}
            </Typography>
            <Button
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopy}
              variant={copied ? "contained" : "outlined"}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </Stack>

          <TextField
            multiline
            fullWidth
            value={code}
            slotProps={{
              input: {
                readOnly: true,
                sx: {
                  fontFamily: "monospace",
                  fontSize: 12,
                  "& .MuiInputBase-input": { whiteSpace: "pre", overflowX: "auto" },
                },
              },
            }}
            sx={{ "& .MuiInputBase-root": { bgcolor: "action.hover" } }}
          />
        </Paper>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Usage</Typography>
          {format === "createTheme" && (
            <Typography variant="body2" color="text.secondary">
              Create a new file or add to your existing theme. The theme targets MuiOutlinedInput and
              MuiInputAdornment styleOverrides.
            </Typography>
          )}
          {format === "theme-components" && (
            <Typography variant="body2" color="text.secondary">
              Copy into your existing createTheme configuration under the components key.
            </Typography>
          )}
          {format === "css" && (
            <Typography variant="body2" color="text.secondary">
              Add this CSS to your global stylesheet. Targets MUI OutlinedInput CSS classes.
            </Typography>
          )}
          {format === "json" && (
            <Typography variant="body2" color="text.secondary">
              JSON configuration for programmatic access or storage.
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
