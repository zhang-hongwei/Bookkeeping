/**
 * PropertyPanel - Edit properties of selected node
 *
 * All property edits go through UpdateNodeCommand so they are undoable.
 */

"use client";

import { Box, Typography, Slider, TextField, Select, MenuItem, FormControl, InputLabel, Stack, Divider, IconButton } from '@mui/material';
import { Delete as DeleteIcon, ContentCopy as DupIcon, Visibility as VisIcon, VisibilityOff as VisOffIcon, Lock as LockIcon, LockOpen as LockOpenIcon } from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';
import { useEditorStore } from '../engine/store';
import { useSelectedNodes } from '../engine/store/selectors';
import { useFontAssets } from '../engine/assets/selectors';
import { decomposeMatrix, createMatrix } from '../engine/matrix-utils';
import { UpdateNodeCommand } from '../engine/commands/commands/update-node';
import type { PosterNode, TextNode, ShapeNode, DecorativeNode, ImageNode } from '../engine/node-tree/types';

/**
 * Create a command-aware update function for a given node ID.
 * Each call reads the live node from the store to capture the correct "before" state,
 * then dispatches an UpdateNodeCommand via the store's execute() method.
 */
function makeCommandUpdate(nodeId: string) {
  return (newFields: Partial<PosterNode>, description = 'Update property') => {
    const state = useEditorStore.getState();
    const current = state.nodes[nodeId];
    if (!current) return;
    const oldFields: Partial<PosterNode> = {};
    for (const key of Object.keys(newFields) as (keyof PosterNode)[]) {
      (oldFields as Record<string, unknown>)[key] = current[key];
    }
    state.execute(new UpdateNodeCommand(nodeId, oldFields, newFields, description));
  };
}

export function PropertyPanel() {
  const selectedNodes = useSelectedNodes();
  const removeNode = useEditorStore((s) => s.removeNode);

  const node = selectedNodes.length === 1 ? selectedNodes[0] : null;

  if (!node) {
    return (
      <Box sx={{ opacity: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Properties
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Select an element to edit
        </Typography>
      </Box>
    );
  }

  const { x, y, rotation } = decomposeMatrix(node.localMatrix);

  const commandUpdate = makeCommandUpdate(node.id);

  const updateMatrix = (updates: { x?: number; y?: number; rotation?: number }) => {
    const state = useEditorStore.getState();
    const current = state.nodes[node.id];
    if (!current) return;
    const cur = decomposeMatrix(current.localMatrix);
    const newMatrix = createMatrix({
      x: updates.x ?? cur.x,
      y: updates.y ?? cur.y,
      rotation: updates.rotation ?? cur.rotation,
      scaleX: cur.scaleX,
      scaleY: cur.scaleY,
    });
    state.execute(new UpdateNodeCommand(node.id, { localMatrix: current.localMatrix }, { localMatrix: newMatrix }, 'Move element'));
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
          {node.type}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => commandUpdate({ visible: !node.visible }, 'Toggle visibility')}>
            {node.visible ? <VisIcon sx={{ fontSize: 16 }} /> : <VisOffIcon sx={{ fontSize: 16 }} />}
          </IconButton>
          <IconButton size="small" onClick={() => commandUpdate({ locked: !node.locked }, 'Toggle lock')}>
            {node.locked ? <LockIcon sx={{ fontSize: 16 }} /> : <LockOpenIcon sx={{ fontSize: 16 }} />}
          </IconButton>
          <IconButton size="small" onClick={() => {
            const state = useEditorStore.getState();
            const parentId = node.parentId ?? state.rootNodeId ?? '';
            const dup = { ...node, localMatrix: createMatrix({ ...decomposeMatrix(node.localMatrix), x: x + 20, y: y + 20 }) } as Omit<PosterNode, 'id'>;
            delete (dup as Record<string, unknown>).id;
            state.addNode(dup, parentId);
          }}>
            <DupIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => removeNode(node.id)}>
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Stack>

      {/* Position */}
      <Stack direction="row" spacing={1} mb={1}>
        <TextField label="X" type="number" size="small" value={Math.round(x)}
          onChange={(e) => updateMatrix({ x: +e.target.value })} sx={{ flex: 1 }} inputProps={{ style: { fontSize: 12 } }} />
        <TextField label="Y" type="number" size="small" value={Math.round(y)}
          onChange={(e) => updateMatrix({ y: +e.target.value })} sx={{ flex: 1 }} inputProps={{ style: { fontSize: 12 } }} />
      </Stack>
      <Stack direction="row" spacing={1} mb={1}>
        <TextField label="W" type="number" size="small" value={Math.round(node.width)}
          onChange={(e) => commandUpdate({ width: Math.max(20, +e.target.value) }, 'Resize width')} sx={{ flex: 1 }} inputProps={{ style: { fontSize: 12 } }} />
        <TextField label="H" type="number" size="small" value={Math.round(node.height)}
          onChange={(e) => commandUpdate({ height: Math.max(20, +e.target.value) }, 'Resize height')} sx={{ flex: 1 }} inputProps={{ style: { fontSize: 12 } }} />
      </Stack>

      {/* Common: Opacity & Rotation */}
      <Typography variant="caption" color="text.secondary">Opacity</Typography>
      <Slider size="small" value={node.opacity} onChange={(_, v) => commandUpdate({ opacity: v as number }, 'Change opacity')} min={0} max={100} valueLabelDisplay="auto" />
      <Typography variant="caption" color="text.secondary">Rotation</Typography>
      <Slider size="small" value={Math.round(rotation)} onChange={(_, v) => updateMatrix({ rotation: v as number })} min={-180} max={180} valueLabelDisplay="auto" />

      <Divider sx={{ my: 1 }} />

      {/* Type-specific controls */}
      {node.type === 'text' && <TextControls node={node as TextNode} update={commandUpdate} />}
      {node.type === 'shape' && <ShapeControls node={node as ShapeNode} update={commandUpdate} />}
      {node.type === 'decorative' && <DecorativeControls node={node as DecorativeNode} update={commandUpdate} />}
      {node.type === 'image' && <ImageControls node={node as ImageNode} update={commandUpdate} />}
    </Box>
  );
}

