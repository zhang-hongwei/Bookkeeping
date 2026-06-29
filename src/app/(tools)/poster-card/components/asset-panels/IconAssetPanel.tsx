'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Typography, Chip, Stack, CircularProgress } from '@mui/material';
import { AssetSearchBar } from './AssetSearchBar';
import { useIconAssets, useAssetPanelMode } from '../../engine/assets/selectors';
import { useAssetDrag } from '../../engine/assets/use-asset-drag';
import { useEditorStore } from '../../engine/store';
import { createMatrix } from '../../engine/matrix-utils';
import { UpdateNodeCommand } from '../../engine/commands/commands/update-node';
import { ICONPARK_CATEGORIES, loadIconParkCategory } from '../../engine/assets/iconpark';
import type { ShapeAsset } from '../../engine/assets/types';

const PRESETS_TAG = '__presets__';

export function IconAssetPanel() {
  const presetIcons = useIconAssets();
  const addNode = useEditorStore((s) => s.addNode);
  const rootNodeId = useEditorStore((s) => s.rootNodeId);
  const panelMode = useAssetPanelMode();
  const { onDragStart } = useAssetDrag();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loadedIcons, setLoadedIcons] = useState<ShapeAsset[]>([]);
  const [loading, setLoading] = useState(false);

  const sortedCategories = useMemo(
    () => [...ICONPARK_CATEGORIES].sort((a, b) => b.count - a.count),
    [],
  );

  // Load icons when category changes
  useEffect(() => {
    if (!selectedCategory || selectedCategory === PRESETS_TAG) {
      setLoadedIcons([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    loadIconParkCategory(selectedCategory)
      .then((icons) => {
        if (!cancelled) {
          setLoadedIcons(icons);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedCategory]);

  const displayIcons = useMemo(() => {
    if (selectedCategory === PRESETS_TAG) {
      return presetIcons.filter((i) => !i.id.startsWith('iconpark-'));
    }
    if (search && selectedCategory === null) {
      return presetIcons.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (search && loadedIcons.length > 0) {
      return loadedIcons.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return loadedIcons;
  }, [selectedCategory, presetIcons, loadedIcons, search]);

  const handleAddIcon = useCallback(
    (icon: ShapeAsset) => {
      if (panelMode.mode === 'replace' && panelMode.selectedNodeId) {
        const state = useEditorStore.getState();
        const node = state.nodes[panelMode.selectedNodeId];
        if (node?.type === 'shape') {
          state.execute(
            new UpdateNodeCommand(
              panelMode.selectedNodeId,
              { assetId: (node as any).assetId, svgContent: (node as any).svgContent } as any,
              { assetId: icon.id, svgContent: icon.svgContent } as any,
              `Replace icon: ${icon.name}`,
            ),
          );
          return;
        }
      }

      addNode({
        type: 'shape',
        parentId: rootNodeId!,
        childrenIds: [],
        localMatrix: createMatrix({ x: 400, y: 400 }),
        width: 80,
        height: 80,
        opacity: 100,
        visible: true,
        locked: false,
        shapeType: 'svg',
        assetId: icon.id,
        svgContent: icon.svgContent,
        fill: icon.defaultFill ?? '#333333',
        stroke: icon.defaultStroke ?? 'none',
        strokeWidth: 1,
        borderRadius: 0,
      });
    },
    [addNode, rootNodeId, panelMode],
  );

  // ── Category overview ──
  if (!selectedCategory && !search) {
    return (
      <Box>
        <AssetSearchBar onSearch={setSearch} placeholder="Search 2,658 icons..." />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          <Box
            onClick={() => setSelectedCategory(PRESETS_TAG)}
            sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
              p: 1.5, borderRadius: 1.5, cursor: 'pointer', bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected', outline: '2px solid primary.main' },
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Presets</Typography>
            <Typography variant="caption" color="text.secondary">
              {presetIcons.filter((i) => !i.id.startsWith('iconpark-')).length}
            </Typography>
          </Box>

          {sortedCategories.map((cat) => (
            <Box
              key={cat.category}
              onClick={() => setSelectedCategory(cat.category)}
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                p: 1.5, borderRadius: 1.5, cursor: 'pointer', bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected', outline: '2px solid primary.main' },
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 500 }}>{cat.category}</Typography>
              <Typography variant="caption" color="text.secondary">{cat.count}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // ── Icon grid for selected category ──
  return (
    <Box>
      <AssetSearchBar onSearch={setSearch} placeholder={`Search${selectedCategory && selectedCategory !== PRESETS_TAG ? ` ${selectedCategory}` : ''} icons...`} />

      <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
        <Chip label="All" size="small"
          variant={selectedCategory === null ? 'filled' : 'outlined'}
          color={selectedCategory === null ? 'primary' : 'default'}
          onClick={() => { setSelectedCategory(null); setSearch(''); }}
          sx={{ fontSize: 10, height: 22 }}
        />
        <Chip label="Presets" size="small"
          variant={selectedCategory === PRESETS_TAG ? 'filled' : 'outlined'}
          color={selectedCategory === PRESETS_TAG ? 'primary' : 'default'}
          onClick={() => setSelectedCategory(PRESETS_TAG)}
          sx={{ fontSize: 10, height: 22 }}
        />
        {sortedCategories.slice(0, 12).map((cat) => (
          <Chip key={cat.category} label={`${cat.category} (${cat.count})`} size="small"
            variant={selectedCategory === cat.category ? 'filled' : 'outlined'}
            color={selectedCategory === cat.category ? 'primary' : 'default'}
            onClick={() => { setSelectedCategory(cat.category); setSearch(''); }}
            sx={{ fontSize: 10, height: 22 }}
          />
        ))}
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!loading && displayIcons.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.75 }}>
          {displayIcons.map((icon) => (
            <Box
              key={icon.id}
              onClick={() => handleAddIcon(icon)}
              draggable
              onDragStart={(e) =>
                onDragStart(e, {
                  assetType: 'shape',
                  assetId: icon.id,
                  svgContent: icon.svgContent,
                  viewBox: icon.viewBox,
                  defaultFill: icon.defaultFill,
                  defaultStroke: icon.defaultStroke,
                })
              }
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                aspectRatio: '1', borderRadius: 1, cursor: 'pointer',
                bgcolor: 'action.hover',
                '&:hover': {
                  bgcolor: 'action.selected',
                  outline: '2px solid', outlineColor: 'primary.main',
                },
              }}
            >
              <svg
                viewBox={icon.viewBox}
                style={{ width: '60%', height: '60%' }}
                dangerouslySetInnerHTML={{ __html: icon.svgContent }}
              />
            </Box>
          ))}
        </Box>
      )}

      {!loading && displayIcons.length === 0 && !search && selectedCategory && selectedCategory !== PRESETS_TAG && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 3 }}>
          Failed to load icons.
        </Typography>
      )}

      {!loading && displayIcons.length === 0 && search && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 3 }}>
          No icons found for &quot;{search}&quot;
        </Typography>
      )}
    </Box>
  );
}
