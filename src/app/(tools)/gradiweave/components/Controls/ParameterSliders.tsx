'use client';

import {
  Box,
  Slider,
  Typography,
  Tooltip,
  IconButton,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useGradientStore } from '../../store/gradient-store';

interface SliderRowProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
}

function SliderRow({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  tooltip,
}: SliderRowProps) {
  const content = (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.disabled' }}>
          {value.toFixed(2)}
        </Typography>
      </Box>
      <Slider
        value={value}
        onChange={(_, v) => onChange(v as number)}
        min={min}
        max={max}
        step={step}
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
  );

  if (!tooltip) return content;

  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ flex: 1 }}>{content}</Box>
        <InfoIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
      </Box>
    </Tooltip>
  );
}

interface SelectRowProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
}

function SelectRow({ label, value, onChange, options, tooltip }: SelectRowProps) {
  const content = (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        fullWidth
        sx={{
          fontSize: '0.75rem',
          '& .MuiSelect-select': {
            py: 0.75,
          },
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.75rem' }}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );

  if (!tooltip) return content;

  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ flex: 1 }}>{content}</Box>
        <InfoIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
      </Box>
    </Tooltip>
  );
}

export function ParameterSliders() {
  const warp = useGradientStore((s) => s.warp);
  const setWarp = useGradientStore((s) => s.setWarp);
  const warpSize = useGradientStore((s) => s.warpSize);
  const setWarpSize = useGradientStore((s) => s.setWarpSize);
  const noise = useGradientStore((s) => s.noise);
  const setNoise = useGradientStore((s) => s.setNoise);
  const noiseScale = useGradientStore((s) => s.noiseScale);
  const setNoiseScale = useGradientStore((s) => s.setNoiseScale);
  const noiseType = useGradientStore((s) => s.noiseType);
  const setNoiseType = useGradientStore((s) => s.setNoiseType);
  const noiseColorMode = useGradientStore((s) => s.noiseColorMode);
  const setNoiseColorMode = useGradientStore((s) => s.setNoiseColorMode);
  const warpShape = useGradientStore((s) => s.warpShape);

  const isFlat = warpShape === 'flat';

  const noiseTypeOptions = [
    { value: 'value', label: 'Value Noise' },
    { value: 'simplex', label: 'Simplex Noise' },
    { value: 'fbm', label: 'FBM Noise' },
  ];

  const noiseColorModeOptions = [
    { value: 'mono', label: 'Monochrome' },
    { value: 'color', label: 'Color' },
  ];

  return (
    <Stack spacing={2}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '0.7rem',
        }}
      >
        Parameters
      </Typography>

      <Box sx={{ opacity: isFlat ? 0.4 : 1, pointerEvents: isFlat ? 'none' : 'auto' }}>
        <SliderRow
          label="Warp Intensity"
          value={warp}
          onChange={setWarp}
          tooltip="Controls the intensity of the warp distortion effect. Higher values create more dramatic shape distortion."
        />
      </Box>

      <Box sx={{ opacity: isFlat ? 0.4 : 1, pointerEvents: isFlat ? 'none' : 'auto' }}>
        <SliderRow
          label="Warp Scale"
          value={warpSize}
          onChange={setWarpSize}
          tooltip="Adjusts the scale/frequency of the warp pattern. Lower values = larger, smoother waves; Higher values = smaller, more detailed patterns."
        />
      </Box>

      <SliderRow
        label="Noise Intensity"
        value={noise}
        onChange={setNoise}
        tooltip="Adds professional film grain texture. Higher values create more visible grain."
      />

      <SliderRow
        label="Noise Scale"
        value={noiseScale}
        onChange={setNoiseScale}
        min={0.1}
        max={2}
        step={0.1}
        tooltip="Controls grain size. Lower values = finer grain; Higher values = coarser, more visible particles."
      />

      <SelectRow
        label="Noise Type"
        value={noiseType}
        onChange={setNoiseType}
        options={noiseTypeOptions}
        tooltip="Choose the noise algorithm. Value = smooth classic grain; Simplex = organic variation; FBM = layered detail."
      />

      <SelectRow
        label="Noise Color"
        value={noiseColorMode}
        onChange={setNoiseColorMode}
        options={noiseColorModeOptions}
        tooltip="Monochrome = same grain on all channels (subtle); Color = independent grain per channel (more textured)."
      />
    </Stack>
  );
}
