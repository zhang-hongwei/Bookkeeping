'use client';

import { Box, Button, TextField, Typography } from '@mui/material';

import { useRoastStore } from '../store/roastStore';

const MAX_CHARS = 100;

export function RoastInput() {
  const { inputText, setInputText, generateRoasts, isGenerating } = useRoastStore();
  const charCount = inputText.length;
  const isOverLimit = charCount > MAX_CHARS;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (inputText.trim() && !isGenerating && !isOverLimit) {
        generateRoasts();
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
        输入一句话
      </Typography>

      <TextField
        fullWidth
        placeholder="今天又要加班..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isGenerating}
        slotProps={{
          inputLabel: { shrink: true },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            fontSize: '1rem',
          },
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="caption"
          sx={{
            color: isOverLimit ? 'error.main' : 'text.disabled',
            fontSize: 12,
          }}
        >
          {charCount}/{MAX_CHARS}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 11 }}>
          Ctrl+Enter 生成
        </Typography>
      </Box>

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={generateRoasts}
        disabled={!inputText.trim() || isGenerating || isOverLimit}
        sx={{
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 600,
          borderRadius: 2,
        }}
      >
        {isGenerating ? '生成中...' : '吐槽一下'}
      </Button>
    </Box>
  );
}
