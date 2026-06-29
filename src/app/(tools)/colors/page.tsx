'use client';

import { useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { ColorGenerator } from './components/ColorGenerator';
import type { ColorPalette } from '@/types/ai';

export default function ColorsPage() {
  const [generatedPalette, setGeneratedPalette] = useState<ColorPalette | null>(null);

  const handlePaletteGenerated = (palette: ColorPalette) => {
    setGeneratedPalette(palette);
  };

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
            AI Color Palette Generator
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate beautiful color palettes from text descriptions
          </Typography>
        </Box>

        <ColorGenerator
          onPaletteGenerated={handlePaletteGenerated}
          initialPalette={generatedPalette}
        />
      </Container>
    </Box>
  );
}
