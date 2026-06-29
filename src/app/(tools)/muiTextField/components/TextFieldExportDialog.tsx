/**
 * MUI TextField Theme Designer - Export Dialog
 * Export theme configuration in various formats
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
import type { TextFieldThemeConfig, TextFieldThemeExportFormat } from "../types";
import { exportConfig } from "../utils";

interface TextFieldExportDialogProps {
  open: boolean;
  config: TextFieldThemeConfig;
  onClose: () => void;
}

export function TextFieldExportDialog({
  open,
  config,
  onClose,
}: TextFieldExportDialogProps) {
  const [format, setFormat] = React.useState<TextFieldThemeExportFormat>("createTheme");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const code = exportConfig(config, format);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const code = exportConfig(config, format);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Export TextField Theme</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Tabs
          value={format}
          onChange={(_, newValue) => setFormat(newValue as TextFieldThemeExportFormat)}
          sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="createTheme" value="createTheme" />
          <Tab label="theme.components" value="theme-components" />
          <Tab label="CSS" value="css" />
          <Tab label="JSON" value="json" />
        </Tabs>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            position: "relative",
            maxHeight: 500,
            overflow: "auto",
          }}
        >
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
            InputProps={{
              readOnly: true,
              sx: {
                fontFamily: "monospace",
                fontSize: 12,
                "& .MuiInputBase-input": {
                  whiteSpace: "pre",
                  overflowX: "auto",
                },
              },
            }}
            sx={{
              "& .MuiInputBase-root": {
                bgcolor: "action.hover",
              },
            }}
          />
        </Paper>

        {/* Usage instructions */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Usage
          </Typography>
          {format === "createTheme" && (
            <Typography variant="body2" color="text.secondary">
              Create a new file or add to your existing theme configuration. Import and use the
              exported theme with your Material-UI components.
            </Typography>
          )}
          {format === "theme-components" && (
            <Typography variant="body2" color="text.secondary">
              Copy the components section into your existing createTheme configuration under the
              components key.
            </Typography>
          )}
          {format === "css" && (
            <Typography variant="body2" color="text.secondary">
              Add this CSS to your global stylesheet or component styles. Make sure to target the
              correct elements.
            </Typography>
          )}
          {format === "json" && (
            <Typography variant="body2" color="text.secondary">
              Use this JSON configuration for programmatic access or storage. Can be imported back
              into the theme designer.
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
