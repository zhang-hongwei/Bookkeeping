/**
 * TemplateSelector - Grid of template presets
 * Uses migration utility to convert old presets to new engine format
 */

"use client";

import { Box, Typography, Chip } from '@mui/material';
import { useEditorStore } from '../engine/store';
import { migrateTemplate } from '../engine/migration';
import { TEMPLATE_PRESETS, TEMPLATE_LIST } from '../presets';
import type { TemplateStyle } from '../types';

export function TemplateSelector() {
  const rootNodeId = useEditorStore((s) => s.rootNodeId);
  const activeTemplateId = useEditorStore((s) => s.activeTemplateId);
  const setNodes = useEditorStore((s) => s.setNodes);

  const retroTemplates = TEMPLATE_LIST.filter((t) => t.category === 'retro');
  const modernTemplates = TEMPLATE_LIST.filter((t) => t.category === 'modern');

  const handleApplyTemplate = (templateId: TemplateStyle) => {
    const preset = TEMPLATE_PRESETS[templateId];
    if (!preset) return;

    const { nodes, rootNodeId: newRootId } = migrateTemplate({
      canvasSize: preset.canvasSize,
      background: preset.background,
      elements: preset.elements as Omit<
        import('../types').PosterElement, 'id'
      >[],
    });

    setNodes(nodes, newRootId);
    useEditorStore.getState().setActiveTemplateId(templateId);
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Templates
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        Retro
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
        {retroTemplates.map((t) => (
          <TemplateChip
            key={t.id}
            id={t.id}
            emoji={t.emoji}
            label={t.label}
            isActive={activeTemplateId === t.id}
            onClick={handleApplyTemplate}
          />
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        Modern
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {modernTemplates.map((t) => (
          <TemplateChip
            key={t.id}
            id={t.id}
            emoji={t.emoji}
            label={t.label}
            isActive={activeTemplateId === t.id}
            onClick={handleApplyTemplate}
          />
        ))}
      </Box>
    </Box>
  );
}

function TemplateChip({
  id,
  emoji,
  label,
  isActive,
  onClick,
}: {
  id: TemplateStyle;
  emoji: string;
  label: string;
  isActive: boolean;
  onClick: (id: TemplateStyle) => void;
}) {
  return (
    <Chip
      icon={<span style={{ fontSize: 14 }}>{emoji}</span>}
      label={label}
      size="small"
      variant={isActive ? 'filled' : 'outlined'}
      color={isActive ? 'primary' : 'default'}
      onClick={() => onClick(id)}
      sx={{ fontSize: 12, '& .MuiChip-icon': { mr: -0.5 } }}
    />
  );
}
