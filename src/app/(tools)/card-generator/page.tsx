'use client';

import { useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Divider,
  Button,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import { Style as StyleIcon, Download as DownloadIcon } from '@mui/icons-material';

import { CARD_STYLES, PLATFORM_SIZES_LIST } from './presets';
import type { CardData, PlatformSize } from './types';
import { useCardStore, selectPlatformConfig } from './store/cardStore';
import { exportCardAsImage } from './utils';
import { MinimalCard } from './components/card-styles/MinimalCard';
import { EmotionalCard } from './components/card-styles/EmotionalCard';
import { TechCard } from './components/card-styles/TechCard';
import { BusinessCard } from './components/card-styles/BusinessCard';
import { DiaryCard } from './components/card-styles/DiaryCard';
import { PosterCard } from './components/card-styles/PosterCard';
import { CardInput } from './components/CardInput';

const STYLE_COMPONENTS = {
  minimal: MinimalCard,
  emotional: EmotionalCard,
  tech: TechCard,
  business: BusinessCard,
  diary: DiaryCard,
  poster: PosterCard,
};

export default function CardGeneratorPage() {
  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());
  const {
    cards,
    isGenerating,
    error,
    platformSize,
    setPlatformSize,
    activeCardIndex,
    setActiveCard,
  } = useCardStore();

  const sizeConfig = useCardStore(selectPlatformConfig);
  const { width, height } = sizeConfig;

  const handleExport = async (index: number) => {
    const element = cardRefs.current.get(index);
    if (!element || !cards[index]) return;
    const card = cards[index];
    const filename = `card-${card.styleId}-${width}x${height}`;
    await exportCardAsImage(element, filename, { scale: 2 });
  };

  const handleExportAll = async () => {
    for (let i = 0; i < cards.length; i++) {
      await handleExport(i);
    }
  };

  const previewMaxWidth = 260;
  const scale = Math.min(previewMaxWidth / width, 1);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <StyleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h3" component="h1">
                AI 卡片生成器
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                一句话 → 有情绪、有设计、有表达的卡片
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Main Layout */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '280px 1fr 280px' }, gap: 3, alignItems: 'start' }}>
            {/* Left Panel: Input */}
            <Paper elevation={2} sx={{ p: 2.5, position: { lg: 'sticky' }, top: 24 }}>
              <CardInput />
            </Paper>

            {/* Center: Card Previews */}
            <Paper elevation={2} sx={{ p: 3, minHeight: 500 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {isGenerating && (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} variant="rounded" sx={{ width: 260, height: 260 * (height / width), borderRadius: 2 }} />
                  ))}
                </Box>
              )}

              {!isGenerating && cards.length === 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                    输入一句话，点击生成卡片
                    <br />
                    <Typography component="span" variant="body2" sx={{ opacity: 0.6 }}>
                      AI 会自动增强文案并生成 3 种风格
                    </Typography>
                  </Typography>
                </Box>
              )}

              {!isGenerating && cards.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {cards.map((card, index) => {
                    const styleConfig = CARD_STYLES[card.styleId];
                    const StyleComponent = STYLE_COMPONENTS[card.styleId] || MinimalCard;

                    return (
                      <Box
                        key={`${card.styleId}-${index}`}
                        onClick={() => setActiveCard(index)}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '2px solid',
                          borderColor: activeCardIndex === index ? 'primary.main' : 'divider',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'primary.light',
                            transform: 'translateY(-4px)',
                            boxShadow: 4,
                          },
                          position: 'relative',
                          width: width * scale + 4,
                          height: height * scale + 4,
                        }}
                      >
                        <Box sx={{ position: 'absolute', top: 6, left: 6, zIndex: 2, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', px: 1, py: 0.25, borderRadius: 0.5, fontSize: 10 }}>
                          {styleConfig?.label}
                        </Box>
                        <Box sx={{ width: width * scale, height: height * scale, overflow: 'hidden' }}>
                          <div
                            ref={(el) => { if (el) cardRefs.current.set(index, el); }}
                            data-card-index={index}
                            style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}
                          >
                            <StyleComponent data={card} width={width} height={height} />
                          </div>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Paper>

            {/* Right Panel: Controls */}
            <Paper elevation={2} sx={{ p: 2.5, position: { lg: 'sticky' }, top: 24 }}>
              <Stack spacing={3}>
                {/* Platform Size */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    平台尺寸
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {PLATFORM_SIZES_LIST.map((size) => (
                      <Chip
                        key={size.id}
                        label={`${size.label} ${size.ratio}`}
                        size="small"
                        variant={platformSize === size.id ? 'filled' : 'outlined'}
                        color={platformSize === size.id ? 'primary' : 'default'}
                        onClick={() => setPlatformSize(size.id as PlatformSize)}
                        sx={{ fontSize: 12 }}
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {sizeConfig.width} × {sizeConfig.height}
                  </Typography>
                </Box>

                <Divider />

                {/* Export */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    导出
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<DownloadIcon />}
                    onClick={handleExportAll}
                    disabled={cards.length === 0}
                    size="large"
                  >
                    下载全部
                  </Button>
                </Box>

                {cards.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {cards.map((card, index) => (
                      <Button
                        key={card.styleId}
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                        onClick={() => handleExport(index)}
                        sx={{ fontSize: 11 }}
                      >
                        {card.styleId}
                      </Button>
                    ))}
                  </Box>
                )}
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
