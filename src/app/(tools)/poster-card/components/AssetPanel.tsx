'use client';

import { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import {
  CropSquare as ShapeIcon,
  Image as ImageIcon,
  TextFields as FontIcon,
  ViewQuilt as TemplateIcon,
  EmojiObjects as IconIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { ImageAssetPanel } from './asset-panels/ImageAssetPanel';
import { FontAssetPanel } from './asset-panels/FontAssetPanel';
import { ShapeAssetPanel } from './asset-panels/ShapeAssetPanel';
import { TemplateAssetPanel } from './asset-panels/TemplateAssetPanel';
import { IconAssetPanel } from './asset-panels/IconAssetPanel';

type AssetCategoryId = 'shapes' | 'images' | 'fonts' | 'templates' | 'icons';

const ASSET_CATEGORIES: { id: AssetCategoryId; icon: typeof ShapeIcon; label: string; color: string }[] = [
  { id: 'shapes', icon: ShapeIcon, label: 'Shapes', color: '#6366f1' },
  { id: 'images', icon: ImageIcon, label: 'Images', color: '#10b981' },
  { id: 'icons', icon: IconIcon, label: 'Icons', color: '#8b5cf6' },
  { id: 'fonts', icon: FontIcon, label: 'Fonts', color: '#f59e0b' },
  { id: 'templates', icon: TemplateIcon, label: 'Templates', color: '#ec4899' },
];

export function AssetPanel() {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategoryId | null>(null);

  if (!selectedCategory) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        {ASSET_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Box
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                p: 2,
                pb: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: 'action.hover',
                transition: 'all 0.15s',
                '&:hover': {
                  bgcolor: 'action.selected',
                  outline: '2px solid',
                  outlineColor: cat.color,
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: `${cat.color}15`,
                  color: cat.color,
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {cat.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  }

  const catLabel = ASSET_CATEGORIES.find((c) => c.id === selectedCategory)?.label ?? selectedCategory;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
        <IconButton size="small" onClick={() => setSelectedCategory(null)}>
          <ArrowBackIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {catLabel}
        </Typography>
      </Box>

      {selectedCategory === 'shapes' && <ShapeAssetPanel />}
      {selectedCategory === 'images' && <ImageAssetPanel />}
      {selectedCategory === 'icons' && <IconAssetPanel />}
      {selectedCategory === 'fonts' && <FontAssetPanel />}
      {selectedCategory === 'templates' && <TemplateAssetPanel />}
    </Box>
  );
}
