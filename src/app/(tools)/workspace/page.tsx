/**
 * Palette Workspace Page
 * Manage saved palettes with versioning and comparison
 */

'use client';

import { Box, Container, Typography, Divider, Stack } from '@mui/material';

import { PaletteWorkspace } from '../colors/components/palette-workspace/PaletteWorkspace';

export default function WorkspacePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="xl" sx={{
        padding: ' 0 100px'
      }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Palette Workspace
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage saved palettes with versioning, categorization, and comparison
            </Typography>
          </Box>

          <Divider />

          {/* Content */}
          <PaletteWorkspace />
        </Stack>
      </Container>
    </Box>
  );
}
