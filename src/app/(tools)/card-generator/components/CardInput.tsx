'use client';

import { Box, Button, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import { useCardStore } from '../store/cardStore';

const MAX_CHARS = 200;

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    fontSize: '1rem',
    '& textarea': {
      minHeight: '80px !important',
    },
  },
}));

export function CardInput() {
  const { inputText, setInputText, generateCards, isGenerating } = useCardStore();
  const charCount = inputText.length;
  const isOverLimit = charCount > MAX_CHARS;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (inputText.trim() && !isGenerating && !isOverLimit) {
        generateCards();
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
        输入一句话
      </Typography>

      <StyledTextField
        multiline
        fullWidth
        placeholder="今天真的很累，但还是坚持了..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isGenerating}
        minRows={3}
        maxRows={5}
        slotProps={{
          inputLabel: { shrink: true },
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
        onClick={generateCards}
        disabled={!inputText.trim() || isGenerating || isOverLimit}
        sx={{
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 600,
          borderRadius: 2,
        }}
      >
        {isGenerating ? '生成中...' : '生成卡片'}
      </Button>
    </Box>
  );
}
