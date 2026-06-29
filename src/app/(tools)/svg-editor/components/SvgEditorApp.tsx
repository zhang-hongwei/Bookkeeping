'use client';

import { useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import TopToolbar from './TopToolbar';
import ToolPalette from './ToolPalette';
import SvgCanvas from './Canvas/SvgCanvas';
import RightPanel from './Panels/RightPanel';
import CodePanel from './CodeEditor/CodePanel';
import { useSvgEditorStore } from '../store/svgEditorStore';

export default function SvgEditorApp() {
  const showCodePanel = useSvgEditorStore((s) => s.showCodePanel);
  const undo = useSvgEditorStore((s) => s.undo);
  const redo = useSvgEditorStore((s) => s.redo);
  const canUndo = useSvgEditorStore((s) => s.historyIndex > 0);
  const canRedo = useSvgEditorStore((s) => s.historyIndex < s.history.length - 1);
  const pathEdit = useSvgEditorStore((s) => s.pathEdit);
  const endPathEdit = useSvgEditorStore((s) => s.endPathEdit);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if focused on input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const isMod = e.metaKey || e.ctrlKey;

      // Escape — exit path edit mode or clear selection
      if (e.key === 'Escape') {
        if (pathEdit) {
          endPathEdit();
        } else {
          useSvgEditorStore.getState().clearSelection();
        }
        return;
      }

      if (isMod && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
      } else if (isMod && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && canRedo) {
        e.preventDefault();
        redo();
      }
    },
    [undo, redo, canUndo, canRedo, pathEdit, endPathEdit],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Top Toolbar */}
      <TopToolbar />

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <PanelGroup direction="horizontal" autoSaveId="svg-editor-layout">
          {/* Tool Palette */}
          <Box
            sx={{
              width: 48,
              flexShrink: 0,
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <ToolPalette />
          </Box>

          {/* Center: Canvas + Code Editor */}
          <Panel order={1} defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical" autoSaveId="svg-editor-center">
              <Panel order={1} defaultSize={showCodePanel ? 65 : 100} minSize={30}>
                <Box sx={{ height: '100%', overflow: 'hidden' }}>
                  <SvgCanvas />
                </Box>
              </Panel>

              {showCodePanel && (
                <>
                  <PanelResizeHandle
                    style={{
                      height: 4,
                      background: 'transparent',
                      cursor: 'row-resize',
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 1,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 32,
                        height: 2,
                        borderRadius: 1,
                        bgcolor: 'divider',
                      }}
                    />
                  </PanelResizeHandle>
                  <Panel order={2} defaultSize={35} minSize={15}>
                    <Box
                      sx={{
                        height: '100%',
                        borderTop: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <CodePanel />
                    </Box>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle
            style={{
              width: 4,
              background: 'transparent',
              cursor: 'col-resize',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: 1,
                transform: 'translateY(-50%)',
                width: 2,
                height: 32,
                borderRadius: 1,
                bgcolor: 'divider',
              }}
            />
          </PanelResizeHandle>

          {/* Right Panel */}
          <Panel order={2} defaultSize={22} minSize={15} maxSize={40}>
            <Box
              sx={{
                height: '100%',
                borderLeft: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                overflow: 'hidden',
              }}
            >
              <RightPanel />
            </Box>
          </Panel>
        </PanelGroup>
      </Box>
    </Box>
  );
}
