'use client';

import { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Stack,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import type { GradientPreset } from '../types';
import { copyToClipboard, downloadGradient } from '../utils';

interface GradientCardProps {
  gradient: GradientPreset;
  onEdit: (gradient: GradientPreset) => void;
  onTagClick: (tag: string) => void;
}

export function GradientCard({ gradient, onEdit, onTagClick }: GradientCardProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(gradient.css);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [gradient.css]);

  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    downloadGradient(gradient);
  }, [gradient]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(gradient);
  }, [gradient, onEdit]);

  const handleTagClick = useCallback((tag: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onTagClick(tag);
  }, [onTagClick]);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered ? '0 10px 30px rgba(0,0,0,0.12)' : undefined,
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient Preview */}
      <Box
        sx={{
          height: 140,
          background: gradient.css,
          position: 'relative',
          borderTopLeftRadius: 1,
          borderTopRightRadius: 1,
        }}
      >
        {/* Action Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        >
          <Tooltip title={copied ? 'Copied!' : 'Copy CSS'}>
            <IconButton
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
              }}
              onClick={handleCopy}
            >
              <CopyIcon fontSize="small" color={copied ? 'success' : 'action'} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download CSS">
            <IconButton
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
              }}
              onClick={handleDownload}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
              }}
              onClick={handleEdit}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Gradient Info */}
      <CardContent sx={{ flex: 1, pt: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom noWrap>
          {gradient.name}
        </Typography>
        {gradient.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {gradient.description}
          </Typography>
        )}

        {/* Tags */}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {gradient.tags.slice(0, 3).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              onClick={handleTagClick(tag)}
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          ))}
          {gradient.tags.length > 3 && (
            <Chip
              label={`+${gradient.tags.length - 3}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
