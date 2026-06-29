'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Grid,
  Paper,
} from '@mui/material';
import { Search as SearchIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import type { GradientCategory, GradientPreset } from './types';
import { GRADIENT_PRESETS, ALL_TAGS } from './presets';
import { getCategoryInfo, copyToClipboard, filterGradientsByCategory, searchGradients, filterGradientsByTag } from './utils';
import { useGradientEditor } from './hooks/useGradientEditor';
import { CategoryTabs } from './components/CategoryTabs';
import { GradientCard } from './components/GradientCard';
import { GradientEditor } from './components/GradientEditor';

export default function GradientCollectionPage() {
  const [activeCategory, setActiveCategory] = useState<GradientCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  const {
    editingGradient,
    localStops,
    localAngle,
    localType,
    previewCss,
    startEdit,
    updateStop,
    addStop,
    removeStop,
    updateAngle,
    updateType,
    resetEdit,
    cancelEdit,
    applyChanges,
  } = useGradientEditor();

  const categories = getCategoryInfo();

  // Filter gradients
  const filteredGradients = filterGradientsByTag(
    searchGradients(
      filterGradientsByCategory(GRADIENT_PRESETS, activeCategory),
      searchTerm
    ),
    selectedTag
  );

  const handleCopy = useCallback(async (css: string) => {
    const success = await copyToClipboard(css);
    if (success) {
      setCopiedMessage('CSS copied to clipboard!');
      setTimeout(() => setCopiedMessage(null), 2000);
    }
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    setSelectedTag((prev) => (prev === tag ? '' : tag));
  }, []);

  const handleEditGradient = useCallback((gradient: GradientPreset) => {
    startEdit(gradient);
  }, [startEdit]);

  const handleApplyEdit = useCallback(async () => {
    const result = applyChanges();
    if (result) {
      const success = await copyToClipboard(result.css);
      if (success) {
        setCopiedMessage('Edited gradient CSS copied to clipboard!');
      }
      cancelEdit();
    }
  }, [applyChanges, cancelEdit]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
            Gradient Collection
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px' }}>
            Explore {GRADIENT_PRESETS.length} curated gradients. Click to copy CSS, edit, or download.
          </Typography>
        </Box>

        {/* Filters Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 4,
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
          }}
        >
          {/* Category Tabs */}
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />

          {/* Search and Tag Filter */}
          <Box sx={{ mt: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <TextField
              placeholder="Search gradients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 2 }}
            />
          </Box>

          {/* Tag Cloud */}
          {selectedTag || searchTerm ? (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {selectedTag && (
                  <Typography
                    variant="body2"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: 1,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                    onClick={() => setSelectedTag('')}
                  >
                    {selectedTag} ×
                  </Typography>
                )}
                {searchTerm && (
                  <Typography
                    variant="body2"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      bgcolor: 'secondary.main',
                      color: 'secondary.contrastText',
                      borderRadius: 1,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                    onClick={() => setSearchTerm('')}
                  >
                    Search: "{searchTerm}" ×
                  </Typography>
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                Popular tags:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                {ALL_TAGS.slice(0, 12).map((tag) => (
                  <Typography
                    key={tag}
                    variant="body2"
                    sx={{
                      px: 1,
                      py: 0.25,
                      bgcolor: 'action.hover',
                      borderRadius: 0.5,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    }}
                    onClick={() => setSelectedTag(tag)}
                  >
                    {tag}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Paper>

        {/* Results Count */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {filteredGradients.length} gradient{filteredGradients.length !== 1 ? 's' : ''} found
        </Typography>

        {/* Gradient Grid */}
        <Grid container spacing={3}>
          {filteredGradients.map((gradient) => (
            <Grid key={gradient.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <GradientCard
                gradient={gradient}
                onEdit={handleEditGradient}
                onTagClick={handleTagClick}
              />
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {filteredGradients.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 12,
            }}
          >
            <Typography variant="h6">No gradients found</Typography>
            <Typography color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        )}

        {/* Gradient Editor Dialog */}
        <GradientEditor
          open={!!editingGradient}
          gradient={editingGradient}
          stops={localStops}
          angle={localAngle}
          type={localType}
          previewCss={previewCss}
          onUpdateStop={updateStop}
          onAddStop={addStop}
          onRemoveStop={removeStop}
          onUpdateAngle={updateAngle}
          onUpdateType={updateType}
          onReset={resetEdit}
          onApply={handleApplyEdit}
          onCancel={cancelEdit}
        />

        {/* Copy Success Toast */}
        <Snackbar
          open={!!copiedMessage}
          autoHideDuration={2000}
          onClose={() => setCopiedMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" icon={<CopyIcon />} sx={{ width: '100%' }}>
            {copiedMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
