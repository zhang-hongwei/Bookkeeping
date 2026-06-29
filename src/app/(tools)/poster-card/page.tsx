/**
 * Poster Card Editor - Canva-style layout
 * Top bar + Left sidebar (tabbed) + Center canvas workspace + Right property panel
 */

"use client";

import { useEffect } from 'react';
import { Box } from '@mui/material';

import { TopBar } from './components/TopBar';
import { LeftSidebar } from './components/LeftSidebar';
import { Canvas } from './components/Canvas';
import { PropertyPanel } from './components/PropertyPanel';
import { FloatingToolbar } from './components/FloatingToolbar';
import { useEditorStore, loadEditorState } from './engine/store';
import { initializePresetAssets } from './engine/assets/initialize';

export default function PosterCardPage() {
  // Initialize engine canvas and preset assets if no root exists
  useEffect(() => {
    const state = useEditorStore.getState();
    if (!state.rootNodeId) {
      // Try to load from localStorage first (auto-migrates old format)
      const persisted = loadEditorState();
      if (persisted) {
        state.setNodes(persisted.nodes, persisted.rootNodeId);
      } else {
        state.initCanvas(1080, 1440);
      }
    }
    // Initialize preset assets (fonts, shapes, tokens)
    initializePresetAssets();
  }, []);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Toolbar */}
      <TopBar />

      {/* Main Content: Sidebar + Canvas + Properties */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Left Sidebar (tabbed) */}
        <LeftSidebar />

        {/* Center: Canvas Workspace + Floating Toolbar */}
        <Box
          sx={{
            flex: '1 1 0',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            position: 'relative',
          }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <Canvas />
          </Box>

          {/* Floating toolbar above the canvas */}
          <Box sx={{ position: 'absolute', top: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
            <FloatingToolbar />
          </Box>
        </Box>

        {/* Right Property Panel - always visible */}
        <Box
          sx={{
            width: 260,
            flexShrink: 0,
            borderLeft: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'auto',
            p: 2,
          }}
        >
          <PropertyPanel />
        </Box>
      </Box>
    </Box>
  );
}
