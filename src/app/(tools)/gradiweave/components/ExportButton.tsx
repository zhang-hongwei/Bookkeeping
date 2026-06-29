'use client';

import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  OutlinedInput,
  Stack,
} from '@mui/material';
import { useGradientStore } from '../store/gradient-store';
import { useExport } from '../hooks/useExport';
import type { PixelDensity } from '../types/gradient';

const DENSITIES: PixelDensity[] = [1, 2, 3, 4];

export function ExportButton() {
  const pixelDensity = useGradientStore((s) => s.pixelDensity);
  const setPixelDensity = useGradientStore((s) => s.setPixelDensity);
  const width = useGradientStore((s) => s.width);
  const height = useGradientStore((s) => s.height);
  const { exportGradient, exporting } = useExport();

  const exportW = width * pixelDensity;
  const exportH = height * pixelDensity;

  return (
    <Stack spacing={2}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '0.7rem',
          color: 'text.secondary',
        }}
      >
        Export
      </Typography>

      <Stack direction="row" spacing={1}>
        <Select
          value={String(pixelDensity)}
          onChange={(e) => setPixelDensity(Number(e.target.value) as PixelDensity)}
          input={
            <OutlinedInput
              size="small"
              sx={{
                fontSize: '0.875rem',
                minWidth: 70,
                '& .MuiSelect-select': {
                  py: 1,
                },
              }}
            />
          }
        >
          {DENSITIES.map((d) => (
            <MenuItem
              key={d}
              value={String(d)}
              sx={{
                fontSize: '0.875rem',
                py: 1,
              }}
            >
              {d}x
            </MenuItem>
          ))}
        </Select>

        <Button
          variant="contained"
          onClick={exportGradient}
          disabled={exporting}
          sx={{ flex: 1 }}
        >
          {exporting ? 'Exporting...' : 'Download PNG'}
        </Button>
      </Stack>

      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {exportW} × {exportH} px
      </Typography>
    </Stack>
  );
}
