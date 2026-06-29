/**
 * Color Picker Section Component
 * Color customization section for background and palette
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { useBackgroundsStore } from '../store/backgroundsStore';

const PRESET_COLORS = [
  // Reds & Pinks
  '#ff6b6b', '#e94560', '#ff006e', '#f72585',
  // Oranges & Yellows
  '#ff9f43', '#f09819', '#ffe66d', '#ffc107',
  // Greens
  '#00ff88', '#43e97b', '#38f9d7', '#00b4d8',
  // Blues
  '#2193b0', '#4b6cb7', '#667eea', '#00ccff',
  // Purples
  '#764ba2', '#9d4edd', '#7b4397', '#c77dff',
  // Neutrals
  '#2d3436', '#636e72', '#b2bec3', '#dfe6e9',
];

// Color scheme presets
const COLOR_SCHEMES = [
  {
    name: 'Sunset',
    background: '#1a1a2e',
    palette: ['#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'],
  },
  {
    name: 'Ocean',
    background: '#0a192f',
    palette: ['#64ffda', '#4fc3f7', '#29b6f6', '#03a9f4', '#0288d1'],
  },
  {
    name: 'Forest',
    background: '#1b4332',
    palette: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'],
  },
  {
    name: 'Lavender',
    background: '#2d2d44',
    palette: ['#9d4edd', '#c77dff', '#e0aaff', '#7b2cbf', '#5a189a'],
  },
  {
    name: 'Warm Earth',
    background: '#2d2a2a',
    palette: ['#d4a373', '#e9c46a', '#f4a261', '#e76f51', '#bc6c25'],
  },
  {
    name: 'Neon',
    background: '#0f0f0f',
    palette: ['#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#80ff00'],
  },
  {
    name: 'Pastel',
    background: '#fafafa',
    palette: ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff'],
  },
  {
    name: 'Cyberpunk',
    background: '#0d0221',
    palette: ['#ff2a6d', '#05d9e8', '#d1f7ff', '#f7f7f7', '#7b2cbf'],
  },
  {
    name: 'Aurora',
    background: '#0c0c1e',
    palette: ['#43ce7c', '#4db8ff', '#9b59b6', '#e74c3c', '#f39c12'],
  },
  {
    name: 'Monochrome',
    background: '#1a1a1a',
    palette: ['#ffffff', '#e0e0e0', '#bdbdbd', '#9e9e9e', '#757575'],
  },
  {
    name: 'Cherry Blossom',
    background: '#fff0f5',
    palette: ['#ffb7c5', '#ff69b4', '#ff1493', '#db7093', '#c71585'],
  },
  {
    name: 'Midnight',
    background: '#0a0a23',
    palette: ['#5c6bc0', '#7986cb', '#9fa8da', '#c5cae9', '#e8eaf6'],
  },
];

export function ColorPickerSection() {
  const config = useBackgroundsStore((s) => s.config);
  const updateColors = useBackgroundsStore((s) => s.updateColors);
  const updatePalette = useBackgroundsStore((s) => s.updatePalette);

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [customColor, setCustomColor] = useState('#000000');

  const { colors } = config;

  const handleBackgroundChange = (color: string) => {
    updateColors({ background: color });
  };

  const handleAddPaletteColor = (color: string) => {
    updatePalette([...colors.palette, color]);
  };

  const handleRemovePaletteColor = (index: number) => {
    if (colors.palette.length > 1) {
      const newPalette = colors.palette.filter((_, i) => i !== index);
      updatePalette(newPalette);
    }
  };

  const handleEditPaletteColor = (index: number) => {
    setSelectedColorIndex(index);
    setCustomColor(colors.palette[index]);
    setColorPickerOpen(true);
  };

  const handleSaveCustomColor = () => {
    if (selectedColorIndex !== null) {
      const newPalette = [...colors.palette];
      newPalette[selectedColorIndex] = customColor;
      updatePalette(newPalette);
    }
    setColorPickerOpen(false);
    setSelectedColorIndex(null);
  };

  const handleApplyScheme = (scheme: typeof COLOR_SCHEMES[0]) => {
    updateColors({
      background: scheme.background,
      palette: [...scheme.palette],
    });
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Colors
      </Typography>

      {/* Color Scheme Presets */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Color Schemes
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
          }}
        >
          {COLOR_SCHEMES.map((scheme) => (
            <Tooltip key={scheme.name} title={scheme.name} arrow>
              <Paper
                onClick={() => handleApplyScheme(scheme)}
                sx={{
                  p: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '2px solid transparent',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      height: 24,
                      borderRadius: 0.5,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: '30%',
                        bgcolor: scheme.background,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                    {scheme.palette.slice(0, 4).map((color, i) => (
                      <Box
                        key={i}
                        sx={{
                          flex: 1,
                          bgcolor: color,
                        }}
                      />
                    ))}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      textAlign: 'center',
                      color: 'text.secondary',
                      fontSize: '0.65rem',
                      lineHeight: 1,
                    }}
                  >
                    {scheme.name}
                  </Typography>
                </Box>
              </Paper>
            </Tooltip>
          ))}
        </Box>
      </Box>

      {/* Background Color */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Background
        </Typography>
        <Paper
          sx={{
            p: 1,
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: colors.background,
              border: '2px solid',
              borderColor: 'primary.main',
              cursor: 'pointer',
            }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'color';
              input.value = colors.background;
              input.onchange = (e) => handleBackgroundChange((e.target as HTMLInputElement).value);
              input.click();
            }}
          />
          <Typography variant="caption" sx={{ alignSelf: 'center' }}>
            {colors.background}
          </Typography>
        </Paper>
      </Box>

      {/* Palette Colors */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Palette ({colors.palette.length} colors)
        </Typography>
        <Paper
          sx={{
            p: 1,
            display: 'flex',
            gap: 0.5,
            flexWrap: 'wrap',
          }}
        >
          {colors.palette.map((color, index) => (
            <Box
              key={index}
              sx={{
                position: 'relative',
                '&:hover .color-actions': {
                  opacity: 1,
                },
              }}
            >
              <Tooltip title={color}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: color,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                  onClick={() => handleEditPaletteColor(index)}
                />
              </Tooltip>
              <Box
                className="color-actions"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  display: 'flex',
                  gap: 0.25,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
              >
                <IconButton
                  size="small"
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => handleEditPaletteColor(index)}
                >
                  <EditIcon sx={{ fontSize: 10 }} />
                </IconButton>
                {colors.palette.length > 1 && (
                  <IconButton
                    size="small"
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'error.light', color: 'white' },
                    }}
                    onClick={() => handleRemovePaletteColor(index)}
                  >
                    <DeleteIcon sx={{ fontSize: 10 }} />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))}
          <Tooltip title="Add color">
            <IconButton
              size="small"
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                border: '1px dashed',
                borderColor: 'divider',
              }}
              onClick={() => {
                const randomColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
                handleAddPaletteColor(randomColor);
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Paper>
      </Box>

      {/* Preset Colors */}
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Quick Colors
        </Typography>
        <Paper
          sx={{
            p: 1,
            display: 'flex',
            gap: 0.5,
            flexWrap: 'wrap',
          }}
        >
          {PRESET_COLORS.map((color) => (
            <Tooltip key={color} title={color}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 0.5,
                  bgcolor: color,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s',
                  },
                }}
                onClick={() => handleAddPaletteColor(color)}
              />
            </Tooltip>
          ))}
        </Paper>
      </Box>

      {/* Custom Color Dialog */}
      <Dialog open={colorPickerOpen} onClose={() => setColorPickerOpen(false)}>
        <DialogTitle>Edit Color</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              style={{
                width: '100%',
                height: 100,
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            />
            <TextField
              fullWidth
              label="Hex Color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              sx={{ mt: 2 }}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColorPickerOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCustomColor}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
