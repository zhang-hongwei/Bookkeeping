'use client';

import {
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useGradientStore } from '../../store/gradient-store';
import { ColourPicker } from '../ColourPicker';
import { randomOklch } from '../../lib/colours/random';

export function ColourPalette() {
  const colours = useGradientStore((s) => s.colours);
  const addColour = useGradientStore((s) => s.addColour);
  const removeColour = useGradientStore((s) => s.removeColour);
  const randomiseColours = useGradientStore((s) => s.randomiseColours);
  const type = useGradientStore((s) => s.type);

  const isMeshMode = type === 'mesh-static' || type === 'mesh-grid';
  const canAddMore = colours.length < 12;
  const canRemove = colours.length > 2;

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          Colors ({colours.length}/12)
        </Typography>
        <Chip
          label="Randomise"
          size="small"
          onClick={randomiseColours}
          sx={{
            fontSize: '0.7rem',
            height: 24,
          }}
        />
      </Box>

      {/* Color list with HEX values and delete buttons */}
      <Stack spacing={1.5}>
        {colours.map((colour, index) => (
          <Box
            key={colour.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {/* Draggable indicator for mesh mode */}
            {isMeshMode && (
              <DragIndicatorIcon
                sx={{
                  fontSize: 16,
                  color: 'text.disabled',
                  cursor: 'grab',
                  '&:active': {
                    cursor: 'grabbing',
                  },
                }}
              />
            )}

            {/* Color preview with picker */}
            <Box sx={{ flex: 0 }}>
              <ColourPicker
                colour={colour}
                canRemove={canRemove}
                onRemove={() => removeColour(colour.id)}
              />
            </Box>

            {/* HEX value display */}
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                color: 'text.disabled',
                flex: 1,
                fontSize: '0.75rem',
              }}
            >
              {colour.hex.toUpperCase()}
            </Typography>

            {/* Delete button */}
            <Box sx={{ flex: '0 0 24px' }}>
              {canRemove ? (
                <IconButton
                  size="small"
                  onClick={() => removeColour(colour.id)}
                  sx={{
                    opacity: 0,
                    '&:hover': {
                      opacity: 1,
                      bgcolor: 'error.dark',
                      color: 'error.main',
                    },
                  }}
                  title="Remove color"
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              ) : (
                <Box sx={{ width: 24 }} />
              )}
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Add Color button */}
      {canAddMore && (
        <Button
          variant="outlined"
          onClick={() => addColour(randomOklch())}
          sx={{
            borderStyle: 'dashed',
            py: 1,
          }}
          startIcon={<Typography sx={{ fontSize: '1.2rem' }}>+</Typography>}
        >
          Add Color
        </Button>
      )}

      {/* Hint for mesh mode */}
      {isMeshMode && (
        <Typography
          variant="caption"
          sx={{
            color: 'text.disabled',
            fontSize: '0.7rem',
          }}
        >
          💡 Drag colors on canvas to reposition
        </Typography>
      )}
    </Stack>
  );
}
