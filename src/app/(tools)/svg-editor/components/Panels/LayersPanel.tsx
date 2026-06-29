'use client';

import { useCallback } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import {
  Visibility as VisibleIcon,
  VisibilityOff as HiddenIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
} from '@mui/icons-material';
import { useSvgEditorStore } from '../../store/svgEditorStore';
import { flattenElements, findParentElement } from '../../lib/svg-parser';
import type { SvgElementData } from '../../types';

export default function LayersPanel() {
  const document = useSvgEditorStore((s) => s.document);
  const selection = useSvgEditorStore((s) => s.selection);
  const selectElements = useSvgEditorStore((s) => s.selectElements);
  const updateElementAttrs = useSvgEditorStore((s) => s.updateElementAttrs);
  const removeElements = useSvgEditorStore((s) => s.removeElements);
  const duplicateElements = useSvgEditorStore((s) => s.duplicateElements);
  const moveElementInTree = useSvgEditorStore((s) => s.moveElementInTree);
  const pushHistory = useSvgEditorStore((s) => s.pushHistory);

  const elements = flattenElements(document).filter((el) => el.tag !== 'svg');
  // Reverse for top-to-bottom layer order
  const layers = [...elements].reverse();

  const handleToggleVisibility = useCallback(
    (el: SvgElementData) => {
      const isHidden = el.attrs.visibility === 'hidden' || el.attrs.display === 'none';
      if (isHidden) {
        const updates: Record<string, string> = {};
        if ('visibility' in el.attrs) updates.visibility = 'visible';
        if ('display' in el.attrs) updates.display = '';
        updateElementAttrs(el.id, updates);
      } else {
        updateElementAttrs(el.id, { visibility: 'hidden' });
      }
    },
    [updateElementAttrs],
  );

  const handleMoveUp = useCallback(
    (el: SvgElementData) => {
      const parent = findParentElement(document, el.id);
      if (!parent) return;
      const idx = parent.children.findIndex((c) => c.id === el.id);
      if (idx < parent.children.length - 1) {
        moveElementInTree(el.id, parent.id, idx + 1);
        pushHistory('Move layer up');
      }
    },
    [document, moveElementInTree, pushHistory],
  );

  const handleMoveDown = useCallback(
    (el: SvgElementData) => {
      const parent = findParentElement(document, el.id);
      if (!parent) return;
      const idx = parent.children.findIndex((c) => c.id === el.id);
      if (idx > 0) {
        moveElementInTree(el.id, parent.id, idx - 1);
        pushHistory('Move layer down');
      }
    },
    [document, moveElementInTree, pushHistory],
  );

  if (layers.length === 0) {
    return (
      <Box sx={{ color: 'text.secondary', textAlign: 'center', py: 4, fontSize: 12 }}>
        No elements yet.
        <br />
        Use the tools on the left to create shapes.
      </Box>
    );
  }

  return (
    <Box sx={{ fontSize: 12 }}>
      {layers.map((el) => {
        const isSelected = selection.elementIds.includes(el.id);
        const isHidden = el.attrs.visibility === 'hidden' || el.attrs.display === 'none';

        return (
          <Box
            key={el.id}
            onClick={() => selectElements([el.id], 'single')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              cursor: 'pointer',
              bgcolor: isSelected ? 'action.selected' : 'transparent',
              '&:hover': { bgcolor: 'action.hover' },
              opacity: isHidden ? 0.5 : 1,
            }}
          >
            {/* Tag name */}
            <Typography
              variant="caption"
              sx={{
                flex: 1,
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {el.tag}
              {el.attrs.id ? `#${el.attrs.id}` : ''}
            </Typography>

            {/* Actions */}
            <Tooltip title={isHidden ? 'Show' : 'Hide'} arrow>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleToggleVisibility(el); }} sx={{ p: 0.25 }}>
                {isHidden ? <HiddenIcon sx={{ fontSize: 14 }} /> : <VisibleIcon sx={{ fontSize: 14 }} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Move Up" arrow>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMoveUp(el); }} sx={{ p: 0.25 }}>
                <UpIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Move Down" arrow>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMoveDown(el); }} sx={{ p: 0.25 }}>
                <DownIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Duplicate" arrow>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); duplicateElements([el.id]); pushHistory('Duplicate'); }}
                sx={{ p: 0.25 }}
              >
                <DuplicateIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" arrow>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); removeElements([el.id]); pushHistory('Delete'); }}
                sx={{ p: 0.25 }}
              >
                <DeleteIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      })}
    </Box>
  );
}
