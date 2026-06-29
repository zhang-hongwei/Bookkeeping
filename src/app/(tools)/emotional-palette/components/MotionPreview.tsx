'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper } from '@mui/material';

import type { MotionProfile } from '@/types/emotional-palette';

interface MotionPreviewProps {
  motion: MotionProfile;
}

export function MotionPreview({ motion }: MotionPreviewProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [iteration, setIteration] = useState(0);

  const triggerAnimation = useCallback(() => {
    setIsAnimating(true);
    setIteration((prev) => prev + 1);
  }, []);

  // Auto-loop animation
  useEffect(() => {
    const interval = setInterval(() => {
      triggerAnimation();
    }, motion.duration.slow + motion.duration.normal + 500);

    triggerAnimation();

    return () => clearInterval(interval);
  }, [motion.duration.slow, motion.duration.normal, triggerAnimation]);

  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  const rhythmLabels: Record<string, string> = {
    calm: 'Calm',
    moderate: 'Moderate',
    energetic: 'Energetic',
    intense: 'Intense',
  };

  const typeLabels: Record<string, string> = {
    gentle: 'Gentle',
    bounce: 'Bounce',
    smooth: 'Smooth',
    elastic: 'Elastic',
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
        Motion Profile
      </Typography>

      {/* Animation Demo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 60,
          mb: 2,
          bgcolor: 'action.hover',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          key={iteration}
          onAnimationEnd={handleAnimationEnd}
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            animation: isAnimating ? `slideMotion ${motion.duration.normal}ms ${motion.easing} forwards` : 'none',
            '@keyframes slideMotion': {
              '0%': { transform: 'translateX(-60px) scale(0.8)', opacity: 0.5 },
              '50%': { transform: 'translateX(0px) scale(1.1)', opacity: 1 },
              '100%': { transform: 'translateX(60px) scale(0.8)', opacity: 0.5 },
            },
          }}
        />
      </Box>

      {/* Motion Parameters */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <MotionParamRow label="Fast" value={`${motion.duration.fast}ms`} />
        <MotionParamRow label="Normal" value={`${motion.duration.normal}ms`} />
        <MotionParamRow label="Slow" value={`${motion.duration.slow}ms`} />
        <MotionParamRow label="Easing" value={motion.easing.replace('cubic-bezier', 'cb')} />
        <MotionParamRow label="Type" value={typeLabels[motion.animationType] || motion.animationType} />
        <MotionParamRow label="Rhythm" value={rhythmLabels[motion.rhythm] || motion.rhythm} />
      </Box>
    </Paper>
  );
}

function MotionParamRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontFamily: 'monospace',
          bgcolor: 'action.hover',
          px: 1,
          py: 0.25,
          borderRadius: 0.5,
          fontSize: 10,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
