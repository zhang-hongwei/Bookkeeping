'use client';

import { useRef } from 'react';

import { SentimentVeryDissatisfied as RoastIcon, Download as DownloadIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

import { CARD_SIZE, PERSONA_LABELS } from './types';
import type { RoastCardStyle } from './types';
import { useRoastStore } from './store/roastStore';
import { exportCardAsImage, getRoastExportFilename } from './utils';
import { RoastInput } from './components/RoastInput';
import { AppleMinimalRoast, DarkGoldToxicRoast, MemeStyleRoast, HandwrittenRoast } from './components/card-styles';

const STYLE_COMPONENTS: Record<RoastCardStyle, React.ComponentType<{ data: any; width: number; height: number }>> = {
  'apple-minimal': AppleMinimalRoast,
  'dark-gold': DarkGoldToxicRoast,
  'meme': MemeStyleRoast,
  'handwritten': HandwrittenRoast,
};

export default function RoastGeneratorPage() {
  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());
  const { cards, isGenerating, error } = useRoastStore();

  const { width, height } = CARD_SIZE;
  const previewMaxWidth = 260;
  const scale = Math.min(previewMaxWidth / width, 1);

  const handleExport = async (index: number) => {
    const element = cardRefs.current.get(index);
    if (!element || !cards[index]) return;
    const card = cards[index];
    const filename = getRoastExportFilename(card.persona);
    await exportCardAsImage(element, filename, { scale: 2 });
  };

  const handleExportAll = async () => {
    for (let i = 0; i < cards.length; i++) {
      await handleExport(i);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <RoastIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h3" component="h1">
                吐槽生成器
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                一句话 → 四种风格吐槽 → 可分享卡片
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Main Layout: 2 columns */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '320px 1fr' }, gap: 3, alignItems: 'start' }}>
            {/* Left Panel: Input */}
            <Paper elevation={2} sx={{ p: 2.5, position: { lg: 'sticky' }, top: 24 }}>
              <Stack spacing={3}>
                {/* Input */}
                <RoastInput />

                {/* Quick prompts */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                    试试这些
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {['今天又要加班', '老板让我改第10版', '周末还要开会', '又胖了三斤'].map((prompt) => (
                      <Chip
                        key={prompt}
                        label={prompt}
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          useRoastStore.getState().setInputText(prompt);
                        }}
                        sx={{ fontSize: 12 }}
                      />
                    ))}
                  </Box>
                </Box>
              </Stack>
            </Paper>

            {/* Right Panel: Card Previews */}
            <Paper elevation={2} sx={{ p: 3, minHeight: 500 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {isGenerating && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rounded" sx={{ width: previewMaxWidth, height: previewMaxWidth, borderRadius: 2 }} />
                  ))}
                </Box>
              )}

              {!isGenerating && cards.length === 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                    输入一句话，点击吐槽一下
                    <br />
                    <Typography component="span" variant="body2" sx={{ opacity: 0.6 }}>
                      AI 会生成 4 种风格的吐槽卡片
                    </Typography>
                  </Typography>
                </Box>
              )}

              {!isGenerating && cards.length > 0 && (
                <>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                    {cards.map((card, index) => {
                      const StyleComponent = STYLE_COMPONENTS[card.cardStyle] || AppleMinimalRoast;
                      const personaLabel = PERSONA_LABELS[card.persona];

                      return (
                        <Box
                          key={`${card.persona}-${index}`}
                          sx={{
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '2px solid',
                            borderColor: 'divider',
                            position: 'relative',
                            width: width * scale + 4,
                            height: height * scale + 4,
                          }}
                        >
                          {/* Persona label */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 6,
                              left: 6,
                              zIndex: 2,
                              bgcolor: 'rgba(0,0,0,0.55)',
                              color: '#fff',
                              px: 1,
                              py: 0.25,
                              borderRadius: 0.5,
                              fontSize: 10,
                            }}
                          >
                            {personaLabel}
                          </Box>

                          {/* Download button per card */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              zIndex: 2,
                            }}
                          >
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleExport(index)}
                              sx={{ fontSize: 10, py: 0.25, px: 1, minWidth: 'auto' }}
                            >
                              下载
                            </Button>
                          </Box>

                          {/* Scaled card preview */}
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

                  {/* Export all */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleExportAll}
                      size="large"
                      sx={{ borderRadius: 2, px: 4 }}
                    >
                      下载全部
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
