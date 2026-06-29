/**
 * Canvas context menu - right-click operations
 */

"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, MenuItem, Divider, Typography, Box } from '@mui/material';
import { useEditorStore, engineCache } from '../engine/store';
import { deleteSelectedWithTransaction, alignSelectedWithTransaction } from '../engine/selection/selection-ops';
import { copyNodes, pasteNodes, duplicateNodes } from '../engine/clipboard';
import { GroupNodesCommand } from '../engine/commands/commands/group-nodes';
import { UngroupNodeCommand } from '../engine/commands/commands/ungroup-node';
import { UpdateNodeCommand } from '../engine/commands/commands/update-node';
import { ReorderNodeCommand } from '../engine/commands/commands/reorder-node';

export function ContextMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [menuType, setMenuType] = useState<'empty' | 'element' | 'multi'>('empty');
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      positionRef.current = { x: e.clientX, y: e.clientY };
      setAnchorEl(e.target as HTMLElement);

      const s = useEditorStore.getState();
      if (s.selectedIds.size > 1) {
        setMenuType('multi');
      } else if (s.selectedIds.size === 1) {
        setMenuType('element');
      } else {
        setMenuType('empty');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const getStore = () => useEditorStore.getState();

  const handleDelete = useCallback(() => {
    const s = getStore();
    if (s.selectedIds.size > 0) {
      s.execute(deleteSelectedWithTransaction(s.selectedIds, s.nodes));
    }
    handleClose();
  }, [handleClose]);

  const handleCopy = useCallback(() => {
    const s = getStore();
    if (s.selectedIds.size > 0) {
      copyNodes(s.selectedIds, s.nodes);
    }
    handleClose();
  }, [handleClose]);

  const handlePaste = useCallback(() => {
    const s = getStore();
    if (s.rootNodeId) {
      const cmd = pasteNodes(s.rootNodeId, s.nodes);
      if (cmd) s.execute(cmd);
    }
    handleClose();
  }, [handleClose]);

  const handleDuplicate = useCallback(() => {
    const s = getStore();
    if (s.selectedIds.size > 0 && s.rootNodeId) {
      const cmd = duplicateNodes(s.selectedIds, s.rootNodeId, s.nodes);
      if (cmd) s.execute(cmd);
    }
    handleClose();
  }, [handleClose]);

  const handleGroup = useCallback(() => {
    const s = getStore();
    if (s.selectedIds.size >= 2) {
      s.execute(new GroupNodesCommand([...s.selectedIds], s.nodes));
    }
    handleClose();
  }, [handleClose]);

  const handleUngroup = useCallback(() => {
    const s = getStore();
    const id = [...s.selectedIds][0];
    const node = s.nodes[id];
    if (node?.type === 'group') {
      s.execute(new UngroupNodeCommand(id, s.nodes));
    }
    handleClose();
  }, [handleClose]);

  const handleLock = useCallback(() => {
    const s = getStore();
    const id = [...s.selectedIds][0];
    const node = s.nodes[id];
    if (node) {
      s.execute(new UpdateNodeCommand(id, { locked: false }, { locked: true }, 'Lock'));
    }
    handleClose();
  }, [handleClose]);

  const handleUnlock = useCallback(() => {
    const s = getStore();
    const id = [...s.selectedIds][0];
    const node = s.nodes[id];
    if (node) {
      s.execute(new UpdateNodeCommand(id, { locked: true }, { locked: false }, 'Unlock'));
    }
    handleClose();
  }, [handleClose]);

  const handleBringToFront = useCallback(() => {
    const s = getStore();
    const id = [...s.selectedIds][0];
    const node = s.nodes[id];
    if (node?.parentId) {
      const parent = s.nodes[node.parentId];
      if (parent) {
        s.execute(new ReorderNodeCommand(node.parentId, parent.childrenIds, [
          ...parent.childrenIds.filter((cid) => cid !== id), id,
        ], 'Bring to front'));
      }
    }
    handleClose();
  }, [handleClose]);

  const handleSendToBack = useCallback(() => {
    const s = getStore();
    const id = [...s.selectedIds][0];
    const node = s.nodes[id];
    if (node?.parentId) {
      const parent = s.nodes[node.parentId];
      if (parent) {
        s.execute(new ReorderNodeCommand(node.parentId, parent.childrenIds, [
          id, ...parent.childrenIds.filter((cid) => cid !== id),
        ], 'Send to back'));
      }
    }
    handleClose();
  }, [handleClose]);

  const handleSelectAll = useCallback(() => {
    getStore().selectAll();
    handleClose();
  }, [handleClose]);

  const s = getStore();
  const selectedId = s.selectedIds.size === 1 ? [...s.selectedIds][0] : null;
  const selectedNode = selectedId ? s.nodes[selectedId] : null;
  const isLocked = selectedNode?.locked ?? false;
  const isGroup = selectedNode?.type === 'group';

  return (
    <Menu
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: positionRef.current.y, left: positionRef.current.x }}
      slotProps={{ paper: { sx: { minWidth: 180 } } }}
    >
      {menuType !== 'empty' && (
        <>
          <MenuItem onClick={handleDuplicate}>
            <Box sx={{ flex: 1 }}>Duplicate</Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 4 }}>Ctrl+D</Typography>
          </MenuItem>
          <MenuItem onClick={handleCopy}>
            <Box sx={{ flex: 1 }}>Copy</Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 4 }}>Ctrl+C</Typography>
          </MenuItem>
          <MenuItem onClick={handlePaste}>
            <Box sx={{ flex: 1 }}>Paste</Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 4 }}>Ctrl+V</Typography>
          </MenuItem>
          <Divider />
          {menuType === 'multi' && (
            <MenuItem onClick={handleGroup}>Group</MenuItem>
          )}
          {menuType === 'element' && isGroup && (
            <MenuItem onClick={handleUngroup}>Ungroup</MenuItem>
          )}
          {menuType === 'element' && (
            <>
              <MenuItem onClick={isLocked ? handleUnlock : handleLock}>
                {isLocked ? 'Unlock' : 'Lock'}
              </MenuItem>
              <MenuItem onClick={handleBringToFront}>Bring to Front</MenuItem>
              <MenuItem onClick={handleSendToBack}>Send to Back</MenuItem>
            </>
          )}
          <Divider />
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>Delete</MenuItem>
        </>
      )}
      {menuType === 'empty' && (
        <>
          <MenuItem onClick={handlePaste}>Paste</MenuItem>
          <MenuItem onClick={handleSelectAll}>Select All</MenuItem>
        </>
      )}
    </Menu>
  );
}
