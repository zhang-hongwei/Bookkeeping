/**
 * PaletteHistory Component
 * Display saved palette history
 */

'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Tabs,
  Tab,
  Button,
  Divider,
  Box as MuiBox,
} from '@mui/material';
import {
  History as HistoryIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { SavedPaletteCard } from './SavedPaletteCard';
import type { SavedPalette } from '../../types';

interface PaletteHistoryProps {
  palettes: SavedPalette[];
  favorites: SavedPalette[];
  onLoad: (palette: SavedPalette) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  loaded: boolean;
}

export function PaletteHistory({
  palettes,
  favorites,
  onLoad,
  onDelete,
  onToggleFavorite,
  loaded,
}: PaletteHistoryProps) {
  const [tab, setTab] = React.useState<'all' | 'favorites'>('all');

  const displayPalettes = tab === 'favorites' ? favorites : palettes;

  if (!loaded) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading history...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab
            value="all"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <HistoryIcon fontSize="small" />
                <span>All ({palettes.length})</span>
              </Stack>
            }
          />
          <Tab
            value="favorites"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <StarIcon fontSize="small" />
                <span>Favorites ({favorites.length})</span>
              </Stack>
            }
          />
        </Tabs>
      </Box>

      {/* Palette list */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {displayPalettes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {tab === 'favorites' ? (
              <>
                <StarBorderIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">
                  No favorite palettes yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Star palettes to add them to favorites
                </Typography>
              </>
            ) : (
              <>
                <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">
                  No saved palettes yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Save your current palette to see it here
                </Typography>
              </>
            )}
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {displayPalettes.map((palette) => (
              <SavedPaletteCard
                key={palette.id}
                palette={palette}
                onLoad={() => onLoad(palette)}
                onDelete={() => onDelete(palette.id)}
                onToggleFavorite={() => onToggleFavorite(palette.id)}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Paper>
  );
}
