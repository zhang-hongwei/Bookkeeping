/**
 * Switch Export Dialog Component
 * Dialog for exporting switch theme configuration in various formats
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stack,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import type { SwitchThemeConfig, SwitchThemeExportFormat } from "../types";
import { generateCode, downloadCode } from "../utils";

interface SwitchExportDialogProps {
  open: boolean;
  config: SwitchThemeConfig;
  onClose: () => void;
}

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ py: 2 }}>
      {value === index && children}
    </Box>
  );
}

export function SwitchExportDialog({ open, config, onClose }: SwitchExportDialogProps) {
  const [tabValue, setTabValue] = useState<SwitchThemeExportFormat>("createTheme");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const code = generateCode(config, tabValue);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const code = generateCode(config, tabValue);
    const extensions = {
      createTheme: "ts",
      "theme-components": "ts",
      css: "css",
      json: "json",
    };
    const filename = `switch-theme.${extensions[tabValue]}`;
    downloadCode(code, filename);
  };

  const generatedCode = generateCode(config, tabValue);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Export Switch Theme</Typography>
          <IconButton edge="end" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue as SwitchThemeExportFormat)}
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
        >
          <Tab label="createTheme" value="createTheme" />
          <Tab label="Styled Components" value="theme-components" />
          <Tab label="CSS" value="css" />
          <Tab label="JSON" value="json" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Export as MUI createTheme configuration
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Export as styled() component
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Export as plain CSS
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Export as JSON configuration
          </Typography>
        </TabPanel>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: "action.hover",
            maxHeight: 400,
            overflow: "auto",
          }}
        >
          <TextField
            fullWidth
            multiline
            value={generatedCode}
            InputProps={{
              readOnly: true,
              sx: {
                fontFamily: "monospace",
                fontSize: 13,
                "& .MuiInputBase-input": {
                  color: "text.primary",
                },
              },
            }}
            variant="standard"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ width: "100%", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<ContentCopyIcon />}
              onClick={handleCopy}
              variant={copied ? "contained" : "outlined"}
              color={copied ? "success" : "primary"}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button startIcon={<DownloadIcon />} onClick={handleDownload} variant="outlined">
              Download
            </Button>
          </Stack>
          <Button onClick={onClose} variant="contained">
            Done
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
