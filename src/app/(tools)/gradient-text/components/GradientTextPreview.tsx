/**
 * Gradient Text Preview & CSS Output
 * Center panel with live preview and code output tabs
 */

'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import { ContentCopy as CopyIcon, Check as CheckIcon } from '@mui/icons-material';
import { useGradientTextStore } from '@/store/gradient-text';
import { buildTextStyle, generateCSS, generateFullCSS, generateMUISx, generateReactStyle, generateTailwind } from '../utils';

export function GradientTextPreview() {
  const config = useGradientTextStore((s) => s.config);
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const textStyle = useMemo(() => buildTextStyle(config), [config]);

  const codeOutputs = useMemo(() => [
    { label: 'CSS', code: generateCSS(config) },
    { label: 'Full CSS', code: generateFullCSS(config) },
    { label: 'MUI sx', code: generateMUISx(config) },
    { label: 'React', code: generateReactStyle(config) },
    { label: 'Tailwind', code: generateTailwind(config) },
  ], [config]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Live Preview */}
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          backgroundColor: config.previewBgColor,
          borderRadius: 3,
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.3s',
          overflow: 'hidden',
        }}
      >
        <Box sx={textStyle}>
          {config.text}
        </Box>
      </Paper>

      {/* CSS Output */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5, textTransform: 'none', fontSize: '0.8rem' } }}
        >
          {codeOutputs.map((o) => (
            <Tab key={o.label} label={o.label} />
          ))}
        </Tabs>

        <Box sx={{ position: 'relative', p: 2, backgroundColor: 'action.hover' }}>
          <Tooltip title="Copy code">
            <IconButton
              size="small"
              onClick={() => handleCopy(codeOutputs[activeTab].code)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Box
            component="pre"
            sx={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              lineHeight: 1.6,
              color: 'text.primary',
              pr: 4,
            }}
          >
            {codeOutputs[activeTab].code}
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ py: 0.5 }}>
          Copied to clipboard
        </Alert>
      </Snackbar>
    </Box>
  );
}
