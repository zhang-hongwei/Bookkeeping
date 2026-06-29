/**
 * GradiWeave Page - 3 Column Layout
 * Left: Properties | Middle: Preview | Right: Presets & Export
 */

'use client';

import {
  Box,
  Container,
  Typography,
  Stack,
  Divider,
} from '@mui/material';
import { PropertiesPanel } from './components/Panels/PropertiesPanel';
import { PreviewPanel } from './components/Panels/PreviewPanel';
import { PresetsPanel } from './components/Panels/PresetsPanel';

/**
 * GradiWeave main page with 3-column layout
 */
export default function GradiWeavePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: 2,
      }}
    >
      <Container maxWidth="xl" sx={{ height: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          {/* Page header */}
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              GradiWeave
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Interactive mesh gradient editor
            </Typography>
          </Box>

          <Divider sx={{ flexShrink: 0 }} />

          {/* Main editing area - Three column layout */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: '320px 1fr 360px',
              },
              gap: 2,
              flex: 1,
              overflow: 'hidden',
              alignItems: 'start',
            }}
          >
            {/* Left: Properties Panel */}
            <PropertiesPanel />

            {/* Middle: Preview Panel */}
            <PreviewPanel />

            {/* Right: Presets & Export Panel */}
            <PresetsPanel />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
