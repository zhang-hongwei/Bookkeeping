'use client';

import { useRef, useState, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useGradientStore } from '../store/gradient-store';
import { useGradientRenderer } from '../hooks/useGradientRenderer';
import { MeshInteractionLayer } from './MeshInteractionLayer';

export function GradientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = useGradientStore((s) => s.width);
  const height = useGradientStore((s) => s.height);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [contextLost, setContextLost] = useState(false);

  useGradientRenderer(canvasRef, setWebglError);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onRestored = () => {
      setContextLost(false);
    };

    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    };
  }, []);

  if (webglError) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{
          py: 4,
          px: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          WebGL2 Unavailable
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {webglError}
        </Typography>
      </Stack>
    );
  }

  return (
    <Box sx={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ maxWidth: '100%', maxHeight: '100%', display: 'block', width: '100%', height: '100%' }}
      />
      {contextLost && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(3, 7, 18, 0.8)',
            color: 'text.secondary',
            typography: 'body2',
          }}
        >
          WebGL context lost — waiting for restoration...
        </Box>
      )}
      {/* Mesh interaction layer - only visible in mesh-static mode */}
      <MeshInteractionLayer canvasRef={canvasRef} />
    </Box>
  );
}
