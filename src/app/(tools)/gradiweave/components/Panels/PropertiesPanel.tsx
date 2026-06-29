'use client';

import { Paper, Box, Stack, Typography } from '@mui/material';
import { GradientTypeSelect } from '../Controls/GradientTypeSelect';
import { WarpShapeSelect } from '../Controls/WarpShapeSelect';
import { DimensionInputs } from '../Controls/DimensionInputs';
import { ParameterSliders } from '../Controls/ParameterSliders';
import { ColourPalette } from '../Controls/ColourPalette';

export function PropertiesPanel() {
  return (
    <Paper
      elevation={2}
      sx={{
        height: { lg: 'calc(100vh - 140px)' },
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight="bold" textTransform="uppercase" fontSize="0.75rem" letterSpacing="0.1em">
          Properties
        </Typography>
      </Box>
      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        <Stack spacing={3}>
          <GradientTypeSelect />
          <WarpShapeSelect />
          <DimensionInputs />
          <ParameterSliders />
          <ColourPalette />
        </Stack>
      </Box>
    </Paper>
  );
}
