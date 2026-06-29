/**
 * SavedPaletteCard Component
 * Card displaying a saved palette
 */

'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Download as DownloadIcon,
  FolderOpen as LoadIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import type { SavedPalette } from '../../types';
import { downloadPaletteAsJSON } from '../../utils/paletteStorage';

interface SavedPaletteCardProps {
  palette: SavedPalette;
  onLoad: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export function SavedPaletteCard({
  palette,
  onLoad,
  onDelete,
  onToggleFavorite,
}: SavedPaletteCardProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = () => {
    downloadPaletteAsJSON(palette);
    handleMenuClose();
  };

  // Extract colors for preview
  const previewColors = [
    palette.theme.semantic.primary,
    palette.theme.semantic.secondary,
    palette.theme.semantic.accent,
  ];

  return (
    <Paper
      sx={{
        p: 1.5,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: 'action.hover',
          transform: 'translateX(4px)',
        },
      }}
      onClick={onLoad}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        {/* Color preview */}
        <Stack direction="row" spacing={0.5}>
          {previewColors.map((color, index) => (
            <Box
              key={index}
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                bgcolor: color,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          ))}
        </Stack>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={500}
            noWrap
          >
            {palette.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(palette.updatedAt).toLocaleDateString()}
          </Typography>
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={palette.favorite ? 'Remove from favorites' : 'Add to favorites'}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              color={palette.favorite ? 'warning' : 'default'}
            >
              {palette.favorite ? (
                <StarIcon fontSize="small" />
              ) : (
                <StarBorderIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <IconButton
            size="small"
            onClick={handleMenuOpen}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => { onLoad(); handleMenuClose(); }}>
          <ListItemIcon>
            <LoadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Load Palette</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export JSON</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onDelete(); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
}
