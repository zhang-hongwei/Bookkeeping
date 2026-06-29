'use client';

import { useState, useCallback } from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { AssetSearchBar } from './AssetSearchBar';
import { useTemplateAssets } from '../../engine/assets/selectors';
import { useEditorStore } from '../../engine/store';
import type { TemplateAsset } from '../../engine/assets/types';

const TEMPLATE_CATEGORIES = ['all', 'social-media', 'poster', 'card', 'presentation', 'print'] as const;

export function TemplateAssetPanel() {
  const templates = useTemplateAssets();
  const setNodes = useEditorStore((s) => s.setNodes);
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredTemplates = templates.filter((t) => {
    if (category !== 'all' && t.category !== category) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleApplyTemplate = useCallback((template: TemplateAsset) => {
    if (!template.rootNodeId || !template.nodes) return;
    setNodes(template.nodes, template.rootNodeId);
  }, [setNodes]);

  return (
    <Box>
      <AssetSearchBar onSearch={setSearch} placeholder="Search templates..." />

      <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
        {TEMPLATE_CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
            size="small"
            variant={category === cat ? 'filled' : 'outlined'}
            color={category === cat ? 'primary' : 'default'}
            onClick={() => setCategory(cat)}
            sx={{ fontSize: 10, height: 22 }}
          />
        ))}
      </Stack>

      <Stack spacing={1}>
        {filteredTemplates.map((template) => (
          <Box
            key={template.id}
            onClick={() => handleApplyTemplate(template)}
            sx={{
              p: 1,
              borderRadius: 1,
              cursor: 'pointer',
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected', outline: '2px solid', outlineColor: 'primary.main' },
            }}
          >
            {template.preview && (
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: `${template.canvasWidth}/${template.canvasHeight}`,
                  borderRadius: 0.5,
                  overflow: 'hidden',
                  mb: 0.5,
                  bgcolor: 'background.default',
                }}
              >
                <img src={template.preview} alt={template.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            )}
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{template.name}</Typography>
            {template.placeholders.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 10 }}>
                {template.placeholders.length} placeholders
              </Typography>
            )}
          </Box>
        ))}
      </Stack>

      {filteredTemplates.length === 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 3 }}>
          No templates found. Use the Templates tab for preset templates.
        </Typography>
      )}
    </Box>
  );
}
