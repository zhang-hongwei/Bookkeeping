/**
 * LeftSidebar - Canva-style tabbed sidebar
 * Tabs: Templates | Assets | Text | Background | Layers
 */

"use client";

import { useState, type MouseEvent } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Slider,
} from '@mui/material';
import {
  ViewQuilt as TemplateIcon,
  Collections as CollectionsIcon,
  TextFields as TextIcon,
  Wallpaper as BgIcon,
  Layers as LayersIcon,
  ChevronLeft as CollapseIcon,
  Visibility as VisIcon,
  VisibilityOff as VisOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  DragHandle as DragHandleIcon,
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore } from '../engine/store';
import { useRootChildrenIds } from '../engine/store/selectors';
import { createMatrix } from '../engine/matrix-utils';
import { ReorderNodeCommand } from '../engine/commands/commands/reorder-node';
import type { CanvasNode, PosterNode } from '../engine/node-tree/types';
import type {
  Background,
  SolidBackground,
  GradientBackground,
  PatternBackground,
} from '../engine/node-tree/types';
import { TemplateSelector } from './TemplateSelector';
import { AssetPanel } from './AssetPanel';

type TabId = 'templates' | 'assets' | 'text' | 'background' | 'layers';

const TABS: { id: TabId; icon: typeof TemplateIcon; label: string }[] = [
  { id: 'templates', icon: TemplateIcon, label: 'Templates' },
  { id: 'assets', icon: CollectionsIcon, label: 'Assets' },
  { id: 'text', icon: TextIcon, label: 'Text' },
  { id: 'background', icon: BgIcon, label: 'Background' },
  { id: 'layers', icon: LayersIcon, label: 'Layers' },
];

const SIDEBAR_WIDTH = 280;

export function LeftSidebar() {
  const [activeTab, setActiveTab] = useState<TabId>('templates');
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: 0, flexShrink: 0 }}>
      {/* Tab icons column */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 1,
          gap: 0.5,
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          width: 48,
          flexShrink: 0,
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && !collapsed;
          return (
            <Tooltip key={tab.id} title={tab.label} placement="right">
              <IconButton
                size="small"
                onClick={() => {
                  if (activeTab === tab.id && !collapsed) {
                    setCollapsed(true);
                  } else {
                    setActiveTab(tab.id);
                    setCollapsed(false);
                  }
                }}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: isActive ? 'primary.light' : 'transparent',
                  color: isActive ? 'primary.dark' : 'text.secondary',
                  '&:hover': { bgcolor: isActive ? 'primary.light' : 'action.hover' },
                }}
              >
                <Icon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          );
        })}
      </Box>

      {/* Content panel */}
      {!collapsed && (
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
              {activeTab}
            </Typography>
            <IconButton size="small" onClick={() => setCollapsed(true)}>
              <CollapseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {activeTab === 'templates' && <TemplatesTab />}
            {activeTab === 'assets' && <AssetsTab />}
            {activeTab === 'text' && <TextTab />}
            {activeTab === 'background' && <BackgroundTab />}
            {activeTab === 'layers' && <LayersTab />}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// === Tab Contents ===

function TemplatesTab() {
  return <TemplateSelector />;
}

function AssetsTab() {
  return <AssetPanel />;
}

function TextTab() {
  const addNode = useEditorStore((s) => s.addNode);
  const rootNodeId = useEditorStore((s) => s.rootNodeId);
  const nodes = useEditorStore((s) => s.nodes);
  const root = rootNodeId ? (nodes[rootNodeId] as CanvasNode | undefined) : undefined;
  const size = root ? { width: root.canvasWidth, height: root.canvasHeight } : { width: 1080, height: 1440 };

  const presets = [
    { label: 'Heading', fontSize: 48, fontWeight: 700, w: 600, h: 80 },
    { label: 'Subheading', fontSize: 32, fontWeight: 600, w: 500, h: 60 },
    { label: 'Body Text', fontSize: 18, fontWeight: 400, w: 400, h: 120 },
    { label: 'Caption', fontSize: 14, fontWeight: 400, w: 300, h: 40 },
  ];

  const addText = (preset: typeof presets[0]) => {
    addNode({
      type: 'text',
      parentId: rootNodeId!,
      childrenIds: [],
      localMatrix: createMatrix({
        x: (size.width - preset.w) / 2,
        y: (size.height - preset.h) / 2,
      }),
      width: preset.w,
      height: preset.h,
      opacity: 100, visible: true, locked: false,
      content: preset.label,
      fontFamily: "'Noto Sans SC', sans-serif",
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      color: '#000000',
      textAlign: 'center',
      lineHeight: 1.4,
      letterSpacing: 0,
      backgroundColor: '',
      padding: 8,
    });
  };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Click to add text to canvas
      </Typography>
      <Stack spacing={1}>
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="outlined"
            size="small"
            onClick={() => addText(preset)}
            sx={{
              fontSize: preset.fontSize > 30 ? preset.fontSize / 3 : preset.fontSize / 2,
              fontWeight: preset.fontWeight,
              textTransform: 'none',
              justifyContent: 'flex-start',
              py: 1.5,
            }}
          >
            {preset.label}
          </Button>
        ))}
      </Stack>
    </Box>
  );
}

