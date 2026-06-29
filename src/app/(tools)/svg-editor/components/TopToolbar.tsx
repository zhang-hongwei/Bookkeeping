'use client';

import { useCallback, useRef } from 'react';
import {
  Toolbar,
  IconButton,
  Tooltip,
  Divider,
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
} from '@mui/material';
import {
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ZoomOutMap as ZoomFitIcon,
  Add as NewIcon,
  FileOpen as OpenIcon,
  SaveAlt as ExportIcon,
  GridOn as GridIcon,
  GridOff as GridOffIcon,
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  ContentCut as CutIcon,
  ContentPaste as PasteIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSvgEditorStore } from '../store/svgEditorStore';
import { parseSvgString } from '../lib/svg-parser';

export default function TopToolbar() {
  const zoom = useSvgEditorStore((s) => s.viewport.zoom);
  const showGrid = useSvgEditorStore((s) => s.showGrid);
  const showCodePanel = useSvgEditorStore((s) => s.showCodePanel);
  const selection = useSvgEditorStore((s) => s.selection);

  const newDocument = useSvgEditorStore((s) => s.newDocument);
  const importSvg = useSvgEditorStore((s) => s.importSvg);
  const getSvgString = useSvgEditorStore((s) => s.getSvgString);
  const undo = useSvgEditorStore((s) => s.undo);
  const redo = useSvgEditorStore((s) => s.redo);
  const zoomIn = useSvgEditorStore((s) => s.zoomIn);
  const zoomOut = useSvgEditorStore((s) => s.zoomOut);
  const zoomToFitIn = useSvgEditorStore((s) => s.zoomToFitIn);
  const toggleGrid = useSvgEditorStore((s) => s.toggleGrid);
  const toggleCodePanel = useSvgEditorStore((s) => s.toggleCodePanel);
  const copySelection = useSvgEditorStore((s) => s.copySelection);
  const pasteClipboard = useSvgEditorStore((s) => s.pasteClipboard);
  const cutSelection = useSvgEditorStore((s) => s.cutSelection);
  const removeElements = useSvgEditorStore((s) => s.removeElements);
  const pushHistory = useSvgEditorStore((s) => s.pushHistory);

  const canUndo = useSvgEditorStore((s) => s.historyIndex > 0);
  const canRedo = useSvgEditorStore((s) => s.historyIndex < s.history.length - 1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpen = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        try {
          importSvg(content);
          pushHistory('Import SVG');
        } catch (err) {
          console.error('Failed to import SVG:', err);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [importSvg, pushHistory],
  );

  const handleExport = useCallback(() => {
    const svgString = getSvgString();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'icon.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [getSvgString]);

  const handleNew = useCallback(() => {
    newDocument(800, 600);
  }, [newDocument]);

  return (
    <Toolbar variant="dense" sx={{ borderBottom: 1, borderColor: 'divider', gap: 0.5, px: 1 }}>
      {/* File operations */}
      <Tooltip title="New (800×600)" arrow>
        <IconButton size="small" onClick={handleNew}>
          <NewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Open SVG" arrow>
        <IconButton size="small" onClick={handleOpen}>
          <OpenIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Tooltip title="Export SVG" arrow>
        <IconButton size="small" onClick={handleExport}>
          <ExportIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Edit operations */}
      <Tooltip title="Undo (Ctrl+Z)" arrow>
        <span>
          <IconButton size="small" onClick={undo} disabled={!canUndo}>
            <UndoIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Redo (Ctrl+Y)" arrow>
        <span>
          <IconButton size="small" onClick={redo} disabled={!canRedo}>
            <RedoIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Copy" arrow>
        <span>
          <IconButton size="small" onClick={copySelection} disabled={selection.elementIds.length === 0}>
            <CopyIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Cut" arrow>
        <span>
          <IconButton size="small" onClick={cutSelection} disabled={selection.elementIds.length === 0}>
            <CutIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Paste" arrow>
        <IconButton size="small" onClick={pasteClipboard}>
          <PasteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete" arrow>
        <span>
          <IconButton
            size="small"
            onClick={() => {
              removeElements(selection.elementIds);
            }}
            disabled={selection.elementIds.length === 0}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Box sx={{ flex: 1 }} />

      {/* View operations */}
      <Tooltip title="Zoom Out" arrow>
        <IconButton size="small" onClick={zoomOut}>
          <ZoomOutIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Typography variant="caption" sx={{ minWidth: 48, textAlign: 'center', userSelect: 'none' }}>
        {Math.round(zoom * 100)}%
      </Typography>
      <Tooltip title="Zoom In" arrow>
        <IconButton size="small" onClick={zoomIn}>
          <ZoomInIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Zoom to Fit" arrow>
        <IconButton
          size="small"
          onClick={() => {
            // Use window dimensions as approximate container size
            const container = document.querySelector('[data-svg-canvas]');
            const rect = container?.getBoundingClientRect();
            if (rect) {
              zoomToFitIn(rect.width, rect.height);
            } else {
              zoomToFitIn(window.innerWidth * 0.6, window.innerHeight - 100);
            }
          }}
        >
          <ZoomFitIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title={showGrid ? 'Hide Grid' : 'Show Grid'} arrow>
        <IconButton size="small" onClick={toggleGrid}>
          {showGrid ? <GridIcon fontSize="small" /> : <GridOffIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
      <Tooltip title={showCodePanel ? 'Hide Code' : 'Show Code'} arrow>
        <IconButton
          size="small"
          onClick={toggleCodePanel}
          color={showCodePanel ? 'primary' : 'default'}
        >
          <CodeIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}
