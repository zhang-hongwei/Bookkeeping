/**
 * NewCanvasDialog - Create a fresh canvas with chosen size and background
 */

"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
} from '@mui/material';
import { ASPECT_RATIOS } from '../engine/node-tree/types';
import type { CanvasAspectRatio } from '../engine/node-tree/types';

interface NewCanvasDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (ratio: CanvasAspectRatio, bgColor: string) => void;
}

const RATIO_LIST = Object.entries(ASPECT_RATIOS) as [CanvasAspectRatio, (typeof ASPECT_RATIOS)[CanvasAspectRatio]][];

const BG_PRESETS = ['#ffffff', '#f5f5f5', '#1a1a2e', '#0d0d0d', '#fef3e2', '#e8f5e9'];

export function NewCanvasDialog({ open, onClose, onConfirm }: NewCanvasDialogProps) {
  const [ratio, setRatio] = useState<CanvasAspectRatio>('3:4');
  const [bgColor, setBgColor] = useState('#1a1a2e');

  const handleCreate = () => {
    onConfirm(ratio, bgColor);
    // Reset local state for next open
    setRatio('3:4');
    setBgColor('#1a1a2e');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>New Canvas</DialogTitle>
      <DialogContent>
        {/* Aspect Ratio */}
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Size
        </Typography>
        <ToggleButtonGroup
          value={ratio}
          exclusive
          onChange={(_, v) => v && setRatio(v)}
          size="small"
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2.5 }}
        >
          {RATIO_LIST.map(([key, val]) => (
            <ToggleButton key={key} value={key} sx={{ px: 1.5, py: 0.5, fontSize: 11, textTransform: 'none' }}>
              {key} {val.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Background Color */}
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Background
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          {BG_PRESETS.map((c) => (
            <Box
              key={c}
              onClick={() => setBgColor(c)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                bgcolor: c,
                border: bgColor === c ? '2px solid' : '1px solid',
                borderColor: bgColor === c ? 'primary.main' : 'divider',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            />
          ))}
          <Box
            component="input"
            type="color"
            value={bgColor}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBgColor(e.target.value)}
            sx={{ width: 28, height: 28, p: 0, border: '1px solid', borderColor: 'divider', borderRadius: 1, cursor: 'pointer' }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small" sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleCreate} size="small" sx={{ textTransform: 'none' }}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
