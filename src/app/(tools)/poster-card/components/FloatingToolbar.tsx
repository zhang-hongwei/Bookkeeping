/**
 * FloatingToolbar - Shows above/below selected element with quick actions
 * Canva-style context toolbar for position, opacity, duplicate, delete, etc.
 * Also provides alignment and distribution buttons for multi-selection.
 */

"use client";

import { Box, IconButton, Tooltip, Typography, Divider, TextField } from '@mui/material';
import {
  Delete as DeleteIcon,
  ContentCopy as DupIcon,
  Visibility as VisIcon,
  VisibilityOff as VisOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  FlipToFront as BringFrontIcon,
  FlipToBack as SendBackIcon,
  AlignHorizontalLeft as AlignLeftIcon,
  AlignHorizontalCenter as AlignHCenterIcon,
  AlignHorizontalRight as AlignRightIcon,
  AlignVerticalTop as AlignTopIcon,
  AlignVerticalCenter as AlignVCenterIcon,
  AlignVerticalBottom as AlignBottomIcon,
  Dehaze as DistributeHIcon,
  ViewAgenda as DistributeVIcon,
} from '@mui/icons-material';
import { useEditorStore, engineCache } from '../engine/store';
import { useSelectedNodes } from '../engine/store/selectors';
import { decomposeMatrix, createMatrix } from '../engine/matrix-utils';
import { deleteSelectedWithTransaction, alignSelectedWithTransaction } from '../engine/selection/selection-ops';
import { UpdateNodeCommand } from '../engine/commands/commands/update-node';
import type { PosterNode } from '../engine/node-tree/types';
import type { Alignment } from '../engine/selection/types';

/** Shared toolbar container styles */
const toolbarSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  px: 1.5,
  py: 0.5,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 3,
  border: '1px solid',
  borderColor: 'divider',
  maxWidth: '100%',
  overflow: 'hidden',
} as const;

const iconFontSize = 15;

/** Execute an alignment operation via the editor store. */
function handleAlign(alignment: Alignment) {
  const state = useEditorStore.getState();
  state.execute(
    alignSelectedWithTransaction(
      state.nodes,
      state.selectedIds,
      alignment,
      (id) => engineCache.getWorldBounds(id),
    ),
  );
}

