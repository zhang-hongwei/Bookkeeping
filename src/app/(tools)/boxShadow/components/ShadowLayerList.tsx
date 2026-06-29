/**
 * ShadowLayerList Component
 * Shadow layer list management
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Stack,
  Button,
  Typography,
  Box,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DownloadIcon from '@mui/icons-material/Download';
import PresetIcon from '@mui/icons-material/Palette';
import ShadowLayerItem from './ShadowLayerItem';
import { ShadowLayer } from '../types';
import { shadowPresets } from '../presets';

interface ShadowLayerListProps {
  /** Shadow layer list */
  layers: ShadowLayer[];
  /** Add new layer */
  onAddLayer: () => void;
  /** Remove specified layer */
  onRemoveLayer: (id: string) => void;
  /** Update specified layer */
  onUpdateLayer: (id: string, updates: Partial<ShadowLayer>) => void;
  /** Duplicate specified layer */
  onDuplicateLayer: (id: string) => void;
  /** Reset all layers */
  onReset: () => void;
  /** Apply preset */
  onApplyPreset: (presetName: string) => void;
  /** Open export dialog */
  onOpenExport: () => void;
}

/**
 * Shadow layer list component
 */
const ShadowLayerList: React.FC<ShadowLayerListProps> = ({
  layers,
  onAddLayer,
  onRemoveLayer,
  onUpdateLayer,
  onDuplicateLayer,
  onReset,
  onApplyPreset,
  onOpenExport,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(layers[0]?.id || null);
  const [presetMenuAnchor, setPresetMenuAnchor] = useState<null | HTMLElement>(null);

  const handleToggleExpanded = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleOpenPresetMenu = (event: React.MouseEvent<HTMLElement>) => {
    setPresetMenuAnchor(event.currentTarget);
  };

  const handleClosePresetMenu = () => {
    setPresetMenuAnchor(null);
  };

  const handleSelectPreset = (presetName: string) => {
    onApplyPreset(presetName);
    handleClosePresetMenu();
  };

  // Create stable callbacks for each layer to prevent infinite re-renders
  const layerCallbacks = useMemo(() => {
    const callbacks = new Map<string, {
      onUpdate: (updates: Partial<ShadowLayer>) => void;
      onDelete: () => void;
      onDuplicate: () => void;
      onToggleExpanded: () => void;
    }>();

    for (const layer of layers) {
      callbacks.set(layer.id, {
        onUpdate: (updates) => onUpdateLayer(layer.id, updates),
        onDelete: () => onRemoveLayer(layer.id),
        onDuplicate: () => onDuplicateLayer(layer.id),
        onToggleExpanded: () => handleToggleExpanded(layer.id),
      });
    }

    return callbacks;
  }, [layers, onUpdateLayer, onRemoveLayer, onDuplicateLayer, handleToggleExpanded]);

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      {/* Top toolbar */}
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddLayer}
          size="small"
          fullWidth
        >
          Add Layer
        </Button>

      </Stack>


      {/* Layer list */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Stack spacing={1}>
          {layers.map((layer, index) => {
            const callbacks = layerCallbacks.get(layer.id)!;
            return (
              <ShadowLayerItem
                key={layer.id}
                layer={layer}
                index={index + 1}
                expanded={expandedId === layer.id}
                onUpdate={callbacks.onUpdate}
                onDelete={callbacks.onDelete}
                onDuplicate={callbacks.onDuplicate}
                onToggleExpanded={callbacks.onToggleExpanded}
              />
            );
          })}
        </Stack>
      </Box>

      {/* Bottom actions */}
      <Divider />
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={onOpenExport}
          size="small"
          fullWidth
        >
          Export
        </Button>
        <Button
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
          size="small"
          color="error"
        >
          Reset
        </Button>
      </Stack>

      {/* Layer count */}
      <Typography variant="caption" color="text.secondary" textAlign="center">
        {layers.length} layer{layers.length !== 1 ? 's' : ''} total
      </Typography>
    </Stack>
  );
};

export default React.memo(ShadowLayerList);
