/**
 * Collapsible panel for importing border-image CSS values.
 * Parses a pasted value and updates the editor config.
 */

"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Collapse,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useGradientBorderStore } from "@/store/gradient-border";
import { parseBorderImageCSS } from "../utils";

export function GradientBorderImport() {
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const updateConfig = useGradientBorderStore((s) => s.updateConfig);

  const handleImport = () => {
    if (!value.trim()) return;

    const result = parseBorderImageCSS(value);
    if (result.error) {
      setError(result.error);
      setSuccess(false);
      return;
    }

    updateConfig(result.config);
    setSuccess(true);
    setError("");
    setValue("");
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleImport();
    }
  };

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
      >
        <Typography variant="subtitle2">Import CSS</Typography>
        {expanded ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 1 }}>
          <TextField
            multiline
            rows={2}
            fullWidth
            size="small"
            placeholder="Paste border-image or gradient value..."
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            error={!!error}
            helperText={error || "Press Enter to import"}
            slotProps={{ input: { sx: { fontFamily: "monospace", fontSize: 12 } } }}
          />
          <Button
            size="small"
            variant={success ? "outlined" : "text"}
            color={success ? "success" : "primary"}
            onClick={handleImport}
            disabled={!value.trim()}
            sx={{ mt: 0.5 }}
            startIcon={success ? <CheckIcon fontSize="small" /> : null}
          >
            {success ? "Imported" : "Import"}
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
}
