'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  Chip,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Gradient as GradientIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import type { GradientInfo, GradientGenerationRequest } from '@/types/ai';
import { GRADIENT_PRESETS } from '@/lib/ai/prompts/gradient-prompts';

interface GeneratedGradient extends GradientInfo {
  name?: string;
  description?: string;
  tags?: string[];
}

export default function GradientsPage() {
  const [prompt, setPrompt] = useState('');
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gradient, setGradient] = useState<GeneratedGradient | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/gradients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: gradientType } as GradientGenerationRequest),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate gradient');
      }

      setGradient(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [prompt, gradientType]);

  const handlePresetSelect = useCallback((key: keyof typeof GRADIENT_PRESETS) => {
    const preset = GRADIENT_PRESETS[key];
    setGradient({
      name: preset.name,
      type: 'linear',
      css: preset.css,
      stops: parseStopsFromCss(preset.css),
      angle: 135,
    });
  }, []);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleExport = useCallback(() => {
    if (!gradient) return;

    const content = `/* ${gradient.name || 'Generated Gradient'} */
.gradient {
  background: ${gradient.css};
}

/* Individual stops */
${gradient.stops.map((s, i) => `--color-${i + 1}: ${s.color};`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradient.css';
    a.click();
    URL.revokeObjectURL(url);
  }, [gradient]);

  const quickPrompts = [
    'Vibrant sunset',
    'Cool ocean waves',
    'Northern lights aurora',
    'Elegant gold and purple',
    'Fresh mint and green',
    'Soft peachy dawn',
    'Neon cyberpunk',
    'Deep space cosmic',
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            AI Gradient Generator
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create beautiful CSS gradients from text descriptions
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Input Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Describe Your Gradient
                </Typography>

                {/* Prompt Input */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="e.g., A warm sunset gradient with orange and pink..."
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

                {/* Gradient Type */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Gradient Type</InputLabel>
                  <Select
                    value={gradientType}
                    label="Gradient Type"
                    onChange={(e) => setGradientType(e.target.value as 'linear' | 'radial')}
                  >
                    <MenuItem value="linear">Linear</MenuItem>
                    <MenuItem value="radial">Radial</MenuItem>
                  </Select>
                </FormControl>

                {/* Generate Button */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  startIcon={loading ? undefined : <GradientIcon />}
                >
                  {loading ? 'Generating...' : 'Generate Gradient'}
                </Button>
              </CardContent>
            </Card>

            {/* Presets */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Presets
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(GRADIENT_PRESETS).map(([key, preset]) => (
                    <Grid key={key} size={{ xs: 6, sm: 4 }}>
                      <Paper
                        sx={{
                          height: 80,
                          background: preset.css,
                          borderRadius: 2,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-end',
                          overflow: 'hidden',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.02)',
                          },
                        }}
                        onClick={() => handlePresetSelect(key as keyof typeof GRADIENT_PRESETS)}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            p: 1,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: '#fff' }}>
                            {preset.name}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Preview Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                {gradient ? (
                  <Box>
                    {/* Gradient Info */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{gradient.name || 'Generated Gradient'}</Typography>
                        {gradient.description && (
                          <Typography variant="body2" color="text.secondary">
                            {gradient.description}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Tooltip title="Copy CSS">
                          <IconButton size="small" onClick={() => handleCopy(gradient.css)}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download CSS">
                          <IconButton size="small" onClick={handleExport}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Tags */}
                    {gradient.tags && gradient.tags.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                        {gradient.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" />
                        ))}
                      </Stack>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Preview */}
                    <Paper
                      sx={{
                        height: 200,
                        background: gradient.css,
                        borderRadius: 2,
                        mb: 3,
                      }}
                    />

                    {/* CSS Code */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        CSS
                      </Typography>
                      <Paper
                        sx={{
                          p: 2,
                          backgroundColor: 'grey.900',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: 14,
                          color: 'grey.300',
                          overflow: 'auto',
                        }}
                      >
                        background: {gradient.css};
                      </Paper>
                    </Box>

                    {/* Color Stops */}
                    <Typography variant="subtitle2" gutterBottom>
                      Color Stops
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      {gradient.stops.map((stop, index) => (
                        <Paper
                          key={index}
                          sx={{
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                          }}
                          onClick={() => handleCopy(stop.color)}
                        >
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: 1,
                              backgroundColor: stop.color,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          />
                          <Box>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              {stop.color}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {stop.position}%
                            </Typography>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: 400,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    <GradientIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                    <Typography>Enter a description or select a preset</Typography>
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
        <Snackbar open={!!copied} autoHideDuration={2000}>
          <Alert severity="success" icon={<CopyIcon />}>
            Copied to clipboard
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

/**
 * Parse color stops from CSS gradient string
 */
function parseStopsFromCss(css: string): Array<{ color: string; position: number }> {
  const stops: Array<{ color: string; position: number }> = [];

  // Match color and position pairs
  const regex = /(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\s+(\d+(?:\.\d+)?%?)/g;
  let match;

  while ((match = regex.exec(css)) !== null) {
    let position = parseFloat(match[2]);
    if (!match[2].includes('%')) {
      position = position * 100;
    }
    stops.push({
      color: match[1],
      position,
    });
  }

  return stops;
}
