'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Paper,
  Divider,
  Stack,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';

import { buildDesignTheme, getContrastText } from '@/utils/color/theme-engine';
import {
  exportDesignTokensAsCSS,
  exportDesignTokensAsTailwind,
} from '@/lib/ai/parsers/color-parser';
import type { DesignTokenTheme, ColorScaleStep } from '@/types/ai';

const SCALE_STEPS: ColorScaleStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

export function ImageColorExtractor() {
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<DesignTokenTheme | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setImageName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImage(base64);
      setTheme(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleExtract = useCallback(async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const result = await buildDesignTheme(image, imageName);
      setTheme(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract colors');
    } finally {
      setLoading(false);
    }
  }, [image, imageName]);

  const handleCopyColor = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  }, []);

  const handleExport = useCallback(
    (format: 'css' | 'tailwind') => {
      if (!theme) return;

      const content =
        format === 'css' ? exportDesignTokensAsCSS(theme) : exportDesignTokensAsTailwind(theme);
      const ext = format === 'css' ? 'css' : 'ts';
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theme-tokens.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [theme]
  );

  const handleClear = useCallback(() => {
    setImage(null);
    setImageName('');
    setTheme(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  return (
    <Grid container spacing={3}>
      {/* Upload Section */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Upload Image
            </Typography>

            <Box
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              sx={{
                border: '2px dashed',
                borderColor: dragActive ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                backgroundColor: dragActive ? 'action.hover' : 'background.default',
                cursor: 'pointer',
                transition: 'all 0.2s',
                mb: 2,
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {image ? (
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={image}
                    alt="Uploaded"
                    sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1 }}
                  />
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'background.paper' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box>
                  <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">Drag & drop an image, or click to select</Typography>
                  <Typography variant="caption" color="text.secondary">
                    JPG, PNG, WebP (max 10MB)
                  </Typography>
                </Box>
              )}
            </Box>

            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

            {imageName && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                {imageName}
              </Typography>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleExtract}
              disabled={loading || !image}
              startIcon={loading ? <CircularProgress size={20} /> : <PaletteIcon />}
            >
              {loading ? 'Extracting...' : 'Extract & Generate Theme'}
            </Button>

            {/* Instant processing indicator */}
            {!loading && !theme && image && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                Local processing, no API call needed
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Result Section */}
      <Grid size={{ xs: 12, md: 7 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            {theme ? (
              <Box>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">Design Tokens</Typography>
                    <Typography variant="body2" color="text.secondary">
                      From: {theme.source}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => handleExport('css')}>
                      CSS
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => handleExport('tailwind')}>
                      Tailwind
                    </Button>
                  </Stack>
                </Box>

                {/* Sub-tabs */}
                <Tabs
                  value={activeTab}
                  onChange={(_, v) => setActiveTab(v)}
                  sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                >
                  <Tab label="Raw Palette" />
                  <Tab label="Semantic Tokens" />
                  <Tab label="Color Scales" />
                </Tabs>

                {/* Tab 1: Raw Palette */}
                {activeTab === 0 && (
                  <Grid container spacing={1.5}>
                    {Object.entries(theme.palette).map(([name, hex]) => (
                      <Grid key={name} size={{ xs: 6, sm: 4 }}>
                        <Swatch hex={hex} label={name} onCopy={handleCopyColor} />
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Tab 2: Semantic Tokens */}
                {activeTab === 1 && (
                  <Grid container spacing={1.5}>
                    {Object.entries(theme.semantic).map(([name, hex]) => (
                      <Grid key={name} size={{ xs: 6, sm: 4 }}>
                        <Swatch hex={hex} label={name} onCopy={handleCopyColor} />
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Tab 3: Color Scales */}
                {activeTab === 2 && (
                  <Stack spacing={2}>
                    {(
                      Object.entries(theme.scales) as [keyof typeof theme.scales, Record<ColorScaleStep, string>][]
                    ).map(([token, scale]) => (
                      <Box key={token}>
                        <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                          {token}
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                          {SCALE_STEPS.map((step) => (
                            <Tooltip key={step} title={`${token}-${step}: ${scale[step]}`}>
                              <Paper
                                onClick={() => handleCopyColor(scale[step])}
                                sx={{
                                  flex: 1,
                                  height: 40,
                                  backgroundColor: scale[step],
                                  borderRadius: 1,
                                  cursor: 'pointer',
                                  minWidth: 0,
                                  transition: 'transform 0.15s',
                                  '&:hover': { transform: 'scaleY(1.15)' },
                                }}
                              />
                            </Tooltip>
                          ))}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
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
                <Typography>Upload an image and click Extract</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Snackbars */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={!!copiedColor} autoHideDuration={2000}>
        <Alert severity="success" icon={<CopyIcon />}>
          Copied {copiedColor}
        </Alert>
      </Snackbar>
    </Grid>
  );
}

/** Reusable color swatch component */
function Swatch({ hex, label, onCopy }: { hex: string; label: string; onCopy: (hex: string) => void }) {
  const textColor = getContrastText(hex);

  return (
    <Paper
      onClick={() => onCopy(hex)}
      sx={{
        height: 100,
        backgroundColor: hex,
        borderRadius: 2,
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.03)' },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 1 }}>
        <Box sx={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 1, p: 0.75 }}>
          <Typography variant="caption" sx={{ color: textColor, display: 'block', fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography variant="caption" sx={{ color: textColor, opacity: 0.85 }}>
            {hex}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
