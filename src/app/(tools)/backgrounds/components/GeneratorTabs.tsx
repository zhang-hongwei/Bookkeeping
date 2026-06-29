/**
 * Generator Tabs Component
 * Vertical type selector for background generators
 */

'use client';

import React from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Gradient as GradientIcon,
  Grain as GrainIcon,
  Terrain as TerrainIcon,
  ChangeHistory as TriangleIcon,
  PhotoCamera as PhotoIcon,
  Waves as WaveIcon,
} from '@mui/icons-material';
import type { BackgroundGeneratorType } from '../types';
import { useBackgroundsStore } from '../store/backgroundsStore';
import { getAllBackgroundGenerators } from '../generators/BaseBackgroundGenerator';

const iconMap: Record<string, React.ReactElement> = {
  gradient: <GradientIcon />,
  particles: <GrainIcon />,
  topography: <TerrainIcon />,
  trianglify: <TriangleIcon />,
  unsplash: <PhotoIcon />,
  wave: <WaveIcon />,
};

export function GeneratorTabs() {
  const theme = useTheme();
  const generatorType = useBackgroundsStore((s) => s.generatorType);
  const setGeneratorType = useBackgroundsStore((s) => s.setGeneratorType);

  const generators = getAllBackgroundGenerators();

  const handleChange = (_event: React.SyntheticEvent, newValue: BackgroundGeneratorType) => {
    setGeneratorType(newValue);
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
        Background Type
      </Typography>
      <Tabs
        value={generatorType}
        onChange={handleChange}
        orientation="vertical"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderRight: 1,
          borderColor: 'divider',
          minHeight: 'auto',
          '& .MuiTabs-indicator': {
            left: 0,
            right: 'auto',
            width: 3,
            backgroundColor: theme.palette.primary.main,
          },
          '& .MuiTab-root': {
            minHeight: 44,
            minWidth: 'auto',
            px: 1.5,
            py: 1,
            justifyContent: 'flex-start',
            textTransform: 'none',
            gap: 1,
          },
        }}
      >
        {generators.map((gen) => (
          <Tab
            key={gen.type}
            value={gen.type}
            icon={iconMap[gen.type] || <GradientIcon />}
            iconPosition="start"
            label={gen.name}
            sx={{
              fontWeight: generatorType === gen.type ? 600 : 400,
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
}
