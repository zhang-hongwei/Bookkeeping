'use client';

import { useState, useCallback } from 'react';
import { Box, Typography, Chip, Stack, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Add as AddIcon, Check as ApplyIcon } from '@mui/icons-material';
import { AssetSearchBar } from './AssetSearchBar';
import { useFontAssets, useFontLoaded, useAssetPanelMode } from '../../engine/assets/selectors';
import { useAssetStore } from '../../engine/assets/asset-store';
import { useEditorStore } from '../../engine/store';
import { createMatrix } from '../../engine/matrix-utils';
import { UpdateNodeCommand } from '../../engine/commands/commands/update-node';
import type { FontAsset } from '../../engine/assets/types';

const FONT_CATEGORIES = ['all', 'sans-serif', 'serif', 'display', 'handwriting', 'monospace'] as const;

export function FontAssetPanel() {
  const fonts = useFontAssets();
  const addNode = useEditorStore((s) => s.addNode);
  const rootNodeId = useEditorStore((s) => s.rootNodeId);
  const nodes = useEditorStore((s) => s.nodes);
  const panelMode = useAssetPanelMode();
  const root = rootNodeId ? (nodes[rootNodeId] as any) : undefined;
  const size = root ? { width: root.canvasWidth, height: root.canvasHeight } : { width: 1080, height: 1440 };
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [previewText, setPreviewText] = useState('Hello World');

  const filteredFonts = fonts.filter((f) => {
    if (category !== 'all' && f.category !== category) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAddText = useCallback((font: FontAsset) => {
    // Replace mode: update selected text node's font
    if (panelMode.mode === 'replace' && panelMode.selectedNodeId) {
      const state = useEditorStore.getState();
      const node = state.nodes[panelMode.selectedNodeId];
      if (node?.type === 'text') {
        state.execute(
          new UpdateNodeCommand(
            panelMode.selectedNodeId,
            { fontFamily: (node as any).fontFamily, fontAssetId: (node as any).fontAssetId } as any,
            { fontFamily: font.fontFamily, fontAssetId: font.id } as any,
            `Apply font: ${font.name}`,
          ),
        );
        return;
      }
    }

    // Insert mode: add new text node
    const w = 500;
    const h = 80;
    addNode({
      type: 'text',
      parentId: rootNodeId!,
      childrenIds: [],
      localMatrix: createMatrix({
        x: (size.width - w) / 2,
        y: (size.height - h) / 2,
      }),
      width: w,
      height: h,
      opacity: 100,
      visible: true,
      locked: false,
      content: previewText || 'Text',
      fontFamily: font.fontFamily,
      fontAssetId: font.id,
      fontSize: 32,
      fontWeight: 400,
      color: '#000000',
      textAlign: 'center',
      lineHeight: 1.4,
      letterSpacing: 0,
      backgroundColor: '',
      padding: 8,
    });
  }, [addNode, rootNodeId, size, previewText, panelMode]);

  return (
    <Box>
      <AssetSearchBar onSearch={setSearch} placeholder="Search fonts..." />

      <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
        {FONT_CATEGORIES.map((cat) => (
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

      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Preview</Typography>
        <input
          type="text"
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          placeholder="Preview text..."
          style={{
            width: '100%', fontSize: 12, padding: '4px 8px',
            border: '1px solid #ddd', borderRadius: 4, outline: 'none',
          }}
        />
      </Box>

      <Stack spacing={0.5}>
        {filteredFonts.map((font) => (
          <FontAssetItem key={font.id} font={font} previewText={previewText} onAdd={handleAddText} mode={panelMode.mode} />
        ))}
        {filteredFonts.length === 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No fonts found.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

function FontAssetItem({
  font,
  previewText,
  onAdd,
  mode,
}: {
  font: FontAsset;
  previewText: string;
  onAdd: (font: FontAsset) => void;
  mode: 'insert' | 'replace';
}) {
  const isLoaded = useFontLoaded(font.fontFamily);
  const loadFont = useAssetStore((s) => s.loadFont);

  const handleClick = useCallback(() => {
    if (!isLoaded) {
      loadFont(font.id);
    }
    onAdd(font);
  }, [font, isLoaded, loadFont, onAdd]);

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1,
        py: 0.75,
        borderRadius: 1,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
          {font.name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontFamily: font.fontFamily,
            fontSize: 14,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            opacity: isLoaded ? 1 : 0.5,
          }}
        >
          {previewText || 'Sample Text'}
        </Typography>
      </Box>
      {!isLoaded && <CircularProgress size={14} />}
      <Tooltip title={mode === 'replace' ? 'Apply font' : 'Add text to canvas'}>
        <IconButton size="small" sx={{ flexShrink: 0 }}>
          {mode === 'replace' ? <ApplyIcon sx={{ fontSize: 14 }} /> : <AddIcon sx={{ fontSize: 14 }} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