export function FloatingToolbar() {
  const selectedNodes = useSelectedNodes();
  const reorderNode = useEditorStore((s) => s.reorderNode);

  // Show toolbar for at least 1 selected element
  if (selectedNodes.length === 0) return null;

  const isSingle = selectedNodes.length === 1;
  const isMulti = selectedNodes.length >= 2;
  const canDistribute = selectedNodes.length >= 3;

  const node = isSingle ? selectedNodes[0] : null;

  // -- Multi-selection toolbar: alignment + distribution + delete --
  if (isMulti) {
    const selectedCount = selectedNodes.length;

    return (
      <Box sx={toolbarSx}>
        {/* Selection count label */}
        <Typography variant="caption" sx={{ fontWeight: 600, px: 0.5, flexShrink: 0 }}>
          {selectedCount} selected
        </Typography>

        <Divider orientation="vertical" flexItem />

        {/* Horizontal alignment */}
        <Tooltip title="Align left">
          <span>
            <IconButton size="small" onClick={() => handleAlign('left')}>
              <AlignLeftIcon sx={{ fontSize: iconFontSize }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Align horizontal center">
          <span>
            <IconButton size="small" onClick={() => handleAlign('center-h')}>
              <AlignHCenterIcon sx={{ fontSize: iconFontSize }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Align right">
          <span>
            <IconButton size="small" onClick={() => handleAlign('right')}>
              <AlignRightIcon sx={{ fontSize: iconFontSize }} />
            </IconButton>
          </span>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Vertical alignment */}
        <Tooltip title="Align top">
          <span>
            <IconButton size="small" onClick={() => handleAlign('top')}>
              <AlignTopIcon sx={{ fontSize: iconFontSize }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Align vertical center">
          <span>
            <IconButton size="small" onClick={() => handleAlign('center-v')}>
              <AlignVCenterIcon sx={{ fontSize: iconFontSize }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Align bottom">
          <span>
            <IconButton size="small" onClick={() => handleAlign('bottom')}>
              <AlignBottomIcon sx={{ fontSize: iconFontSize }} />
            </IconButton>
          </span>
        </Tooltip>

        {/* Distribution - only when 3+ elements selected */}
        {canDistribute && (
          <>
            <Divider orientation="vertical" flexItem />

            <Tooltip title="Distribute horizontally">
              <span>
                <IconButton size="small" onClick={() => handleAlign('distribute-h')}>
                  <DistributeHIcon sx={{ fontSize: iconFontSize }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Distribute vertically">
              <span>
                <IconButton size="small" onClick={() => handleAlign('distribute-v')}>
                  <DistributeVIcon sx={{ fontSize: iconFontSize }} />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}

        <Divider orientation="vertical" flexItem />

        {/* Delete */}
        <Tooltip title="Delete selected">
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              const state = useEditorStore.getState();
              state.execute(deleteSelectedWithTransaction(state.selectedIds, state.nodes));
            }}
          >
            <DeleteIcon sx={{ fontSize: iconFontSize }} />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  // -- Single-selection toolbar: position, reorder, visibility, lock, duplicate, delete --
  if (!node) return null;

  const { x, y } = decomposeMatrix(node.localMatrix);

  const updatePosition = (newX: number, newY: number) => {
    const { rotation, scaleX, scaleY } = decomposeMatrix(node.localMatrix);
    const oldMatrix = node.localMatrix;
    const newMatrix = createMatrix({ x: newX, y: newY, rotation, scaleX, scaleY });
    useEditorStore.getState().execute(
      new UpdateNodeCommand(node.id, { localMatrix: oldMatrix }, { localMatrix: newMatrix }, `Move to (${newX}, ${newY})`),
    );
  };

  const handleDuplicate = () => {
    const state = useEditorStore.getState();
    const parentId = node.parentId ?? state.rootNodeId ?? '';
    const newNode = {
      ...node,
      localMatrix: createMatrix({
        ...decomposeMatrix(node.localMatrix),
        x: decomposeMatrix(node.localMatrix).x + 20,
        y: decomposeMatrix(node.localMatrix).y + 20,
      }),
    } as Omit<PosterNode, 'id'>;
    delete (newNode as Record<string, unknown>).id;
    state.addNode(newNode, parentId);
  };

  return (
    <Box sx={toolbarSx}>
      {/* Element type label */}
      <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize', px: 0.5, flexShrink: 0 }}>
        {node.type}
      </Typography>

      <Divider orientation="vertical" flexItem />

      {/* Position */}
      <TextField label="X" type="number" size="small" value={Math.round(x)}
        onChange={(e) => updatePosition(+e.target.value, y)}
        sx={{ width: 72, '& .MuiInputBase-input': { fontSize: 11, py: 0.5 }, '& .MuiInputLabel-root': { fontSize: 10 } }} />
      <TextField label="Y" type="number" size="small" value={Math.round(y)}
        onChange={(e) => updatePosition(x, +e.target.value)}
        sx={{ width: 72, '& .MuiInputBase-input': { fontSize: 11, py: 0.5 }, '& .MuiInputLabel-root': { fontSize: 10 } }} />

      <Divider orientation="vertical" flexItem />

      {/* Reorder */}
      <Tooltip title="Bring to front">
        <IconButton size="small" onClick={() => reorderNode(node.id, 'top')}>
          <BringFrontIcon sx={{ fontSize: iconFontSize }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Send to back">
        <IconButton size="small" onClick={() => reorderNode(node.id, 'bottom')}>
          <SendBackIcon sx={{ fontSize: iconFontSize }} />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem />

      {/* Visibility & Lock */}
      <Tooltip title={node.visible ? 'Hide' : 'Show'}>
        <IconButton size="small" onClick={() => {
          useEditorStore.getState().execute(
            new UpdateNodeCommand(node.id, { visible: node.visible }, { visible: !node.visible }, node.visible ? 'Hide' : 'Show'),
          );
        }}>
          {node.visible ? <VisIcon sx={{ fontSize: iconFontSize }} /> : <VisOffIcon sx={{ fontSize: iconFontSize }} />}
        </IconButton>
      </Tooltip>
      <Tooltip title={node.locked ? 'Unlock' : 'Lock'}>
        <IconButton size="small" onClick={() => {
          useEditorStore.getState().execute(
            new UpdateNodeCommand(node.id, { locked: node.locked }, { locked: !node.locked }, node.locked ? 'Unlock' : 'Lock'),
          );
        }}>
          {node.locked ? <LockIcon sx={{ fontSize: iconFontSize }} /> : <LockOpenIcon sx={{ fontSize: iconFontSize }} />}
        </IconButton>
      </Tooltip>

      {/* Duplicate & Delete */}
      <Tooltip title="Duplicate">
        <IconButton size="small" onClick={handleDuplicate}>
          <DupIcon sx={{ fontSize: iconFontSize }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" color="error" onClick={() => {
          const state = useEditorStore.getState();
          state.execute(deleteSelectedWithTransaction(new Set([node.id]), state.nodes));
        }}>
          <DeleteIcon sx={{ fontSize: iconFontSize }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
