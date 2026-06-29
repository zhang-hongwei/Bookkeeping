/**
 * Border-image advanced options panel
 */

"use client";

import React from "react";
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, CloudUpload as UploadIcon } from "@mui/icons-material";
import { useGradientBorderStore, useGradientBorderActions } from "@/store/gradient-border";
import type { BorderImageRepeat, BorderImageSourceMode } from "../types";

interface GradientBorderImageOptionsProps {
  expanded: boolean;
  objectUrl: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function GradientBorderImageOptions({
  expanded,
  objectUrl,
  fileInputRef,
}: GradientBorderImageOptionsProps) {
  const options = useGradientBorderStore((s) => s.config.borderImageOptions);
  const { updateBorderImageOption, handleFileUpload, setImageUrl, toggleBorderImageOptions } = useGradientBorderActions();

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={toggleBorderImageOptions}>
        <Typography variant="subtitle2" sx={{ flex: 1 }}>
          border-image Options
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Source</Typography>
            <ToggleButtonGroup
              value={options.sourceMode}
              exclusive
              onChange={(_, v: BorderImageSourceMode | null) => { if (v) updateBorderImageOption("sourceMode", v); }}
              size="small"
              fullWidth
            >
              <ToggleButton value="gradient">Gradient</ToggleButton>
              <ToggleButton value="image">Image URL</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {options.sourceMode === "image" && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileUpload} />
              <Button variant="outlined" size="small" fullWidth startIcon={<UploadIcon />} onClick={() => fileInputRef.current?.click()}>
                Upload Image
              </Button>
              {objectUrl && (
                <Box
                  component="img"
                  src={objectUrl}
                  alt="border preview"
                  sx={{ width: "100%", maxHeight: 100, objectFit: "contain", borderRadius: 1, border: "1px solid", borderColor: "divider" }}
                />
              )}
              <TextField
                label="Image URL"
                value={options.imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                size="small"
                fullWidth
                placeholder="/border.png or https://..."
                helperText="Upload or enter URL"
              />
            </>
          )}

          <TextField label="slice" value={options.slice} onChange={(e) => updateBorderImageOption("slice", e.target.value)} size="small" fullWidth helperText="e.g. 1, 30%, 10 20 10 20" />
          <FormControlLabel
            control={<Checkbox checked={options.sliceFill} onChange={(e) => updateBorderImageOption("sliceFill", e.target.checked)} size="small" />}
            label={<Typography variant="caption">fill (preserve center)</Typography>}
          />
          <TextField label="width" value={options.width} onChange={(e) => updateBorderImageOption("width", e.target.value)} size="small" fullWidth helperText="e.g. 1, 3px, 10% 20%" />
          <TextField label="outset" value={options.outset} onChange={(e) => updateBorderImageOption("outset", e.target.value)} size="small" fullWidth helperText="e.g. 0, 5px" />
          <FormControl size="small" fullWidth>
            <InputLabel>repeat</InputLabel>
            <Select<BorderImageRepeat> value={options.repeat} label="repeat" onChange={(e) => updateBorderImageOption("repeat", e.target.value)}>
              <MenuItem value="stretch">stretch</MenuItem>
              <MenuItem value="repeat">repeat</MenuItem>
              <MenuItem value="round">round</MenuItem>
              <MenuItem value="space">space</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Collapse>
    </Box>
  );
}
