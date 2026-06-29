'use client';

import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import { AutoAwesomeOutlined } from '@mui/icons-material';

import { useEmotionalPaletteStore } from './store/emotionalPaletteStore';
import { MoodInput } from './components/MoodInput';
import { AtmospherePreview } from './components/AtmospherePreview';
import { MotionPreview } from './components/MotionPreview';
import { TypographyPreview } from './components/TypographyPreview';
import { ExportPanel } from './components/ExportPanel';

export default function EmotionalPalettePage() {
  const { palette, isGenerating, error, gradientIndex, setGradientIndex } =
    useEmotionalPaletteStore();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AutoAwesomeOutlined sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h3" component="h1">
                Emotional Palette
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                One keyword → complete emotional atmosphere (colors, gradients, motion, typography)
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Main Layout */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '280px 1fr 300px' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            {/* Left Panel: Input */}
            <Paper elevation={2} sx={{ p: 2.5, position: { lg: 'sticky' }, top: 24 }}>
              <MoodInput />
            </Paper>

            {/* Center: Atmosphere Preview */}
            <Paper elevation={2} sx={{ p: 3, minHeight: 500 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <AtmospherePreview
                palette={palette}
                gradientIndex={gradientIndex}
                isLoading={isGenerating}
              />

              {/* Gradient Selector */}
              {palette && palette.gradients.length > 1 && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                    Gradient:
                  </Typography>
                  {palette.gradients.map((g, i) => (
                    <Chip
                      key={g.name}
                      label={g.name}
                      size="small"
                      variant={gradientIndex === i ? 'filled' : 'outlined'}
                      color={gradientIndex === i ? 'primary' : 'default'}
                      onClick={() => setGradientIndex(i)}
                      sx={{
                        fontSize: 11,
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Paper>

            {/* Right Panel: Details + Export */}
            <Stack spacing={2} sx={{ position: { lg: 'sticky' }, top: 24 }}>
              {palette ? (
                <>
                  <MotionPreview motion={palette.motion} />
                  <TypographyPreview
                    typography={palette.typography}
                    accentColor={palette.colors[0]?.hex || '#667eea'}
                  />
                  <ExportPanel palette={palette} />
                </>
              ) : (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Generate a palette to see motion, typography, and export options
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
