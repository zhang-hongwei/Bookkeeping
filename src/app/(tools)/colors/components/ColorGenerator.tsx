'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  Paper,
  Stack,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import type { ColorPalette, ColorInfo, ColorStyle } from '@/types/ai';
import { COLOR_STYLES } from '@/types/ai';
import { exportAsCSS, exportAsJSON, exportAsTailwind } from '@/lib/ai/parsers/color-parser';

interface ColorGeneratorProps {
  onPaletteGenerated?: (palette: ColorPalette) => void;
  initialPalette?: ColorPalette | null;
}

export function ColorGenerator({ onPaletteGenerated, initialPalette }: ColorGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ColorStyle>('modern');
  const [colorCount, setColorCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [palette, setPalette] = useState<ColorPalette | null>(initialPalette || null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, colorCount }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate palette');
      }

      setPalette(data.data);
      onPaletteGenerated?.(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [prompt, style, colorCount, onPaletteGenerated]);

  const handleCopyColor = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  }, []);

  const handleExport = useCallback((format: 'css' | 'json' | 'tailwind') => {
    if (!palette) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'css':
        content = exportAsCSS(palette);
        filename = 'palette.css';
        mimeType = 'text/css';
        break;
      case 'json':
        content = exportAsJSON(palette);
        filename = 'palette.json';
        mimeType = 'application/json';
        break;
      case 'tailwind':
        content = exportAsTailwind(palette);
        filename = 'colors.ts';
        mimeType = 'text/typescript';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [palette]);

  const quickPrompts = [
    'Tech startup with vibrant energy',
    'Minimalist and elegant',
    'Earthy and natural',
    'Ocean and calming',
    'Warm sunset vibes',
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Describe Your Palette
              </Typography>

              {/* Prompt Input */}
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="e.g., A calming blue palette for a meditation app..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                sx={{ mb: 2 }}
              />

              {/* Quick Prompts */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Quick suggestions:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {quickPrompts.map((qp) => (
                    <Chip
                      key={qp}
                      label={qp}
                      size="small"
                      onClick={() => setPrompt(qp)}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>

              {/* Style Selector */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Style</InputLabel>
                <Select<ColorStyle>
                  value={style}
                  label="Style"
                  onChange={(e) => setStyle(e.target.value)}
                >
                  {Object.entries(COLOR_STYLES).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      <Box>
                        <Typography variant="body2">{value.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {value.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Color Count */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Number of Colors</InputLabel>
                <Select
                  value={colorCount}
                  label="Number of Colors"
                  onChange={(e) => setColorCount(Number(e.target.value))}
                >
                  {[3, 4, 5, 6, 7, 8].map((n) => (
                    <MenuItem key={n} value={n}>
                      {n} colors
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Generate Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                startIcon={loading ? undefined : <PaletteIcon />}
              >
                {loading ? 'Generating...' : 'Generate Palette'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              {palette ? (
                <Box>
                  {/* Palette Info */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{palette.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {palette.description}
                      </Typography>
                    </Box>
                    <Box>
                      <Tooltip title="Export CSS">
                        <IconButton size="small" onClick={() => handleExport('css')}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export JSON">
                        <IconButton size="small" onClick={() => handleExport('json')}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export Tailwind">
                        <IconButton size="small" onClick={() => handleExport('tailwind')}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Tags */}
                  {palette.tags && palette.tags.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                      {palette.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Stack>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Color Swatches */}
                  <Grid container spacing={2}>
                    {palette.colors.map((color, index) => (
                      <Grid key={index} size={{ xs: 6, sm: 4 }}>
                        <ColorSwatch color={color} onCopy={handleCopyColor} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 300,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <PaletteIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                  <Typography>Enter a description and click Generate</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Alert */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {/* Copy Success */}
      <Snackbar open={!!copiedColor} autoHideDuration={2000}>
        <Alert severity="success" icon={<CopyIcon />}>
          Copied {copiedColor}
        </Alert>
      </Snackbar>
    </Box>
  );
}

interface ColorSwatchProps {
  color: ColorInfo;
  onCopy: (hex: string) => void;
}

function ColorSwatch({ color, onCopy }: ColorSwatchProps) {
  // Determine if text should be dark or light based on background
  const isLightColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  const textColor = isLightColor(color.hex) ? '#000' : '#fff';

  return (
    <Paper
      sx={{
        height: 120,
        backgroundColor: color.hex,
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
      onClick={() => onCopy(color.hex)}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 1.5,
        }}
      >
        <Box
          sx={{
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 1,
            p: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: textColor, display: 'block', fontWeight: 600 }}
          >
            {color.name}
          </Typography>
          <Typography variant="caption" sx={{ color: textColor, opacity: 0.8 }}>
            {color.hex}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
