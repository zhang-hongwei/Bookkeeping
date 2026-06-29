'use client';

import { useState, useRef, useCallback, type DragEvent } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useGradientStore } from '../store/gradient-store';
import type { OklchColour, ColourStop } from '../types/gradient';

interface ExtractedColour {
  hex: string;
  oklch: OklchColour;
}

export function ImageUploader() {
  const setColours = useGradientStore((s) => s.setColours);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const extractColours = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('/api/gradiweave/extract-colours', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Extraction failed');
        }

        const { colours } = (await res.json()) as { colours: ExtractedColour[] };

        const stops: ColourStop[] = colours.map((c) => ({
          id: crypto.randomUUID(),
          oklch: c.oklch,
          hex: c.hex,
          displayFormat: 'oklch' as const,
          locked: false,
        }));

        if (stops.length > 0) {
          setColours(stops);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Extraction failed');
      } finally {
        setLoading(false);
      }
    },
    [setColours],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      extractColours(file);
    },
    [extractColours],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <Stack spacing={1}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '0.7rem',
          color: 'text.secondary',
        }}
      >
        Extract from Image
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: dragOver ? 'primary.main' : 'divider',
          bgcolor: dragOver ? 'primary.dark' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'text.primary',
            bgcolor: 'action.hover',
          },
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 1,
            py: 3,
            px: 2,
          }}
        >
          <CloudUploadIcon
            sx={{
              fontSize: 32,
              color: dragOver ? 'primary.main' : 'text.disabled',
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: dragOver ? 'primary.main' : 'text.secondary',
            }}
          >
            {loading ? 'Extracting colours...' : 'Drop image or click to browse'}
          </Typography>
        </Box>
      </Paper>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <Alert severity="error" sx={{ fontSize: '0.75rem' }}>
          {error}
        </Alert>
      )}
    </Stack>
  );
}
