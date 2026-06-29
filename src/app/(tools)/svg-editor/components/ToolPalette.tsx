'use client';

import { Tooltip, IconButton, Box, Divider } from '@mui/material';
import {
  NearMe as SelectIcon,
  PanTool as HandIcon,
  ZoomIn as ZoomIcon,
  Create as PenIcon,
  Gesture as PencilIcon,
  HorizontalRule as LineIcon,
  CropSquare as RectIcon,
  Circle as EllipseIcon,
  Pentagon as PolygonIcon,
  TextFields as TextIcon,
} from '@mui/icons-material';
import type { EditorTool } from '../types';
import { useSvgEditorStore } from '../store/svgEditorStore';

interface ToolDef {
  tool: EditorTool;
  label: string;
  shortcut: string;
  icon: React.ReactElement;
}

const TOOLS: ToolDef[] = [
  { tool: 'select', label: 'Select', shortcut: 'V', icon: <SelectIcon fontSize="small" /> },
  { tool: 'hand', label: 'Hand', shortcut: 'H', icon: <HandIcon fontSize="small" /> },
  { tool: 'zoom', label: 'Zoom', shortcut: 'Z', icon: <ZoomIcon fontSize="small" /> },
];

const DRAW_TOOLS: ToolDef[] = [
  { tool: 'pen', label: 'Pen', shortcut: 'P', icon: <PenIcon fontSize="small" /> },
  { tool: 'pencil', label: 'Pencil', shortcut: 'N', icon: <PencilIcon fontSize="small" /> },
];

const SHAPE_TOOLS: ToolDef[] = [
  { tool: 'line', label: 'Line', shortcut: 'L', icon: <LineIcon fontSize="small" /> },
  { tool: 'rect', label: 'Rectangle', shortcut: 'R', icon: <RectIcon fontSize="small" /> },
  { tool: 'ellipse', label: 'Ellipse', shortcut: 'E', icon: <EllipseIcon fontSize="small" /> },
  { tool: 'polygon', label: 'Polygon', shortcut: '', icon: <PolygonIcon fontSize="small" /> },
];

const TEXT_TOOLS: ToolDef[] = [
  { tool: 'text', label: 'Text', shortcut: 'T', icon: <TextIcon fontSize="small" /> },
];

const ALL_TOOL_GROUPS = [TOOLS, DRAW_TOOLS, SHAPE_TOOLS, TEXT_TOOLS];

export default function ToolPalette() {
  const activeTool = useSvgEditorStore((s) => s.activeTool);
  const setActiveTool = useSvgEditorStore((s) => s.setActiveTool);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1, gap: 0.5 }}>
      {ALL_TOOL_GROUPS.map((group, gi) => (
        <Box key={gi}>
          {gi > 0 && <Divider sx={{ my: 0.5, width: 28 }} />}
          {group.map(({ tool, label, shortcut, icon }) => (
            <Tooltip key={tool} title={`${label}${shortcut ? ` (${shortcut})` : ''}`} arrow placement="right">
              <IconButton
                size="small"
                onClick={() => setActiveTool(tool)}
                color={activeTool === tool ? 'primary' : 'default'}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: activeTool === tool ? 'action.selected' : 'transparent',
                }}
              >
                {icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      ))}
    </Box>
  );
}
