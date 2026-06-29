/**
 * ContrastBadge Component
 * Display WCAG contrast level badge
 */

'use client';

import React from 'react';
import { Chip, Tooltip, Box } from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, Warning as WarningIcon } from '@mui/icons-material';
import type { WCAGLevel } from '../../types';

interface ContrastBadgeProps {
  ratio: number;
  level: WCAGLevel;
  size?: 'small' | 'medium';
  showRatio?: boolean;
}

export function ContrastBadge({
  ratio,
  level,
  size = 'small',
  showRatio = true,
}: ContrastBadgeProps) {
  const { color, icon, label, description } = getBadgeInfo(level);

  return (
    <Tooltip
      title={
        <Box>
          <Box sx={{ fontWeight: 600 }}>{description}</Box>
          <Box sx={{ fontSize: 12, opacity: 0.8 }}>Contrast ratio: {ratio}:1</Box>
        </Box>
      }
      arrow
    >
      <Chip
        icon={icon}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {level}
            {showRatio && <Box component="span" sx={{ opacity: 0.7, fontSize: 10 }}>({ratio}:1)</Box>}
          </Box>
        }
        size={size}
        sx={{
          bgcolor: `${color}.main`,
          color: `${color}.contrastText`,
          fontWeight: 600,
          '& .MuiChip-icon': {
            color: 'inherit',
          },
        }}
      />
    </Tooltip>
  );
}

interface BadgeInfo {
  color: 'success' | 'warning' | 'error';
  icon: React.ReactElement;
  label: string;
  description: string;
}

function getBadgeInfo(level: WCAGLevel): BadgeInfo {
  switch (level) {
    case 'AAA':
      return {
        color: 'success',
        icon: <CheckIcon />,
        label: 'AAA',
        description: 'Enhanced contrast (7:1) - Passes all WCAG levels',
      };
    case 'AA':
      return {
        color: 'success',
        icon: <CheckIcon />,
        label: 'AA',
        description: 'Minimum contrast (4.5:1) - Passes normal text',
      };
    case 'AA Large':
      return {
        color: 'warning',
        icon: <WarningIcon />,
        label: 'AA Large',
        description: 'Large text only (3:1) - Passes large text',
      };
    case 'AAA Large':
      return {
        color: 'warning',
        icon: <WarningIcon />,
        label: 'AAA Large',
        description: 'Enhanced large text (4.5:1) - Passes large text AAA',
      };
    default:
      return {
        color: 'error',
        icon: <CloseIcon />,
        label: 'Fail',
        description: 'Fails WCAG requirements',
      };
  }
}
