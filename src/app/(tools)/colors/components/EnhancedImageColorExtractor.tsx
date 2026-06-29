/**
 * EnhancedImageColorExtractor Component
 * Main component integrating all color extraction features
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Stack,
  Divider,
  Tabs,
  Tab,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Chip,
  Drawer,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  Palette as PaletteIcon,
  Tune as TuneIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  Colorize as ColorizeIcon,
  Contrast as ContrastIcon,
  Preview as PreviewIcon,
  Accessible as AccessibleIcon,
  Folder as WorkspaceIcon,
} from '@mui/icons-material';
import { buildDesignTheme, getContrastText } from '@/utils/color/theme-engine';
import {
  exportDesignTokensAsCSS,
  exportDesignTokensAsTailwind,
} from '@/lib/ai/parsers/color-parser';
import type { DesignTokenTheme, ColorScaleStep } from '@/types/ai';
import type {
  CustomColor,
  PickedLocation,
  HarmonyColor,
  ExtractorTab,
  ColorBlindnessType,
  SavedPalette,
} from '../types';
import { useColorExtractorStore } from '../store/colorExtractorStore';
import { generateHarmony } from '../utils/colorHarmony';
import { simulateColorBlindness } from '../utils/colorBlindness';

// Sub-components
import { ImageCanvas, Magnifier, ColorMarker } from './image-extractor';
import { ContrastBadge, ContrastSwatch, TextPreview } from './contrast-panel';
import { UIPreviewPanel } from './ui-preview';
import { HarmonyWheel, HarmonySelector, HarmonySwatches } from './color-harmony';
import { PaletteHistory, PaletteNameDialog } from './palette-history';
import { BlindnessSimulator } from './color-blindness';

const SCALE_STEPS: ColorScaleStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

interface EnhancedImageColorExtractorProps {
  initialImage?: string;
  onPaletteGenerated?: (theme: DesignTokenTheme) => void;
}

export function EnhancedImageColorExtractor({
  initialImage,
  onPaletteGenerated,
}: EnhancedImageColorExtractorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [imageName, setImageName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [themeData, setThemeData] = useState<DesignTokenTheme | null>(null);
  const [activeTab, setActiveTab] = useState<ExtractorTab>('raw');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Eyedropper state
  const [eyedropperActive, setEyedropperActive] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState<{ x: number; y: number } | null>(null);
  const [magnifierColor, setMagnifierColor] = useState<string | null>(null);
  const [pickedLocations, setPickedLocations] = useState<PickedLocation[]>([]);

  // Custom colors
  const [customColors, setCustomColors] = useState<CustomColor[]>([]);

  // Harmony state
  const [harmonyType, setHarmonyType] = useState<'complementary' | 'triadic' | 'analogous' | 'split-complementary' | 'tetradic' | 'square'>('complementary');
  const [harmonyColors, setHarmonyColors] = useState<HarmonyColor[]>([]);
  const [harmonyBaseColor, setHarmonyBaseColor] = useState<string | null>(null);

  // Color blindness state
  const [blindnessType, setBlindnessType] = useState<ColorBlindnessType | null>(null);

  // History state
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  // Preview panel state
  const [previewPanelOpen, setPreviewPanelOpen] = useState(false);

  // Drag state
  const [dragActive, setDragActive] = useState(false);

  // Save to Workspace state
  const [savingToWorkspace, setSavingToWorkspace] = useState(false);
  const [snackbar, setSnackbar] = useState<{ success: boolean; message: string } | null>(null);

  // File handling
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
      setThemeData(null);
      setPickedLocations([]);
      setCustomColors([]);
    };
    reader.readAsDataURL(file);
  }, []);

  // Drag handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
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

  // Extract colors
  const handleExtract = useCallback(async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const result = await buildDesignTheme(image, imageName);
      setThemeData(result);
      setHarmonyBaseColor(result.semantic.primary);
      setHarmonyColors(generateHarmony(result.semantic.primary, harmonyType));
      onPaletteGenerated?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract colors');
    } finally {
      setLoading(false);
    }
  }, [image, imageName, harmonyType, onPaletteGenerated]);

  // Color picking
  const handleColorPick = useCallback((location: Omit<PickedLocation, 'id'>) => {
    const newLocation: PickedLocation = {
      ...location,
      id: `picked_${Date.now()}`,
    };
    setPickedLocations((prev) => [...prev, newLocation]);

    // Add to custom colors
    const newColor: CustomColor = {
      id: `custom_${Date.now()}`,
      hex: location.hex,
      name: `Picked ${pickedLocations.length + 1}`,
      source: 'picked',
      location: newLocation,
    };
    setCustomColors((prev) => [...prev, newColor]);
  }, [pickedLocations.length]);

  // Handle mouse move on canvas for magnifier
  const handleMagnifierMove = useCallback((e: React.MouseEvent) => {
    if (!eyedropperActive) return;

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setMagnifierPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, [eyedropperActive]);

  // Copy color
  const handleCopyColor = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  }, []);

  // Export
  const handleExport = useCallback(
    (format: 'css' | 'tailwind') => {
      if (!themeData) return;

      const content =
        format === 'css' ? exportDesignTokensAsCSS(themeData) : exportDesignTokensAsTailwind(themeData);
      const ext = format === 'css' ? 'css' : 'ts';
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theme-tokens.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [themeData]
  );

  // Save palette
  const handleSavePalette = useCallback((name: string, tags: string[]) => {
    if (!themeData) return;

    const palette: SavedPalette = {
      id: `palette_${Date.now()}`,
      name,
      theme: themeData,
      customColors,
      pickedLocations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags,
      favorite: false,
    };

    setSavedPalettes((prev) => [palette, ...prev]);
  }, [themeData, customColors, pickedLocations]);

  // Save to Workspace
  const handleSaveToWorkspace = useCallback(async () => {
    if (!themeData) return;
    setSavingToWorkspace(true);
    try {
      const response = await fetch('/api/palettes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: imageName || 'Untitled Palette',
          description: `Extracted from ${imageName || 'image'}`,
          category: 'inspiration',
          themeData,
          customColors: customColors.map(c => ({
            id: c.id,
            hex: c.hex,
            name: c.name,
            source: c.source,
            harmonyType: c.harmonyType,
          })),
          pickedLocations: pickedLocations.map(p => ({
            id: p.id,
            x: p.x,
            y: p.y,
            hex: p.hex,
          })),
          sourceImageName: imageName,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSnackbar({ success: true, message: 'Saved to Workspace' });
        } else {
          setSnackbar({ success: false, message: result.error || 'Failed to save' });
        }
      } else {
        setSnackbar({ success: false, message: 'Failed to save to workspace' });
      }
    } catch (err) {
      setSnackbar({ success: false, message: 'Failed to save to workspace' });
    } finally {
      setSavingToWorkspace(false);
    }
  }, [themeData, imageName, customColors, pickedLocations]);

  // Clear image
  const handleClear = useCallback(() => {
    setImage(null);
    setImageName('');
    setThemeData(null);
    setError(null);
    setPickedLocations([]);
    setCustomColors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Left Panel - Image Upload & Canvas */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ p: 2, height: '100%' }}>
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Image Color Extractor</Typography>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Toggle Color Picker">
                    <IconButton
                      color={eyedropperActive ? 'primary' : 'default'}
                      onClick={() => setEyedropperActive(!eyedropperActive)}
                    >
                      <ColorizeIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View History">
                    <IconButton onClick={() => setHistoryDrawerOpen(true)}>
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              {/* Upload Zone or Canvas */}
              {!image ? (
                <Box
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: '2px dashed',
                    borderColor: dragActive ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    p: 6,
                    textAlign: 'center',
                    bgcolor: dragActive ? 'action.hover' : 'background.default',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minHeight: 300,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary" variant="h6">
                    Drag & drop an image
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    or click to select
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    JPG, PNG, WebP (max 10MB)
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ position: 'relative' }}>
                  {/* Image with markers */}
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: eyedropperActive ? 'crosshair' : 'default',
                    }}
                    onMouseMove={handleMagnifierMove}
                    onMouseLeave={() => setMagnifierPosition(null)}
                  >
                    <Box
                      component="img"
                      src={image}
                      alt="Uploaded"
                      sx={{ maxWidth: '100%', maxHeight: 400, display: 'block' }}
                    />

                    {/* Clear button */}
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'background.paper',
                      }}
                      onClick={handleClear}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>

                    {/* Picked location markers */}
                    {pickedLocations.map((loc) => (
                      <Box
                        key={loc.id}
                        sx={{
                          position: 'absolute',
                          left: `calc(${(loc.x / 100)}% - 10px)`,
                          top: `calc(${(loc.y / 100)}% - 10px)`,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: loc.hex,
                          border: '2px solid white',
                          boxShadow: 2,
                          pointerEvents: 'none',
                        }}
                      />
                    ))}
                  </Box>

                  {/* File name */}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {imageName}
                  </Typography>
                </Box>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />

              {/* Extract button */}
              {image && (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleExtract}
                  disabled={loading}
                  startIcon={<PaletteIcon />}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Extracting...' : 'Extract Colors'}
                </Button>
              )}
            </Paper>
          </Grid>

          {/* Right Panel - Results */}
          <Grid size={{ xs: 12, lg: 6 }}>
            {themeData ? (
              <Stack spacing={2}>
                {/* Tabbed Results */}
                <Paper sx={{ p: 2 }}>
                  <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                  >
                    <Tab label="Raw Palette" value="raw" />
                    <Tab label="Semantic" value="semantic" />
                    <Tab label="Scales" value="scales" />
                    <Tab label="Custom" value="custom" />
                    <Tab label="Harmony" value="harmony" />
                  </Tabs>

                  {/* Tab Content */}
                  {activeTab === 'raw' && (
                    <Grid container spacing={1.5}>
                      {Object.entries(themeData.palette).map(([name, hex]) => (
                        <Grid key={name} size={{ xs: 6, sm: 4 }}>
                          <ColorSwatch hex={hex} label={name} onCopy={handleCopyColor} />
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {activeTab === 'semantic' && (
                    <Grid container spacing={1.5}>
                      {Object.entries(themeData.semantic).map(([name, hex]) => (
                        <Grid key={name} size={{ xs: 6, sm: 4 }}>
                          <ColorSwatch hex={hex} label={name} onCopy={handleCopyColor} />
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {activeTab === 'scales' && (
                    <Stack spacing={2}>
                      {Object.entries(themeData.scales).map(([token, scale]) => (
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
                                    bgcolor: scale[step],
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

                  {activeTab === 'custom' && (
                    <Box>
                      {customColors.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <ColorizeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                          <Typography color="text.secondary">
                            No custom colors yet
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Use the color picker tool to pick colors from your image
                          </Typography>
                        </Box>
                      ) : (
                        <Grid container spacing={1.5}>
                          {customColors.map((color) => (
                            <Grid key={color.id} size={{ xs: 6, sm: 4 }}>
                              <ColorSwatch
                                hex={color.hex}
                                label={color.name}
                                onCopy={handleCopyColor}
                                onDelete={() => setCustomColors((prev) => prev.filter((c) => c.id !== color.id))}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>
                  )}

                  {activeTab === 'harmony' && (
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 5 }}>
                        <HarmonySelector
                          value={harmonyType}
                          onChange={(type) => {
                            setHarmonyType(type);
                            if (harmonyBaseColor) {
                              setHarmonyColors(generateHarmony(harmonyBaseColor, type));
                            }
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 7 }}>
                        <HarmonySwatches
                          colors={harmonyColors}
                          onAddToPalette={(color) => {
                            const newColor: CustomColor = {
                              id: `harmony_${Date.now()}`,
                              hex: color.hex,
                              name: color.relationship,
                              source: 'harmony',
                              harmonyType: color.type,
                            };
                            setCustomColors((prev) => [...prev, newColor]);
                          }}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Paper>

                {/* Action Buttons */}
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={() => setSaveDialogOpen(true)}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<WorkspaceIcon />}
                    onClick={handleSaveToWorkspace}
                    disabled={savingToWorkspace}
                    color="primary"
                  >
                    {savingToWorkspace ? 'Saving...' : 'Save to Workspace'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExport('css')}
                  >
                    CSS
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExport('tailwind')}
                  >
                    Tailwind
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={() => setPreviewPanelOpen(!previewPanelOpen)}
                  >
                    UI Preview
                  </Button>
                </Stack>

                {/* Color Blindness Simulator */}
                <BlindnessSimulator
                  colors={[
                    { id: '1', hex: themeData.semantic.primary, name: 'Primary', source: 'extracted' },
                    { id: '2', hex: themeData.semantic.secondary, name: 'Secondary', source: 'extracted' },
                    { id: '3', hex: themeData.semantic.accent, name: 'Accent', source: 'extracted' },
                    ...customColors,
                  ]}
                  activeType={blindnessType}
                  onTypeChange={setBlindnessType}
                />
              </Stack>
            ) : (
              <Paper
                sx={{
                  height: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                }}
              >
                <PaletteIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                <Typography>Upload an image and click Extract</Typography>
              </Paper>
            )}
          </Grid>

          {/* UI Preview Panel (collapsible side panel) */}
          {previewPanelOpen && themeData && (
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">UI Preview</Typography>
                  <IconButton onClick={() => setPreviewPanelOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Stack>
                <UIPreviewPanel theme={themeData} customColors={customColors} />
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* History Drawer */}
      <Drawer
        anchor="right"
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
      >
        <AppBar position="sticky" elevation={0}>
          <Toolbar>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Palette History
            </Typography>
            <IconButton onClick={() => setHistoryDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 2 }}>
          <PaletteHistory
            palettes={savedPalettes}
            favorites={savedPalettes.filter((p) => p.favorite)}
            onLoad={(palette) => {
              setThemeData(palette.theme);
              setCustomColors(palette.customColors);
              setPickedLocations(palette.pickedLocations);
              setHistoryDrawerOpen(false);
            }}
            onDelete={(id) => setSavedPalettes((prev) => prev.filter((p) => p.id !== id))}
            onToggleFavorite={(id) => {
              setSavedPalettes((prev) =>
                prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p))
              );
            }}
            loaded={true}
          />
        </Box>
      </Drawer>

      {/* Save Dialog */}
      <PaletteNameDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSavePalette}
      />

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
      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar(null)}>
        <Alert severity={snackbar?.success ? 'success' : 'error'} onClose={() => setSnackbar(null)}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ==================== Helper Components ====================

interface ColorSwatchProps {
  hex: string;
  label: string;
  onCopy: (hex: string) => void;
  onDelete?: () => void;
}

function ColorSwatch({ hex, label, onCopy, onDelete }: ColorSwatchProps) {
  const textColor = getContrastText(hex);

  return (
    <Paper
      onClick={() => onCopy(hex)}
      sx={{
        height: 100,
        bgcolor: hex,
        borderRadius: 2,
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.03)' },
        position: 'relative',
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 1,
        }}
      >
        <Box sx={{ bgcolor: 'rgba(0,0,0,0.25)', borderRadius: 1, p: 0.75 }}>
          <Typography variant="caption" sx={{ color: textColor, display: 'block', fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography variant="caption" sx={{ color: textColor, opacity: 0.85 }}>
            {hex}
          </Typography>
        </Box>
      </Box>
      {onDelete && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            bgcolor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': { bgcolor: 'error.main' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Paper>
  );
}
