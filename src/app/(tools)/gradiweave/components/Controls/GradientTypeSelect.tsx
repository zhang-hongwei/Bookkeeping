'use client';

import {
  Box,
  Typography,
  Select,
  MenuItem,
  OutlinedInput,
  Slider,
  Stack,
} from '@mui/material';
import { useGradientStore } from '../../store/gradient-store';
import {
  GRADIENT_TYPES,
  GRADIENT_TYPE_LABELS,
  SIMPLE_SUBTYPES,
  type GradientType,
  type SimpleGradientSubtype,
} from '../../types/gradient';

export function GradientTypeSelect() {
  const type = useGradientStore((s) => s.type);
  const setType = useGradientStore((s) => s.setType);
  const simpleSubtype = useGradientStore((s) => s.simpleSubtype);
  const setSimpleSubtype = useGradientStore((s) => s.setSimpleSubtype);
  const angle = useGradientStore((s) => s.angle);
  const setAngle = useGradientStore((s) => s.setAngle);

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
        Gradient Type
      </Typography>

      <Select
        value={type}
        onChange={(e) => setType(e.target.value as GradientType)}
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
      >
        {GRADIENT_TYPES.map((t) => (
          <MenuItem
            key={t}
            value={t}
            sx={{
              fontSize: '0.875rem',
              py: 1,
            }}
          >
            {GRADIENT_TYPE_LABELS[t]}
          </MenuItem>
        ))}
      </Select>

      {/* Simple gradient options */}
      {type === 'simple' && (
        <Box
          sx={{
            pl: 2,
            borderLeft: 2,
            borderColor: 'divider',
          }}
        >
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
              >
                Subtype
              </Typography>
              <Select
                value={simpleSubtype}
                onChange={(e) =>
                  setSimpleSubtype(e.target.value as SimpleGradientSubtype)
                }
                input={
                  <OutlinedInput
                    size="small"
                    sx={{
                      fontSize: '0.875rem',
                      textTransform: 'capitalize',
                      '& .MuiSelect-select': {
                        py: 1,
                      },
                    }}
                  />
                }
              >
                {SIMPLE_SUBTYPES.map((st) => (
                  <MenuItem
                    key={st}
                    value={st}
                    sx={{
                      fontSize: '0.875rem',
                      textTransform: 'capitalize',
                      py: 1,
                    }}
                  >
                    {st}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
              >
                Angle: {Math.round(angle)}°
              </Typography>
              <Slider
                value={angle}
                onChange={(_, v) => setAngle(v as number)}
                min={0}
                max={360}
                step={1}
                size="small"
                sx={{
                  height: 4,
                  '& .MuiSlider-thumb': {
                    width: 16,
                    height: 16,
                  },
                }}
              />
            </Box>
          </Stack>
        </Box>
      )}

      {/* Bezier gradient angle control */}
      {(type === 'sharp-bezier' || type === 'soft-bezier') && (
        <Box
          sx={{
            pl: 2,
            borderLeft: 2,
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
          >
            Angle: {Math.round(angle)}°
          </Typography>
          <Slider
            value={angle}
            onChange={(_, v) => setAngle(v as number)}
            min={0}
            max={360}
            step={1}
            size="small"
            sx={{
              height: 4,
              '& .MuiSlider-thumb': {
                width: 16,
                height: 16,
              },
            }}
          />
        </Box>
      )}
    </Stack>
  );
}