function TextControls({ node, update }: { node: TextNode; update: (u: Partial<PosterNode>) => void }) {
  const fontAssets = useFontAssets();

  return (
    <Stack spacing={1}>
      <TextField label="Content" size="small" multiline rows={3} value={node.content}
        onChange={(e) => update({ content: e.target.value })} inputProps={{ style: { fontSize: 12 } }} fullWidth />

      <FormControl size="small" fullWidth>
        <InputLabel sx={{ fontSize: 12 }}>Font</InputLabel>
        <Select value={node.fontFamily} onChange={(e) => update({ fontFamily: e.target.value })} sx={{ fontSize: 12 }}>
          {fontAssets.map((font) => (
            <MenuItem key={font.id} value={font.fontFamily} sx={{ fontSize: 12, fontFamily: font.fontFamily }}>
              {font.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="caption" color="text.secondary">Font Size</Typography>
      <Slider size="small" value={node.fontSize} onChange={(_, v) => update({ fontSize: v as number })} min={8} max={120} valueLabelDisplay="auto" />

      <Typography variant="caption" color="text.secondary">Font Weight</Typography>
      <Slider size="small" value={node.fontWeight} onChange={(_, v) => update({ fontWeight: v as number })} min={100} max={900} step={100} valueLabelDisplay="auto" />

      <FormControl size="small" fullWidth>
        <InputLabel sx={{ fontSize: 12 }}>Align</InputLabel>
        <Select value={node.textAlign} onChange={(e) => update({ textAlign: e.target.value as 'left' | 'center' | 'right' })} sx={{ fontSize: 12 }}>
          <MenuItem value="left" sx={{ fontSize: 12 }}>Left</MenuItem>
          <MenuItem value="center" sx={{ fontSize: 12 }}>Center</MenuItem>
          <MenuItem value="right" sx={{ fontSize: 12 }}>Right</MenuItem>
        </Select>
      </FormControl>

      <ColorField label="Color" value={node.color} onChange={(c) => update({ color: c })} />
    </Stack>
  );
}

function ShapeControls({ node, update }: { node: ShapeNode; update: (u: Partial<PosterNode>) => void }) {
  return (
    <Stack spacing={1}>
      <ColorField label="Fill" value={node.fill} onChange={(c) => update({ fill: c })} />
      <ColorField label="Stroke" value={node.stroke} onChange={(c) => update({ stroke: c })} />
      <Typography variant="caption" color="text.secondary">Stroke Width</Typography>
      <Slider size="small" value={node.strokeWidth} onChange={(_, v) => update({ strokeWidth: v as number })} min={0} max={20} valueLabelDisplay="auto" />
      <Typography variant="caption" color="text.secondary">Border Radius</Typography>
      <Slider size="small" value={node.borderRadius} onChange={(_, v) => update({ borderRadius: v as number })} min={0} max={100} valueLabelDisplay="auto" />
    </Stack>
  );
}

function DecorativeControls({ node, update }: { node: DecorativeNode; update: (u: Partial<PosterNode>) => void }) {
  return (
    <Stack spacing={1}>
      <ColorField label="Color" value={node.color} onChange={(c) => update({ color: c })} />
      <Typography variant="caption" color="text.secondary">Stroke Width</Typography>
      <Slider size="small" value={node.strokeWidth} onChange={(_, v) => update({ strokeWidth: v as number })} min={1} max={20} valueLabelDisplay="auto" />
      <Typography variant="caption" color="text.secondary">Spacing</Typography>
      <Slider size="small" value={node.spacing} onChange={(_, v) => update({ spacing: v as number })} min={2} max={60} valueLabelDisplay="auto" />
    </Stack>
  );
}

function ImageControls({ node, update }: { node: ImageNode; update: (u: Partial<PosterNode>) => void }) {
  return (
    <Stack spacing={1}>
      <FormControl size="small" fullWidth>
        <InputLabel sx={{ fontSize: 12 }}>Fit</InputLabel>
        <Select value={node.objectFit} onChange={(e) => update({ objectFit: e.target.value as 'cover' | 'contain' | 'fill' })} sx={{ fontSize: 12 }}>
          <MenuItem value="cover" sx={{ fontSize: 12 }}>Cover</MenuItem>
          <MenuItem value="contain" sx={{ fontSize: 12 }}>Contain</MenuItem>
          <MenuItem value="fill" sx={{ fontSize: 12 }}>Fill</MenuItem>
        </Select>
      </FormControl>
      <Typography variant="caption" color="text.secondary">Border Radius</Typography>
      <Slider size="small" value={node.borderRadius} onChange={(_, v) => update({ borderRadius: v as number })} min={0} max={100} valueLabelDisplay="auto" />
    </Stack>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (c: string) => void }) {
  const isHex = value.startsWith('#') || value.startsWith('rgb');
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>{label}</Typography>
        <TextField size="small" value={value} onChange={(e) => onChange(e.target.value)}
          inputProps={{ style: { fontSize: 11, fontFamily: 'monospace' } }} sx={{ flex: 1 }} />
      </Stack>
      {isHex && (
        <Box sx={{ '& .react-colorful': { width: '100%', height: 120 } } }>
          <HexColorPicker color={value.startsWith('#') ? value : '#000000'} onChange={onChange} />
        </Box>
      )}
    </Box>
  );
}
