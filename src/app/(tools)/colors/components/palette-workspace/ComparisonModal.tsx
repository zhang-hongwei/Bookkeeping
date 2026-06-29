/**
 * ComparisonModal Component
 * Side-by-side comparison of 2-3 palettes
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Grid,
  Stack,
  Typography,
  Box,
  Paper,
  Chip,
  Tooltip,
} from '@mui/material';
import { Close as CloseIcon, Compare as CompareIcon } from '@mui/icons-material';
import { usePaletteWorkspaceStore } from '../../store/paletteWorkspaceStore';
import { getContrastText } from '@/utils/color/theme-engine';

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

interface ComparisonModalProps {
  open: boolean;
  onClose: () => void;
}

export function ComparisonModal({ open, onClose }: ComparisonModalProps) {
  const { comparePalettes } = usePaletteWorkspaceStore();

  if (comparePalettes.length === 0) return null;

  const semanticKeys = ['primary', 'secondary', 'accent', 'background', 'surface', 'text'] as const;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <CompareIcon />
            <Typography variant="h6">Palette Comparison</Typography>
          </Stack>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {/* Semantic Colors Comparison */}
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Semantic Colors
        </Typography>
        <Paper sx={{ overflow: 'hidden', mb: 3 }}>
          {/* Header row */}
          <Stack direction="row">
            <Box sx={{ width: 100, p: 1, bgcolor: 'grey.100' }}>
              <Typography variant="caption" fontWeight={600}>Token</Typography>
            </Box>
            {comparePalettes.map((palette) => (
              <Box key={palette.id} sx={{ flex: 1, p: 1, bgcolor: 'grey.100', textAlign: 'center' }}>
                <Typography variant="caption" fontWeight={600} noWrap>
                  {palette.name}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Color rows */}
          {semanticKeys.map((key) => (
            <Stack key={key} direction="row">
              <Box sx={{ width: 100, p: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                  {key}
                </Typography>
              </Box>
              {comparePalettes.map((palette) => {
                const color = palette.themeData.semantic[key];
                return (
                  <Box
                    key={palette.id}
                    sx={{
                      flex: 1,
                      height: 48,
                      bgcolor: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.9 },
                    }}
                    onClick={() => navigator.clipboard.writeText(color)}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: getContrastText(color), fontFamily: 'monospace' }}
                    >
                      {color}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          ))}
        </Paper>

        {/* Color Scales Comparison */}
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Color Scales
        </Typography>
        <Grid container spacing={2}>
          {comparePalettes.map((palette) => (
            <Grid key={palette.id} size={{ xs: 12, md: comparePalettes.length <= 2 ? 6 : 4 }}>
              <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                {palette.name}
              </Typography>
              {Object.entries(palette.themeData.scales).map(([token, scale]) => (
                <Box key={token} sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {token}
                  </Typography>
                  <Stack direction="row" spacing={0.25}>
                    {SCALE_STEPS.map((step) => (
                      <Tooltip title={`${token}-${step}: ${scale[step]}`} key={step}>
                        <Box
                          sx={{
                            flex: 1,
                            height: 24,
                            bgcolor: scale[step],
                            cursor: 'pointer',
                            '&:hover': { transform: 'scaleY(1.3)', zIndex: 1 },
                            transition: 'transform 0.1s',
                          }}
                          onClick={() => navigator.clipboard.writeText(scale[step])}
                        />
                      </Tooltip>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Grid>
          ))}
        </Grid>

        {/* Metadata */}
        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
          Metadata
        </Typography>
        <Grid container spacing={2}>
          {comparePalettes.map((palette) => (
            <Grid key={palette.id} size={{ xs: 12, md: comparePalettes.length <= 2 ? 6 : 4 }}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="subtitle2">{palette.name}</Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                  <Chip label={palette.category} size="small" />
                  <Chip label={`v${palette.version}`} size="small" variant="outlined" />
                </Stack>
                {palette.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {palette.description}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

