'use client';

import { useState, useCallback } from 'react';
import { Box, Typography, Chip, Stack, Button } from '@mui/material';
import {
  CropSquare as RectIcon,
  Circle as CircleIcon,
  Remove as LineIcon,
} from '@mui/icons-material';
import { AssetSearchBar } from './AssetSearchBar';
import { useShapeAssets, useAssetPanelMode } from '../../engine/assets/selectors';
import { useAssetDrag } from '../../engine/assets/use-asset-drag';
import { useEditorStore } from '../../engine/store';
import { createMatrix } from '../../engine/matrix-utils';
import { UpdateNodeCommand } from '../../engine/commands/commands/update-node';
import type { ShapeAsset } from '../../engine/assets/types';

const SHAPE_CATEGORIES = ['all', 'basic', 'arrow', 'decoration', 'icon'] as const;

const OVERLAY_TOOLS: { label: string; action: (rootNodeId: string, addNode: any) => void }[] = [
  {
    label: 'Scanlines',
    action: (rootId, addNode) =>
      addNode({ type: 'decorative', parentId: rootId, childrenIds: [], localMatrix: createMatrix({ x: 0, y: 0 }), width: 1080, height: 1080, opacity: 15, visible: true, locked: false, decorativeType: 'scanlines', color: '#000000', strokeWidth: 1, spacing: 4 }),
  },
  {
    label: 'Dots',
    action: (rootId, addNode) =>
      addNode({ type: 'decorative', parentId: rootId, childrenIds: [], localMatrix: createMatrix({ x: 0, y: 0 }), width: 1080, height: 1080, opacity: 15, visible: true, locked: false, decorativeType: 'dots', color: '#000000', strokeWidth: 1, spacing: 20 }),
  },
  {
    label: 'Grid',
    action: (rootId, addNode) =>
      addNode({ type: 'decorative', parentId: rootId, childrenIds: [], localMatrix: createMatrix({ x: 0, y: 0 }), width: 1080, height: 1080, opacity: 15, visible: true, locked: false, decorativeType: 'grid', color: '#000000', strokeWidth: 1, spacing: 40 }),
  },
  {
    label: 'Border',
    action: (rootId, addNode) =>
      addNode({ type: 'decorative', parentId: rootId, childrenIds: [], localMatrix: createMatrix({ x: 0, y: 0 }), width: 1080, height: 1080, opacity: 100, visible: true, locked: false, decorativeType: 'border', color: '#000000', strokeWidth: 2, spacing: 20 }),
  },
];

