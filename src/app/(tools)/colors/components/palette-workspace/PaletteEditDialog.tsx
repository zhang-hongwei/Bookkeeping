/**
 * PaletteEditDialog Component
 * Dialog for creating and editing palette metadata
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import type { DbPalette, PaletteCategory } from '@/types/palette';
import { usePaletteWorkspaceStore } from '../../store/paletteWorkspaceStore';

const SUGGESTED_TAGS = ['Warm', 'Cool', 'Pastel', 'Vibrant', 'Dark', 'Light', 'Nature', 'Tech', 'Retro', 'Minimal', 'Luxury', 'Corporate'];

interface PaletteEditDialogProps {
  open: boolean;
  palette: DbPalette | null; // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

export function PaletteEditDialog({ open, palette, onClose, onSaved }: PaletteEditDialogProps) {
  const { createPalette, updatePalette } = usePaletteWorkspaceStore();
  const isEdit = !!palette;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PaletteCategory>('project');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (palette) {
        setName(palette.name);
        setDescription(palette.description ?? '');
        setCategory(palette.category);
        setTags(palette.tags ?? []);
      } else {
        setName('');
        setDescription('');
        setCategory('project');
        setTags([]);
      }
      setTagInput('');
    }
  }, [open, palette]);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleToggleSuggestedTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    try {
      if (isEdit && palette) {
        await updatePalette(palette.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          category,
          tags,
        });
      }
      // Note: create mode is typically handled by the color extractor save action
      // This dialog focuses on editing existing palettes
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {isEdit ? 'Edit Palette' : 'New Palette'}
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            size="small"
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            size="small"
            placeholder="What is this palette for?"
          />

          <FormControl size="small" fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value as PaletteCategory)}
            >
              <MenuItem value="brand">Brand</MenuItem>
              <MenuItem value="project">Project</MenuItem>
              <MenuItem value="inspiration">Inspiration</MenuItem>
            </Select>
          </FormControl>

          {/* Tags */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Tags
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 1, gap: 0.5 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onDelete={() => setTags(tags.filter((t) => t !== tag))}
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                sx={{ flex: 1 }}
              />
              <Button size="small" onClick={handleAddTag} disabled={!tagInput.trim()}>
                <AddIcon fontSize="small" />
              </Button>
            </Stack>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1, gap: 0.5 }}>
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  onClick={() => handleToggleSuggestedTag(tag)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!name.trim() || saving}
        >
          {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
