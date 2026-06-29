'use client';

import { Box, Tabs, Tab } from '@mui/material';
import {
  Tune as PropertiesIcon,
  Layers as LayersIcon,
  AccountTree as ElementsIcon,
  Code as AttributesIcon,
} from '@mui/icons-material';
import { useSvgEditorStore } from '../../store/svgEditorStore';
import PropertiesPanel from './PropertiesPanel';
import LayersPanel from './LayersPanel';
import type { RightPanelTab } from '../../types';

const TABS: { value: RightPanelTab; label: string; icon: React.ReactElement }[] = [
  { value: 'properties', label: 'Properties', icon: <PropertiesIcon sx={{ fontSize: 18 }} /> },
  { value: 'layers', label: 'Layers', icon: <LayersIcon sx={{ fontSize: 18 }} /> },
  { value: 'elements', label: 'Elements', icon: <ElementsIcon sx={{ fontSize: 18 }} /> },
  { value: 'attributes', label: 'Attributes', icon: <AttributesIcon sx={{ fontSize: 18 }} /> },
];

export default function RightPanel() {
  const activeTab = useSvgEditorStore((s) => s.rightPanelTab);
  const setRightPanelTab = useSvgEditorStore((s) => s.setRightPanelTab);
  const selection = useSvgEditorStore((s) => s.selection);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setRightPanelTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 40,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { minHeight: 40, minWidth: 'auto', px: 1.5, py: 0.5 },
        }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            icon={tab.icon}
            iconPosition="start"
            label={tab.label}
            sx={{ typography: 'caption', gap: 0.5 }}
          />
        ))}
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {activeTab === 'properties' && <PropertiesPanel />}
        {activeTab === 'layers' && <LayersPanel />}
        {activeTab === 'elements' && (
          <ElementsTreePanel selection={selection} />
        )}
        {activeTab === 'attributes' && <AttributesPanel />}
      </Box>
    </Box>
  );
}

import { findElementById, flattenElements } from '../../lib/svg-parser';
import type { SvgElementData } from '../../types';

function ElementsTreePanel({ selection }: { selection: { elementIds: string[] } }) {
  const document = useSvgEditorStore((s) => s.document);
  const selectElements = useSvgEditorStore((s) => s.selectElements);

  const elements = flattenElements(document).filter((el) => el.tag !== 'svg');

  return (
    <Box sx={{ fontSize: 12 }}>
      {elements.map((el) => (
        <Box
          key={el.id}
          onClick={() => selectElements([el.id])}
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 0.5,
            cursor: 'pointer',
            bgcolor: selection.elementIds.includes(el.id) ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
            fontFamily: 'monospace',
          }}
        >
          &lt;{el.tag}&gt;
          {el.attrs.id ? ` #${el.attrs.id}` : ''}
        </Box>
      ))}
      {elements.length === 0 && (
        <Box sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
          No elements
        </Box>
      )}
    </Box>
  );
}

function AttributesPanel() {
  const document = useSvgEditorStore((s) => s.document);
  const selection = useSvgEditorStore((s) => s.selection);
  const updateElementAttrs = useSvgEditorStore((s) => s.updateElementAttrs);
  const pushHistory = useSvgEditorStore((s) => s.pushHistory);

  if (selection.elementIds.length !== 1) {
    return (
      <Box sx={{ color: 'text.secondary', textAlign: 'center', py: 2, fontSize: 12 }}>
        Select an element to edit attributes
      </Box>
    );
  }

  const el = findElementById(document, selection.elementIds[0]);
  if (!el) return null;

  return (
    <Box sx={{ fontSize: 12 }}>
      <Box sx={{ fontWeight: 'bold', mb: 1 }}>&lt;{el.tag}&gt; attributes</Box>
      {Object.entries(el.attrs).map(([key, value]) => (
        <Box key={key} sx={{ display: 'flex', gap: 0.5, mb: 0.5, alignItems: 'center' }}>
          <Box
            component="input"
            value={key}
            readOnly
            sx={{
              flex: 1,
              px: 0.5,
              py: 0.25,
              border: 1,
              borderColor: 'divider',
              borderRadius: 0.5,
              bgcolor: 'action.hover',
              fontSize: 11,
              fontFamily: 'monospace',
              outline: 'none',
            }}
          />
          <Box
            component="input"
            defaultValue={value}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              const newVal = e.target.value;
              if (newVal !== value) {
                updateElementAttrs(el.id, { [key]: newVal });
                pushHistory(`Change ${key}`);
              }
            }}
            sx={{
              flex: 1.5,
              px: 0.5,
              py: 0.25,
              border: 1,
              borderColor: 'divider',
              borderRadius: 0.5,
              fontSize: 11,
              fontFamily: 'monospace',
              outline: 'none',
              '&:focus': { borderColor: 'primary.main' },
            }}
          />
        </Box>
      ))}
    </Box>
  );
}