export function ShapeAssetPanel() {
  const shapes = useShapeAssets();
  const addNode = useEditorStore((s) => s.addNode);
  const rootNodeId = useEditorStore((s) => s.rootNodeId);
  const panelMode = useAssetPanelMode();
  const { onDragStart } = useAssetDrag();
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredShapes = shapes.filter((s) => {
    if (category !== 'all' && s.category !== category) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAddShape = useCallback((shape: ShapeAsset) => {
    if (panelMode.mode === 'replace' && panelMode.selectedNodeId) {
      const state = useEditorStore.getState();
      const node = state.nodes[panelMode.selectedNodeId];
      if (node?.type === 'shape') {
        state.execute(
          new UpdateNodeCommand(
            panelMode.selectedNodeId,
            { assetId: (node as any).assetId, svgContent: (node as any).svgContent } as any,
            { assetId: shape.id, svgContent: shape.svgContent } as any,
            `Replace shape: ${shape.name}`,
          ),
        );
        return;
      }
    }

    const cx = 400;
    const cy = 400;
    addNode({
      type: 'shape',
      parentId: rootNodeId!,
      childrenIds: [],
      localMatrix: createMatrix({ x: cx, y: cy }),
      width: 100,
      height: 100,
      opacity: 100,
      visible: true,
      locked: false,
      shapeType: 'svg',
      assetId: shape.id,
      svgContent: shape.svgContent,
      fill: shape.defaultFill ?? '#e0e0e0',
      stroke: shape.defaultStroke ?? '#999999',
      strokeWidth: 1,
      borderRadius: 0,
    });
  }, [addNode, rootNodeId, panelMode]);

  const handleAddBasicShape = useCallback((shapeType: 'rectangle' | 'circle' | 'line') => {
    const cx = 400;
    const cy = 400;
    const defaults: Record<string, Partial<any>> = {
      rectangle: { width: 200, height: 150, fill: '#e0e0e0', stroke: '#999999', strokeWidth: 1, borderRadius: 4 },
      circle: { width: 150, height: 150, fill: '#e0e0e0', stroke: '#999999', strokeWidth: 1, borderRadius: 0 },
      line: { width: 300, height: 1, fill: 'transparent', stroke: '#333333', strokeWidth: 2, borderRadius: 0 },
    };
    const d = defaults[shapeType];
    addNode({
      type: 'shape', parentId: rootNodeId!, childrenIds: [],
      localMatrix: createMatrix({ x: cx, y: cy }),
      width: d.width, height: d.height, opacity: 100, visible: true, locked: false,
      shapeType, fill: d.fill, stroke: d.stroke, strokeWidth: d.strokeWidth, borderRadius: d.borderRadius,
    });
  }, [addNode, rootNodeId]);

  return (
    <Box>
      {/* Basic shapes */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Basic
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}>
        {([
          { icon: RectIcon, label: 'Rectangle', action: () => handleAddBasicShape('rectangle') },
          { icon: CircleIcon, label: 'Circle', action: () => handleAddBasicShape('circle') },
          { icon: LineIcon, label: 'Line', action: () => handleAddBasicShape('line') },
        ] as const).map((tool) => {
          const Icon = tool.icon;
          return (
            <Box
              key={tool.label}
              onClick={tool.action}
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                p: 1, borderRadius: 1, cursor: 'pointer', bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected' },
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
              <Typography variant="caption" sx={{ fontSize: 10 }}>{tool.label}</Typography>
            </Box>
          );
        })}
      </Box>

      {/* Overlays */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Overlays
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
        {OVERLAY_TOOLS.map((item) => (
          <Button
            key={item.label}
            variant="outlined"
            size="small"
            onClick={() => item.action(rootNodeId!, addNode)}
            sx={{ fontSize: 11, textTransform: 'none' }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      {/* SVG shapes */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Shapes
      </Typography>

      <AssetSearchBar onSearch={setSearch} placeholder="Search shapes..." />

      <Stack direction="row" spacing={0.5} sx={{ my: 1, flexWrap: 'wrap', gap: 0.5 }}>
        {SHAPE_CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            size="small"
            variant={category === cat ? 'filled' : 'outlined'}
            color={category === cat ? 'primary' : 'default'}
            onClick={() => setCategory(cat)}
            sx={{ fontSize: 10, height: 22 }}
          />
        ))}
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
        {filteredShapes.map((shape) => (
          <Box
            key={shape.id}
            onClick={() => handleAddShape(shape)}
            draggable
            onDragStart={(e) => onDragStart(e, {
              assetType: 'shape',
              assetId: shape.id,
              svgContent: shape.svgContent,
              viewBox: shape.viewBox,
              defaultFill: shape.defaultFill,
              defaultStroke: shape.defaultStroke,
            })}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              aspectRatio: '1',
              borderRadius: 1,
              cursor: 'pointer',
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected', outline: '2px solid', outlineColor: 'primary.main' },
            }}
          >
            <svg
              viewBox={shape.viewBox}
              style={{ width: '70%', height: '70%' }}
              dangerouslySetInnerHTML={{ __html: shape.svgContent }}
            />
          </Box>
        ))}
      </Box>

      {filteredShapes.length === 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 3 }}>
          No shapes found.
        </Typography>
      )}
    </Box>
  );
}
