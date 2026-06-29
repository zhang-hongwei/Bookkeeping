/**
 * WorkspacePaletteCard Component
 * Card for displaying a palette in the workspace grid
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  History as VersionIcon,
  CompareArrows as CompareIcon,
  Download as DownloadIcon,
  OpenInNew as LoadIcon,
} from '@mui/icons-material';
import type { DbPalette } from '@/types/palette';
import { getContrastText } from '@/utils/color/theme-engine';

interface WorkspacePaletteCardProps {
  palette: DbPalette;
  onLoad: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onViewVersions: () => void;
  onAddToCompare: () => void;
  isInCompare: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  brand: '#6366f1',
  project: '#10b981',
  inspiration: '#f59e0b',
};

export function WorkspacePaletteCard({
  palette,
  onLoad,
  onEdit,
  onDelete,
  onToggleFavorite,
  onViewVersions,
  onAddToCompare,
  isInCompare,
}: WorkspacePaletteCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const semanticColors = [
    palette.themeData.semantic.primary,
    palette.themeData.semantic.secondary,
    palette.themeData.semantic.accent,
    palette.themeData.semantic.background,
    palette.themeData.semantic.surface,
    palette.themeData.semantic.text,
  ];

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(palette, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${palette.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    handleMenuClose();
  };

  return (
    <Paper
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 6,
        },
        position: 'relative',
      }}
    >
      {/* Color Strip */}
      <Box
        sx={{
          display: 'flex',
          height: 60,
          cursor: 'pointer',
        }}
        onClick={onLoad}
      >
        {semanticColors.map((color, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              bgcolor: color,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              pb: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: 8,
                color: getContrastText(color),
                opacity: 0.7,
                fontFamily: 'monospace',
              }}
            >
              {color}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Content */}
      <Box sx={{ p: 1.5, flex: 1 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {palette.name}
            </Typography>
            {palette.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {palette.description}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={0} sx={{ ml: 0.5 }}>
            <Tooltip title={palette.favorite ? 'Unfavorite' : 'Favorite'}>
              <IconButton size="small" onClick={onToggleFavorite}>
                {palette.favorite ? (
                  <StarIcon fontSize="small" color="warning" />
                ) : (
                  <StarBorderIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        {/* Meta */}
        <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            label={palette.category}
            size="small"
            sx={{
              height: 20,
              fontSize: 10,
              bgcolor: `${CATEGORY_COLORS[palette.category]}20`,
              color: CATEGORY_COLORS[palette.category],
              borderColor: CATEGORY_COLORS[palette.category],
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          />
          {palette.version > 1 && (
            <Chip label={`v${palette.version}`} size="small" sx={{ height: 20, fontSize: 10 }} />
          )}
          {palette.tags?.slice(0, 2).map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
          ))}
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {new Date(palette.updatedAt).toLocaleDateString()}
        </Typography>
      </Box>

      {/* Compare checkbox */}
      <Checkbox
        size="small"
        checked={isInCompare}
        onChange={(e) => {
          e.stopPropagation();
          if (isInCompare) return;
          onAddToCompare();
        }}
        icon={<CompareIcon fontSize="small" />}
        checkedIcon={<CompareIcon fontSize="small" color="primary" />}
        sx={{ position: 'absolute', bottom: 4, right: 4 }}
      />

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => { onLoad(); handleMenuClose(); }}>
          <ListItemIcon><LoadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Load in Extractor</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onEdit(); handleMenuClose(); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onViewVersions(); handleMenuClose(); }}>
          <ListItemIcon><VersionIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Version History</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportJSON}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export JSON</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onDelete(); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
}