function BackgroundTab() {
  const rootNodeId = useEditorStore((s) => s.rootNodeId);
  const nodes = useEditorStore((s) => s.nodes);
  const updateNode = useEditorStore((s) => s.updateNode);

  const root = rootNodeId ? (nodes[rootNodeId] as CanvasNode | undefined) : undefined;
  const background = root?.background ?? { type: 'solid', color: '#1a1a2e' };

  const set = (bg: Background) => {
    if (rootNodeId) {
      updateNode(rootNodeId, { background: bg } as Partial<CanvasNode>);
    }
  };

  const handleTypeChange = (_: React.MouseEvent, newType: string | null) => {
    if (!newType) return;
    switch (newType) {
      case 'solid': set({ type: 'solid', color: '#1a1a2e' }); break;
      case 'gradient': set({ type: 'gradient', angle: 135, stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] }); break;
      case 'pattern': set({ type: 'pattern', patternId: 'dots', color: '#ffffff20', backgroundColor: '#1a1a2e', scale: 1 }); break;
    }
  };

  return (
    <Box>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={background.type}
        onChange={handleTypeChange}
        sx={{ mb: 2, '& .MuiToggleButton-root': { fontSize: 11, px: 1.5, py: 0.3 } }}
      >
        <ToggleButton value="solid">Solid</ToggleButton>
        <ToggleButton value="gradient">Gradient</ToggleButton>
        <ToggleButton value="pattern">Pattern</ToggleButton>
      </ToggleButtonGroup>

      {background.type === 'solid' && (
        <SolidBgPanel bg={background} onChange={set} />
      )}
      {background.type === 'gradient' && (
        <GradientBgPanel bg={background} onChange={set} />
      )}
      {background.type === 'pattern' && (
        <PatternBgPanel bg={background} onChange={set} />
      )}
    </Box>
  );
}

function SolidBgPanel({ bg, onChange }: { bg: SolidBackground; onChange: (bg: Background) => void }) {
  return (
    <Stack spacing={1.5}>
      <TextField label="Color" size="small" value={bg.color}
        onChange={(e) => onChange({ ...bg, color: e.target.value })} fullWidth
        inputProps={{ style: { fontSize: 12, fontFamily: 'monospace' } }} />
      {bg.color.startsWith('#') && (
        <Box sx={{ '& .react-colorful': { width: '100%', height: 140 } }}>
          <HexColorPicker color={bg.color} onChange={(c) => onChange({ ...bg, color: c })} />
        </Box>
      )}
    </Stack>
  );
}

function GradientBgPanel({ bg, onChange }: { bg: GradientBackground; onChange: (bg: Background) => void }) {
  const updateStop = (index: number, color: string) => {
    const stops = bg.stops.map((s, i) => (i === index ? { ...s, color } : s));
    onChange({ ...bg, stops });
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="caption" color="text.secondary">Angle</Typography>
      <Slider size="small" value={bg.angle} onChange={(_, v) => onChange({ ...bg, angle: v as number })} min={0} max={360} valueLabelDisplay="auto" />
      {bg.stops.map((stop, i) => (
        <Stack key={i} direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 20, height: 20, borderRadius: 1, bgcolor: stop.color, border: '1px solid #ccc', flexShrink: 0 }} />
          <TextField size="small" value={stop.color} onChange={(e) => updateStop(i, e.target.value)}
            inputProps={{ style: { fontSize: 11, fontFamily: 'monospace' } }} sx={{ flex: 1 }} />
        </Stack>
      ))}
      {bg.stops[0]?.color.startsWith('#') && (
        <Box sx={{ '& .react-colorful': { width: '100%', height: 120 } }}>
          <HexColorPicker color={bg.stops[0].color} onChange={(c) => updateStop(0, c)} />
        </Box>
      )}
    </Stack>
  );
}

function PatternBgPanel({ bg, onChange }: { bg: PatternBackground; onChange: (bg: Background) => void }) {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1}>
        {(['dots', 'grid', 'lines'] as const).map((p) => (
          <ToggleButtonGroup key={p} size="small" exclusive value={bg.patternId}
            onChange={() => onChange({ ...bg, patternId: p })}>
            <ToggleButton value={p} sx={{ fontSize: 11, px: 1.5, py: 0.3 }}>{p}</ToggleButton>
          </ToggleButtonGroup>
        ))}
      </Stack>
      <TextField label="BG Color" size="small" value={bg.backgroundColor}
        onChange={(e) => onChange({ ...bg, backgroundColor: e.target.value })}
        inputProps={{ style: { fontSize: 11, fontFamily: 'monospace' } }} fullWidth />
      <Typography variant="caption" color="text.secondary">Scale</Typography>
      <Slider size="small" value={bg.scale} onChange={(_, v) => onChange({ ...bg, scale: v as number })} min={0.5} max={3} step={0.1} valueLabelDisplay="auto" />
    </Stack>
  );
}

