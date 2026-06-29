'use client';

import { useCallback, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Slider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type { GradientPreset, GradientStop, GradientType } from '../types';

interface GradientEditorProps {
  open: boolean;
  gradient: GradientPreset | null;
  stops: GradientStop[];
  angle: number;
  type: GradientType;
  previewCss: string;
  onUpdateStop: (index: number, updates: Partial<GradientStop>) => void;
  onAddStop: () => void;
  onRemoveStop: (index: number) => void;
  onUpdateAngle: (angle: number) => void;
  onUpdateType: (type: GradientType) => void;
  onReset: () => void;
  onApply: () => void;
  onCancel: () => void;
}

export function GradientEditor({
  open,
  gradient,
  stops,
  angle,
  type,
  previewCss,
  onUpdateStop,
  onAddStop,
  onRemoveStop,
  onUpdateAngle,
  onUpdateType,
  onReset,
  onApply,
  onCancel,
}: GradientEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCss = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(previewCss);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore error
    }
  }, [previewCss]);

  if (!gradient) return null;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Edit: {gradient.name}</Typography>
          <IconButton size="small" onClick={onCancel}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {/* Preview */}
          <Box
            sx={{
              height: 180,
              background: previewCss,
              borderRadius: 2,
              mb: 3,
              position: 'relative',
            }}
          />

          {/* CSS Code */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              bgcolor: 'grey.900',
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'grey.800' },
            }}
            onClick={handleCopyCss}
          >
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                fontSize: 13,
                color: 'grey.300',
                wordBreak: 'break-all',
              }}
            >
              {copied ? 'Copied!' : previewCss}
            </Typography>
          </Paper>

          {/* Gradient Type */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Gradient Type</InputLabel>
            <Select
              value={type}
              label="Gradient Type"
              onChange={(e) => onUpdateType(e.target.value as GradientType)}
            >
              <MenuItem value="linear">Linear</MenuItem>
              <MenuItem value="radial">Radial</MenuItem>
              <MenuItem value="conic">Conic</MenuItem>
            </Select>
          </FormControl>

          {/* Angle (for linear and conic) */}
          {type !== 'radial' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Angle: {angle}°
              </Typography>
              <Slider
                value={angle}
                onChange={(_, value) => onUpdateAngle(value as number)}
                min={0}
                max={360}
                step={15}
                marks={[
                  { value: 0, label: '0°' },
                  { value: 90, label: '90°' },
                  { value: 180, label: '180°' },
                  { value: 270, label: '270°' },
                  { value: 360, label: '360°' },
                ]}
              />
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Color Stops */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2">Color Stops</Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={onAddStop}
                disabled={stops.length >= 10}
              >
                Add Stop
              </Button>
            </Box>

            <Stack spacing={2}>
              {stops
                .sort((a, b) => a.position - b.position)
                .map((stop, sortedIndex) => {
                  const originalIndex = stops.findIndex(
                    (s) => s.color === stop.color && s.position === stop.position
                  );

                  return (
                    <Paper
                      key={`${stop.color}-${stop.position}`}
                      variant="outlined"
                      sx={{ p: 2 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Color Picker */}
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            backgroundColor: stop.color,
                            border: '1px solid',
                            borderColor: 'divider',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          <input
                            type="color"
                            value={stop.color}
                            onChange={(e) =>
                              onUpdateStop(originalIndex, { color: e.target.value })
                            }
                            style={{
                              position: 'absolute',
                              inset: 0,
                              opacity: 0,
                              cursor: 'pointer',
                              width: '100%',
                              height: '100%',
                            }}
                          />
                        </Box>

                        {/* Color Input */}
                        <TextField
                          size="small"
                          value={stop.color}
                          onChange={(e) =>
                            onUpdateStop(originalIndex, { color: e.target.value })
                          }
                          sx={{ flex: 1 }}
                        />

                        {/* Position Slider */}
                        <Box sx={{ flex: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Slider
                            value={stop.position}
                            onChange={(_, value) =>
                              onUpdateStop(originalIndex, { position: value as number })
                            }
                            min={0}
                            max={100}
                            size="small"
                          />
                          <Typography variant="caption" sx={{ minWidth: 35 }}>
                            {stop.position}%
                          </Typography>
                        </Box>

                        {/* Delete Button */}
                        <IconButton
                          size="small"
                          onClick={() => onRemoveStop(originalIndex)}
                          disabled={stops.length <= 2}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  );
                })}
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onReset} color="inherit">
            Reset
          </Button>
          <Button onClick={onCancel} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={onApply}>
            Apply & Copy CSS
          </Button>
        </DialogActions>
    </Dialog>
  );
}
