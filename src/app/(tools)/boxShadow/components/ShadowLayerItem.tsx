/**
 * ShadowLayerItem Component
 * Single shadow layer edit panel
 */

'use client';

import React, { useCallback } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  TextField,
  Slider,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ColorInput from '@/features/mui-theme-creator/components/ColorInput';
import OffsetControl from './OffsetControl';
import { ShadowLayer } from '../types';

interface ShadowLayerItemProps {
  /** Shadow layer data */
  layer: ShadowLayer;
  /** Layer index (starting from 1) */
  index: number;
  /** Whether expanded */
  expanded: boolean;
  /** Update layer data */
  onUpdate: (updates: Partial<ShadowLayer>) => void;
  /** Delete layer */
  onDelete: () => void;
  /** Duplicate layer */
  onDuplicate: () => void;
  /** Toggle expanded state */
  onToggleExpanded: () => void;
}

/**
 * Single shadow layer edit panel component
 */
const ShadowLayerItem: React.FC<ShadowLayerItemProps> = ({
  layer,
  index,
  expanded,
  onUpdate,
  onDelete,
  onDuplicate,
  onToggleExpanded,
}) => {
  // Performance: Cache high-frequency callbacks with useCallback
  const handleSliderChange = useCallback((field: keyof ShadowLayer) => (_: Event, value: number | number[]) => {
    onUpdate({ [field]: value as number });
  }, [onUpdate]);

  const handleNumberInputChange = useCallback((field: keyof ShadowLayer) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      onUpdate({ [field]: value });
    }
  }, [onUpdate]);

  const handleColorChange = useCallback((color: string) => {
    onUpdate({ color });
  }, [onUpdate]);

  const handleInsetToggle = useCallback(() => {
    onUpdate({ inset: !layer.inset });
  }, [onUpdate, layer.inset]);

  const handleEnabledToggle = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onUpdate({ enabled: !layer.enabled });
  }, [onUpdate, layer.enabled]);

  const handleOffsetChange = useCallback((offsetX: number, offsetY: number) => {
    onUpdate({ offsetX, offsetY });
  }, [onUpdate]);

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggleExpanded}
      sx={{
        opacity: layer.enabled ? 1 : 0.6,
        '&:before': {
          display: 'none',
        }
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ width: '100%', pr: 1 }}
        >
          {/* Enable/disable icon - use Box to avoid button nesting */}
          <Box
            onClick={handleEnabledToggle}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              cursor: 'pointer',
              color: layer.enabled ? 'primary.main' : 'action.active',
              '&:hover': {
                backgroundColor: 'action.hover',
              },


            }}
            title={layer.enabled ? 'Hide this layer' : 'Show this layer'}
          >
            {layer.enabled ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
          </Box>

          {/* Layer name */}
          <Typography sx={{ flex: 1 }}>
            Layer {index} {layer.inset && '(Inset)'}
          </Typography>

          {/* Quick action buttons - use Box to avoid button nesting */}
          <Box
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'action.active',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            title="Duplicate this layer"
          >
            <ContentCopyIcon fontSize="small" />
          </Box>
          <Box
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.lighter',
              },
            }}
            title="Delete this layer"
          >
            <DeleteIcon fontSize="small" />
          </Box>
        </Stack>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={3}>
          {/* Inset switch */}
          <FormControlLabel
            control={
              <Switch
                checked={layer.inset}
                onChange={handleInsetToggle}
              />
            }
            label="Inset (Inner Shadow)"
          />
          {/* Visual offset controller */}
          <OffsetControl
            offsetX={layer.offsetX}
            offsetY={layer.offsetY}
            min={-40}
            max={40}
            onChange={handleOffsetChange}
          />

          {/* Blur radius */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Blur Radius (px)
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Slider
                value={layer.blur}
                onChange={handleSliderChange('blur')}
                min={0}
                max={100}
                sx={{ flex: 1 }}
              />
              <TextField
                value={layer.blur}
                onChange={handleNumberInputChange('blur')}
                type="number"
                size="small"
                sx={{ width: 80 }}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">px</InputAdornment>,
                  },
                }}
              />
            </Stack>
          </Box>

          {/* Spread radius */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Spread Radius (px)
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Slider
                value={layer.spread}
                onChange={handleSliderChange('spread')}
                min={-50}
                max={50}
                sx={{ flex: 1 }}
              />
              <TextField
                value={layer.spread}
                onChange={handleNumberInputChange('spread')}
                type="number"
                size="small"
                sx={{ width: 80 }}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">px</InputAdornment>,
                  },
                }}
              />
            </Stack>
          </Box>

          {/* Opacity */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Opacity
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Slider
                value={layer.opacity}
                onChange={handleSliderChange('opacity')}
                min={0}
                max={1}
                step={0.01}
                sx={{ flex: 1 }}
              />
              <TextField
                value={layer.opacity}
                onChange={handleNumberInputChange('opacity')}
                type="number"
                size="small"
                slotProps={{
                  htmlInput: { step: 0.01, min: 0, max: 1 },
                }}
                sx={{ width: 80 }}
              />
            </Stack>
          </Box>

          {/* Color selection */}
          <Box>
            <ColorInput
              label="Shadow Color"
              color={layer.color}
              onColorChange={handleColorChange}
            />
          </Box>


        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(ShadowLayerItem);