/** Get a human-readable label for a layer node. */
function getLayerLabel(node: PosterNode): string {
  if (node.type === 'text') {
    const textContent = (node as import('../engine/node-tree/types').TextNode).content;
    return textContent.slice(0, 20) || 'Text';
  }
  return node.type.charAt(0).toUpperCase() + node.type.slice(1);
}

/**
 * A single sortable layer row.
 * Wraps useSortable from @dnd-kit so each item can be dragged.
 */
function SortableLayerItem({
  id,
  isSelected,
  onSelect,
}: {
  id: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const node = useEditorStore((s) => s.nodes[id]);
  const updateNode = useEditorStore((s) => s.updateNode);
  const reorderNode = useEditorStore((s) => s.reorderNode);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Combine dnd-kit transform with any existing styles
  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // When dragging, elevate the item and make it semi-transparent
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 10 : 'auto',
    boxShadow: isDragging
      ? '0 4px 12px rgba(0,0,0,0.15)'
      : 'none',
  };

  if (!node) return null;

  const stopAndDo = (e: MouseEvent, fn: () => void) => {
    e.stopPropagation();
    fn();
  };

  return (
    <Box
      ref={setNodeRef}
      style={sortableStyle}
      onClick={onSelect}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.75,
        borderRadius: 1,
        cursor: 'pointer',
        bgcolor: isSelected ? 'primary.light' : isDragging ? 'action.hover' : 'transparent',
        '&:hover': { bgcolor: isSelected ? 'primary.light' : 'action.hover' },
        border: isSelected ? '1px solid' : '1px solid transparent',
        borderColor: isSelected ? 'primary.main' : 'transparent',
      }}
    >
      {/* Drag handle - the grip icon that initiates drag */}
      <Box
        {...attributes}
        {...listeners}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'grab',
          color: 'text.disabled',
          '&:hover': { color: 'text.secondary' },
          flexShrink: 0,
          // Prevent the drag handle from triggering row selection
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <DragHandleIcon sx={{ fontSize: 14 }} />
      </Box>

      <Typography
        variant="caption"
        sx={{
          flex: 1,
          fontWeight: isSelected ? 600 : 400,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        {getLayerLabel(node)}
      </Typography>

      <IconButton
        size="small"
        onClick={(e) => stopAndDo(e, () => updateNode(id, { visible: !node.visible }))}
        sx={{ p: 0.25 }}
      >
        {node.visible
          ? <VisIcon sx={{ fontSize: 13 }} />
          : <VisOffIcon sx={{ fontSize: 13 }} />}
      </IconButton>
      <IconButton
        size="small"
        onClick={(e) => stopAndDo(e, () => updateNode(id, { locked: !node.locked }))}
        sx={{ p: 0.25 }}
      >
        {node.locked
          ? <LockIcon sx={{ fontSize: 13 }} />
          : <LockOpenIcon sx={{ fontSize: 13 }} />}
      </IconButton>
      <IconButton
        size="small"
        onClick={(e) => stopAndDo(e, () => reorderNode(id, 'up'))}
        sx={{ p: 0.25 }}
      >
        <UpIcon sx={{ fontSize: 13 }} />
      </IconButton>
      <IconButton
        size="small"
        onClick={(e) => stopAndDo(e, () => reorderNode(id, 'down'))}
        sx={{ p: 0.25 }}
      >
        <DownIcon sx={{ fontSize: 13 }} />
      </IconButton>
    </Box>
  );
}

function LayersTab() {
  const childrenIds = useRootChildrenIds();
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const singleSelect = useEditorStore((s) => s.singleSelect);

  // Layers display in reverse order (top layer first, bottom layer last),
  // which matches how design tools like Figma/Canva present layers.
  const reversedIds = [...childrenIds].reverse();

  // Configure the pointer sensor with a small activation distance to
  // distinguish clicks from drag intentions.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const state = useEditorStore.getState();
    const rootNodeId = state.rootNodeId;
    if (!rootNodeId) return;
    const rootNode = state.nodes[rootNodeId];
    if (!rootNode) return;

    const oldIds = [...rootNode.childrenIds];

    // Map the reversed-index positions back to the original childrenIds order.
    // reversedIds[i] = childrenIds[childrenIds.length - 1 - i]
    const oldReversedIndex = reversedIds.indexOf(active.id as string);
    const newReversedIndex = reversedIds.indexOf(over.id as string);
    if (oldReversedIndex === -1 || newReversedIndex === -1) return;

    const oldIndex = childrenIds.length - 1 - oldReversedIndex;
    const newIndex = childrenIds.length - 1 - newReversedIndex;

    const newIds = arrayMove(oldIds, oldIndex, newIndex);
    state.execute(
      new ReorderNodeCommand(rootNodeId, oldIds, newIds, 'Reorder layers'),
    );
  };

  if (childrenIds.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        No elements yet. Add elements from the Assets or Text tabs.
      </Typography>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={reversedIds}
        strategy={verticalListSortingStrategy}
      >
        <Stack spacing={0.5}>
          {reversedIds.map((id) => (
            <SortableLayerItem
              key={id}
              id={id}
              isSelected={selectedIds.has(id)}
              onSelect={() => singleSelect(id)}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}
