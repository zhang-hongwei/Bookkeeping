'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Chip,
  Typography,
  InputAdornment,
} from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon, Send as SendIcon } from '@mui/icons-material';

import { MOOD_KEYWORDS } from '@/types/emotional-palette';
import type { MoodCategory } from '@/types/emotional-palette';
import { useEmotionalPaletteStore } from '../store/emotionalPaletteStore';

const QUICK_MOODS = [
  { label: '深夜食堂', category: 'warm' as MoodCategory },
  { label: '赛博禅意', category: 'cool' as MoodCategory },
  { label: '焦虑缓解', category: 'calm' as MoodCategory },
  { label: '热带风暴', category: 'energetic' as MoodCategory },
  { label: '森林浴', category: 'calm' as MoodCategory },
  { label: 'digital detox', category: 'cool' as MoodCategory },
  { label: '壁炉旁', category: 'warm' as MoodCategory },
  { label: 'creative rush', category: 'energetic' as MoodCategory },
];

const CATEGORY_COLORS: Record<MoodCategory, 'warning' | 'info' | 'error' | 'success'> = {
  warm: 'warning',
  cool: 'info',
  energetic: 'error',
  calm: 'success',
};

export function MoodInput() {
  const { prompt, setPrompt, generate, isGenerating } = useEmotionalPaletteStore();
  const [showAllKeywords, setShowAllKeywords] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      generate();
    }
  };

  const visibleMoods = showAllKeywords
    ? Object.values(MOOD_KEYWORDS).flat()
    : QUICK_MOODS.map((m) => m.label);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Mood Keyword
        </Typography>
      </Box>

      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={4}
        placeholder="Enter a mood keyword... e.g. 深夜食堂, cyber zen, anxiety relief"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end" sx={{ alignSelf: 'flex-end' }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={generate}
                  disabled={!prompt.trim() || isGenerating}
                  endIcon={<SendIcon sx={{ fontSize: 16 }} />}
                  sx={{ minWidth: 0, px: 1.5 }}
                >
                  {isGenerating ? '...' : 'Go'}
                </Button>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiInputBase-root': { alignItems: 'flex-start' },
        }}
      />

      <Typography variant="caption" color="text.secondary">
        Ctrl + Enter to generate
      </Typography>

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Quick moods
          </Typography>
          <Button
            size="small"
            variant="text"
            onClick={() => setShowAllKeywords(!showAllKeywords)}
            sx={{ fontSize: 11, minWidth: 0, py: 0 }}
          >
            {showAllKeywords ? 'Less' : 'More'}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {(showAllKeywords ? QUICK_MOODS : QUICK_MOODS).map((mood) => (
            <Chip
              key={mood.label}
              label={mood.label}
              size="small"
              variant="outlined"
              color={CATEGORY_COLORS[mood.category]}
              onClick={() => {
                setPrompt(mood.label);
                // Auto-generate on chip click
                setTimeout(() => {
                  useEmotionalPaletteStore.getState().generate();
                }, 0);
              }}
              sx={{ fontSize: 12 }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
