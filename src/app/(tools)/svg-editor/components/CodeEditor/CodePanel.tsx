'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useSvgEditorStore } from '../../store/svgEditorStore';
import { serializeToSvgStringPretty } from '../../lib/svg-serializer';

export default function CodePanel() {
  const document = useSvgEditorStore((s) => s.document);
  const importSvg = useSvgEditorStore((s) => s.importSvg);
  const pushHistory = useSvgEditorStore((s) => s.pushHistory);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isUpdatingFromCode = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Update code when document changes (visual → code)
  useEffect(() => {
    if (isUpdatingFromCode.current) return;
    try {
      const svgString = serializeToSvgStringPretty(document);
      setCode(svgString);
      setError(null);
    } catch (err) {
      console.error('Serialization error:', err);
    }
  }, [document]);

  // Handle code changes (code → visual)
  const handleCodeChange = useCallback(
    (value: string) => {
      setCode(value);
      isUpdatingFromCode.current = true;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        try {
          importSvg(value);
          pushHistory('Code edit');
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Invalid SVG');
        }
        setTimeout(() => {
          isUpdatingFromCode.current = false;
        }, 100);
      }, 500);
    },
    [importSvg, pushHistory],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1,
          py: 0.25,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          SVG Code
        </Typography>
        {error && (
          <Typography variant="caption" color="error" sx={{ ml: 1 }}>
            Error: {error.slice(0, 60)}
          </Typography>
        )}
      </Box>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Box
          component="textarea"
          value={code}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleCodeChange(e.target.value)}
          spellCheck={false}
          sx={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            resize: 'none',
            p: 1,
            fontFamily: 'monospace',
            fontSize: 12,
            lineHeight: 1.5,
            bgcolor: 'background.paper',
            color: 'text.primary',
            tabSize: 2,
          }}
        />
      </Box>
    </Box>
  );
}
