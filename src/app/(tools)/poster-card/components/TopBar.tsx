/**
 * TopBar - Canva-style top toolbar
 * Canvas size selector, zoom controls, undo/redo, export button
 */

"use client";

import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import Konva from 'konva';
import {
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Dashboard as DashboardIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  NoteAdd as NoteAddIcon,
} from '@mui/icons-material';
import { useEditorStore, clearSavedState } from '../engine/store';
import { useUndoRedo } from '../engine/store/selectors';
import { ASPECT_RATIOS } from '../engine/node-tree/types';
import type { CanvasAspectRatio, CanvasNode } from '../engine/node-tree/types';
import { NewCanvasDialog } from './NewCanvasDialog';

const RATIO_LIST = Object.entries(ASPECT_RATIOS) as [CanvasAspectRatio, (typeof ASPECT_RATIOS)[CanvasAspectRatio]][];

function detectAspectRatio(width: number, height: number): CanvasAspectRatio {
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.01) return '1:1';
  if (Math.abs(ratio - 3 / 4) < 0.01) return '3:4';
  if (Math.abs(ratio - 4 / 3) < 0.01) return '4:3';
  if (Math.abs(ratio - 9 / 16) < 0.01) return '9:16';
  if (Math.abs(ratio - 16 / 9) < 0.01) return '16:9';
  return '3:4';
}

export function TopBar() {
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const exportScale = useEditorStore((s) => s.exportScale);
  const rootNodeId = useEditorStore((s) => s.rootNodeId);
  const nodes = useEditorStore((s) => s.nodes);
  const { canUndo, canRedo } = useUndoRedo();
  const [newCanvasOpen, setNewCanvasOpen] = useState(false);

  const root = rootNodeId ? (nodes[rootNodeId] as CanvasNode | undefined) : undefined;
  const canvasAspectRatio = root ? detectAspectRatio(root.canvasWidth, root.canvasHeight) : '3:4';

  const handleAspectRatioChange = (ratio: CanvasAspectRatio) => {
    const size = ASPECT_RATIOS[ratio];
    const state = useEditorStore.getState();
    // Reinitialize canvas with new dimensions (keeps children)
    if (rootNodeId) {
      state.updateNode(rootNodeId, {
        canvasWidth: size.width,
        canvasHeight: size.height,
        width: size.width,
        height: size.height,
      } as Partial<CanvasNode>);
    }
  };

  const handleExport = () => {
    const stages = Konva.stages;
    if (!stages || stages.length === 0) return;

    const stage = stages[0];
    useEditorStore.getState().clearSelection();

    requestAnimationFrame(() => {
      const dataURL = stage.toDataURL({ pixelRatio: exportScale });
      const link = document.createElement('a');
      link.download = `poster-card-${exportScale}x.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1,
        gap: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        minHeight: 48,
      }}
    >
      {/* Logo */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
        <DashboardIcon sx={{ fontSize: 24, color: 'primary.main' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 15 }}>
          Poster Card
        </Typography>
      </Stack>

      <Divider orientation="vertical" flexItem />

      {/* Canvas Size Chips */}
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'nowrap', overflow: 'hidden' }}>
        {RATIO_LIST.map(([key, val]) => (
          <Chip
            key={key}
            label={key}
            size="small"
            variant={canvasAspectRatio === key ? 'filled' : 'outlined'}
            color={canvasAspectRatio === key ? 'primary' : 'default'}
            onClick={() => handleAspectRatioChange(key)}
            sx={{ fontSize: 11, height: 24 }}
          />
        ))}
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Undo / Redo */}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Tooltip title="Undo (Ctrl+Z)">
          <span>
            <IconButton size="small" onClick={() => useEditorStore.getState().undo()} disabled={!canUndo}>
              <UndoIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo (Ctrl+Shift+Z)">
          <span>
            <IconButton size="small" onClick={() => useEditorStore.getState().redo()} disabled={!canRedo}>
              <RedoIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Divider orientation="vertical" flexItem />

      {/* Zoom Controls */}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Tooltip title="Zoom out">
          <IconButton size="small" onClick={() => setZoom(Math.max(0.1, zoom / 1.15))}>
            <ZoomOutIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" sx={{ minWidth: 42, textAlign: 'center', fontWeight: 600, userSelect: 'none' }}>
          {Math.round(zoom * 100)}%
        </Typography>
        <Tooltip title="Zoom in">
          <IconButton size="small" onClick={() => setZoom(Math.min(3, zoom * 1.15))}>
            <ZoomInIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Chip
          label="Fit"
          size="small"
          variant="outlined"
          onClick={() => setZoom(0.5)}
          sx={{ fontSize: 10, height: 22, ml: 0.5 }}
        />
      </Stack>

      <Box sx={{ flex: 1 }} />

      {/* New Canvas */}
      <Button
        variant="outlined"
        size="small"
        startIcon={<NoteAddIcon sx={{ fontSize: 16 }} />}
        onClick={() => setNewCanvasOpen(true)}
        sx={{ fontSize: 12, textTransform: 'none', borderRadius: 2 }}
      >
        New
      </Button>

      {/* Export */}
      <Button
        variant="contained"
        size="small"
        startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
        onClick={handleExport}
        sx={{ fontSize: 12, textTransform: 'none', borderRadius: 2 }}
      >
        Export PNG
      </Button>

      <NewCanvasDialog
        open={newCanvasOpen}
        onClose={() => setNewCanvasOpen(false)}
        onConfirm={(ratio, bgColor) => {
          const size = ASPECT_RATIOS[ratio];
          useEditorStore.getState().resetAndInitCanvas(size.width, size.height, { type: 'solid', color: bgColor });
          clearSavedState();
          setNewCanvasOpen(false);
        }}
      />
    </Box>
  );
}
