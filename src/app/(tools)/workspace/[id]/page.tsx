/**
 * Palette Detail Page
 * /workspace/[id] - Full editing page for a palette
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Stack,
  Divider,
  Button,
  IconButton,
  TextField,
  Chip,
  Paper,
  Grid,
  Tooltip,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon,
  Visibility as PreviewIcon,
} from '@mui/icons-material';
import type { DbPalette, DbPaletteVersion, PaletteCategory } from '@/types/palette';
import type { ColorScaleStep } from '@/types/ai';
import { getContrastText } from '@/utils/color/theme-engine';
import { FullScreenPreviewDialog } from '../components/FullScreenPreviewDialog';

const SCALE_STEPS: ColorScaleStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const SUGGESTED_TAGS = ['Warm', 'Cool', 'Pastel', 'Vibrant', 'Dark', 'Light', 'Nature', 'Tech', 'Retro', 'Minimal', 'Luxury', 'Corporate'];

export default function PaletteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paletteId = params.id as string;

  // State
  const [palette, setPalette] = useState<DbPalette | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ success: boolean; message: string } | null>(null);

  // Edit state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PaletteCategory>('project');
  const [tags, setTags] = useState<string[]>([]);
  const [semanticColors, setSemanticColors] = useState<Record<string, string>>({});

  // Version history
  const [versions, setVersions] = useState<DbPaletteVersion[]>([]);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Preview dialog
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load palette
  useEffect(() => {
    const fetchPalette = async () => {
      try {
        const res = await fetch(`/api/palettes/${paletteId}`);
        const data = await res.json();
        if (data.success) {
          setPalette(data.data);
          setName(data.data.name);
          setDescription(data.data.description ?? '');
          setCategory(data.data.category);
          setTags(data.data.tags ?? []);
          setSemanticColors(data.data.themeData.semantic);
        } else {
          setSnackbar({ success: false, message: 'Palette not found' });
        }
      } catch {
        setSnackbar({ success: false, message: 'Failed to load palette' });
      } finally {
        setLoading(false);
      }
    };
    fetchPalette();
  }, [paletteId]);

  // Save changes
  const handleSave = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/palettes/${paletteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          category,
          tags,
          themeData: {
            ...palette!.themeData,
            semantic: semanticColors,
          },
          changeNote: 'Updated colors and metadata',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPalette(data.data);
        setSnackbar({ success: true, message: 'Saved successfully' });
      } else {
        setSnackbar({ success: false, message: data.error || 'Failed to save' });
      }
    } catch {
      setSnackbar({ success: false, message: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  }, [paletteId, palette, name, description, category, tags, semanticColors]);

  // Delete palette
  const handleDelete = useCallback(async () => {
    try {
      const res = await fetch(`/api/palettes/${paletteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        router.push('/workspace');
      } else {
        setSnackbar({ success: false, message: 'Failed to delete' });
      }
    } catch {
      setSnackbar({ success: false, message: 'Failed to delete' });
    }
  }, [paletteId, router]);

  // Load versions
  const loadVersions = useCallback(async () => {
    setVersionsLoading(true);
    try {
      const res = await fetch(`/api/palettes/${paletteId}/versions`);
      const data = await res.json();
      if (data.success) {
        setVersions(data.data);
      }
    } catch {
      // ignore
    } finally {
      setVersionsLoading(false);
    }
  }, [paletteId]);

  // Restore version
  const handleRestoreVersion = useCallback(async (versionNumber: number) => {
    try {
      const res = await fetch(`/api/palettes/${paletteId}/restore?version=${versionNumber}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPalette(data.data);
        setSemanticColors(data.data.themeData.semantic);
        setSnackbar({ success: true, message: `Restored v${versionNumber}` });
        loadVersions();
      }
    } catch {
      setSnackbar({ success: false, message: 'Failed to restore' });
    }
  }, [paletteId, loadVersions]);

  // Export
  const handleExport = useCallback((format: 'css' | 'json') => {
    if (!palette) return;
    let content: string;
    let filename: string;

    if (format === 'json') {
      content = JSON.stringify(palette, null, 2);
      filename = `${palette.name}.json`;
    } else {
      const lines = [`:root {`];
      Object.entries(semanticColors).forEach(([key, value]) => {
        lines.push(`  --color-${key}: ${value};`);
      });
      lines.push('}');
      lines.push('');
      Object.entries(palette.themeData.scales).forEach(([token, scale]) => {
        lines.push(`/* ${token} scale */`);
        SCALE_STEPS.forEach((step) => {
          lines.push(`--color-${token}-${step}: ${scale[step]};`);
        });
        lines.push('');
      });
      content = lines.join('\n');
      filename = `${palette.name}.css`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [palette, semanticColors]);

  // Copy color
  const handleCopyColor = useCallback((color: string) => {
    navigator.clipboard.writeText(color);
    setSnackbar({ success: true, message: `Copied ${color}` });
  }, []);

  // Update semantic color
  const handleColorChange = useCallback((key: string, value: string) => {
    setSemanticColors((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Tag management
  const [tagInput, setTagInput] = useState('');
  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!palette) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Palette not found</Alert>
        <Button sx={{ mt: 2 }} onClick={() => router.push('/workspace')}>Back to Workspace</Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4, px: 10 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => router.push('/workspace')}>
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <TextField
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="standard"
                size="medium"
                sx={{
                  '& .MuiInputBase-input': { fontSize: '2rem', fontWeight: 700 },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                v{palette.version} · Last updated {new Date(palette.updatedAt).toLocaleString()}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outlined" startIcon={<HistoryIcon />} onClick={() => { setVersionsOpen(true); loadVersions(); }}>
                History
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleExport('css')}>
                CSS
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleExport('json')}>
                JSON
              </Button>
            </Stack>
          </Stack>

          <Divider />

          {/* Tab Toggle */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() => setPreviewOpen(true)}
            >
              UI Preview
            </Button>
          </Stack>

          {/* Main Content */}
          <Grid container spacing={3}>
            {/* Left: Colors */}
            <Grid size={{ xs: 12, lg: 8 }}>
              {/* Semantic Colors */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Semantic Colors</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click on a color to edit it
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(semanticColors).map(([key, value]) => (
                    <Grid key={key} size={{ xs: 6, sm: 4, md: 2 }}>
                      <Box
                        sx={{
                          height: 80,
                          borderRadius: 2,
                          bgcolor: value,
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.02)' },
                        }}
                        onClick={() => {
                          const newColor = prompt(`Enter new color for ${key}:`, value);
                          if (newColor && /^#[0-9A-Fa-f]{6}$/.test(newColor)) {
                            handleColorChange(key, newColor);
                          }
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 1,
                            bgcolor: 'rgba(0,0,0,0.5)',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: getContrastText(value), textTransform: 'capitalize' }}>
                            {key}
                          </Typography>
                          <Tooltip title="Copy">
                            <IconButton
                              size="small"
                              sx={{ position: 'absolute', right: 4, top: 4, color: getContrastText(value) }}
                              onClick={(e) => { e.stopPropagation(); handleCopyColor(value); }}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Color Scales */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Color Scales</Typography>
                <Stack spacing={2}>
                  {Object.entries(palette.themeData.scales).map(([token, scale]) => (
                    <Box key={token}>
                      <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block', textTransform: 'capitalize' }}>
                        {token}
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        {SCALE_STEPS.map((step) => (
                          <Tooltip key={step} title={`${token}-${step}: ${scale[step]}`}>
                            <Box
                              sx={{
                                flex: 1,
                                height: 40,
                                bgcolor: scale[step],
                                borderRadius: 1,
                                cursor: 'pointer',
                                transition: 'transform 0.15s',
                                '&:hover': { transform: 'scaleY(1.2)' },
                              }}
                              onClick={() => handleCopyColor(scale[step])}
                            />
                          </Tooltip>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            {/* Right: Metadata */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Details</Typography>
                <Stack spacing={2.5}>
                  <TextField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={3}
                    size="small"
                    fullWidth
                  />

                  <FormControl size="small" fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={category}
                      label="Category"
                      onChange={(e) => setCategory(e.target.value as PaletteCategory)}
                    >
                      <MenuItem value="brand">Brand</MenuItem>
                      <MenuItem value="project">Project</MenuItem>
                      <MenuItem value="inspiration">Inspiration</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Tags */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Tags
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 1, gap: 0.5 }}>
                      {tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          onDelete={() => setTags(tags.filter((t) => t !== tag))}
                        />
                      ))}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <TextField
                        size="small"
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        sx={{ flex: 1 }}
                      />
                      <Button size="small" onClick={handleAddTag} disabled={!tagInput.trim()}>
                        Add
                      </Button>
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Danger Zone */}
                  <Box>
                    <Typography variant="subtitle2" color="error.main" gutterBottom>
                      Danger Zone
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteDialogOpen(true)}
                      fullWidth
                    >
                      Delete Palette
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </Container>

      {/* Full Screen UI Preview */}
      <FullScreenPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        semanticColors={semanticColors}
        paletteName={name}
      />

      {/* Version History Dialog */}
      <Dialog open={versionsOpen} onClose={() => setVersionsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Version History</DialogTitle>
        <DialogContent>
          {versionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : versions.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No version history yet
            </Typography>
          ) : (
            <List>
              {versions.map((version) => (
                <ListItem
                  key={version.id}
                  secondaryAction={
                    <Button size="small" onClick={() => { handleRestoreVersion(version.versionNumber); setVersionsOpen(false); }}>
                      Restore
                    </Button>
                  }
                >
                  <ListItemText
                    primary={`Version ${version.versionNumber}`}
                    secondary={version.changeNote || new Date(version.createdAt).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Palette?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar(null)}>
        <Alert severity={snackbar?.success ? 'success' : 'error'} onClose={() => setSnackbar(null)}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
