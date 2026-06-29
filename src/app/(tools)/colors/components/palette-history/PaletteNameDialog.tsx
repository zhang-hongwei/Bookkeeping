/**
 * PaletteNameDialog Component
 * Dialog for naming a new palette
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Box,
  Typography,
  Stack,
} from '@mui/material';

interface PaletteNameDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, tags: string[]) => void;
  defaultName?: string;
}

const SUGGESTED_TAGS = ['Warm', 'Cool', 'Pastel', 'Vibrant', 'Dark', 'Light', 'Nature', 'Tech', 'Retro'];

export function PaletteNameDialog({
  open,
  onClose,
  onSave,
  defaultName = 'My Palette',
}: PaletteNameDialogProps) {
  const [name, setName] = useState(defaultName);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setTags([]);
      setCustomTag('');
    }
  }, [open, defaultName]);

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddCustomTag = () => {
    const trimmed = customTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setCustomTag('');
    }
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), tags);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Save Palette</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Name input */}
          <TextField
            label="Palette Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
            placeholder="Enter a name for this palette"
          />

          {/* Tags */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Tags (optional)
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  color="primary"
                  size="small"
                />
              ))}
            </Stack>

            {/* Suggested tags */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Suggested:
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleAddTag(tag)}
                    variant="outlined"
                    size="small"
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Custom tag input */}
            <TextField
              size="small"
              placeholder="Add custom tag"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
              sx={{ mr: 1 }}
            />
            <Button
              size="small"
              onClick={handleAddCustomTag}
              disabled={!customTag.trim()}
            >
              Add
            </Button>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!name.trim()}
        >
          Save Palette
        </Button>
      </DialogActions>
    </Dialog>
  );
}
