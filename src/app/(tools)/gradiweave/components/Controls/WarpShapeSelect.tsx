'use client';

import {
  Box,
  Typography,
  Select,
  MenuItem,
  ListItemText,
  OutlinedInput,
  Chip,
} from '@mui/material';
import { useGradientStore } from '../../store/gradient-store';
import {
  NOISE_WARP_SHAPES,
  GEOMETRIC_WARP_SHAPES,
  WARP_SHAPE_LABELS,
  type WarpShape,
} from '../../types/gradient';

export function WarpShapeSelect() {
  const warpShape = useGradientStore((s) => s.warpShape);
  const setWarpShape = useGradientStore((s) => s.setWarpShape);

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '0.7rem',
          mb: 1,
          color: 'text.secondary',
        }}
      >
        Warp Shape
      </Typography>
      <Select
        value={warpShape}
        onChange={(e) => setWarpShape(e.target.value as WarpShape)}
        input={
          <OutlinedInput
            size="small"
            sx={{
              fontSize: '0.875rem',
              '& .MuiSelect-select': {
                py: 1,
              },
            }}
          />
        }
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 300,
            },
          },
        }}
      >
        {/* Noise Shapes */}
        <MenuItem disabled sx={{ opacity: 0.6 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
              fontWeight: 500,
              color: 'text.secondary',
            }}
          >
            Noise
          </Typography>
        </MenuItem>
        {NOISE_WARP_SHAPES.map((s) => (
          <MenuItem
            key={s}
            value={s}
            sx={{
              fontSize: '0.875rem',
              py: 1,
            }}
          >
            <ListItemText primary={WARP_SHAPE_LABELS[s]} />
          </MenuItem>
        ))}

        {/* Geometric Shapes */}
        <MenuItem disabled divider sx={{ opacity: 0.6 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
              fontWeight: 500,
              color: 'text.secondary',
            }}
          >
            Geometric
          </Typography>
        </MenuItem>
        {GEOMETRIC_WARP_SHAPES.map((s) => (
          <MenuItem
            key={s}
            value={s}
            sx={{
              fontSize: '0.875rem',
              py: 1,
            }}
          >
            <ListItemText primary={WARP_SHAPE_LABELS[s]} />
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
