/**
 * PaletteWorkspace Component
 * Main container for the palette workspace page
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Compare as CompareIcon } from '@mui/icons-material';
import { usePaletteWorkspaceStore } from '../../store/paletteWorkspaceStore';
import type { DbPalette, PaletteCategory } from '@/types/palette';
import { WorkspaceHeader } from './WorkspaceHeader';
import { CategoryTabs } from './CategoryTabs';
import { WorkspacePaletteCard } from './WorkspacePaletteCard';
import { PaletteEditDialog } from './PaletteEditDialog';
import { VersionTimeline } from './VersionTimeline';
import { ComparisonModal } from './ComparisonModal';

type CategoryFilter = PaletteCategory | 'all' | 'favorites';

export function PaletteWorkspace() {
  const router = useRouter();
  const {
    palettes,
    loading,
    error,
    fetchPalettes,
    deletePalette,
    toggleFavorite,
    fetchVersions,
    restoreVersion,
    versions,
    versionsLoading,
    compareIds,
    fetchCompareData,
    clearCompare,
    addToCompare,
    removeFromCompare,
  } = usePaletteWorkspaceStore();

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPalette, setEditingPalette] = useState<DbPalette | null>(null);
  const [versionPaletteId, setVersionPaletteId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Load palettes on mount
  useEffect(() => {
    fetchPalettes();
  }, [fetchPalettes]);

  // Filtered palettes
  const filteredPalettes = palettes.filter((p) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'favorites') return p.favorite;
    return p.category === categoryFilter;
  });

  // Handlers
  const handleDelete = useCallback(
    async (id: string) => {
      const success = await deletePalette(id);
      setSnackbar(success ? 'Palette deleted' : 'Failed to delete');
    },
    [deletePalette]
  );

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      await toggleFavorite(id);
    },
    [toggleFavorite]
  );

  const handleEdit = useCallback((palette: DbPalette) => {
    setEditingPalette(palette);
    setEditDialogOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingPalette(null);
    setEditDialogOpen(true);
  }, []);

  const handleViewVersions = useCallback((paletteId: string) => {
    setVersionPaletteId(paletteId);
    fetchVersions(paletteId);
  }, [fetchVersions]);

  const handleRestoreVersion = useCallback(
    async (paletteId: string, versionNumber: number) => {
      const success = await restoreVersion(paletteId, versionNumber);
      setSnackbar(success ? `Restored v${versionNumber}` : 'Failed to restore');
    },
    [restoreVersion]
  );

  const handleCompare = useCallback(async () => {
    await fetchCompareData();
    setCompareOpen(true);
  }, [fetchCompareData]);

  const handleLoadPalette = useCallback(
    (palette: DbPalette) => {
      // Navigate to the palette detail page
      router.push(`/workspace/${palette.id}`);
    },
    [router]
  );

  return (
    <>
      {/* Header */}
      <WorkspaceHeader
        onCreate={handleCreate}
        onSearch={(search) => fetchPalettes({ search, offset: 0 })}
        onSortChange={(sortBy) => fetchPalettes({ sortBy })}
      />

      {/* Category Tabs */}
      <CategoryTabs
        value={categoryFilter}
        onChange={setCategoryFilter}
        totalCount={palettes.length}
        favoriteCount={palettes.filter((p) => p.favorite).length}
        categoryCounts={{
          brand: palettes.filter((p) => p.category === 'brand').length,
          project: palettes.filter((p) => p.category === 'project').length,
          inspiration: palettes.filter((p) => p.category === 'inspiration').length,
        }}
      />

      {/* Compare Bar */}
      {compareIds.length > 0 && (
        <Paper sx={{ p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareIcon color="action" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            Comparing ({compareIds.length}/3):
          </Typography>
          {compareIds.map((id) => {
            const p = palettes.find((p) => p.id === id);
            return (
              <Chip
                key={id}
                label={p?.name ?? id}
                size="small"
                onDelete={() => removeFromCompare(id)}
              />
            );
          })}
          <Box sx={{ flex: 1 }} />
          <Chip
            label="Compare Now"
            size="small"
            color="primary"
            onClick={handleCompare}
            icon={<CompareIcon />}
          />
          <Chip label="Clear" size="small" onClick={clearCompare} />
        </Paper>
      )}

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredPalettes.length === 0 ? (
        <Paper sx={{ py: 8, textAlign: 'center' }}>
          <Typography color="text.secondary" variant="h6">
            No palettes found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {categoryFilter === 'all'
              ? 'Create your first palette from the Image Color Extractor'
              : `No palettes in "${categoryFilter}" category`}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredPalettes.map((palette) => (
            <Grid key={palette.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <WorkspacePaletteCard
                palette={palette}
                onLoad={() => handleLoadPalette(palette)}
                onEdit={() => handleEdit(palette)}
                onDelete={() => handleDelete(palette.id)}
                onToggleFavorite={() => handleToggleFavorite(palette.id)}
                onViewVersions={() => handleViewVersions(palette.id)}
                onAddToCompare={() => addToCompare(palette.id)}
                isInCompare={compareIds.includes(palette.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Dialog */}
      <PaletteEditDialog
        open={editDialogOpen}
        palette={editingPalette}
        onClose={() => setEditDialogOpen(false)}
        onSaved={() => {
          setEditDialogOpen(false);
          fetchPalettes();
        }}
      />

      {/* Version Timeline */}
      <VersionTimeline
        open={!!versionPaletteId}
        versions={versions}
        loading={versionsLoading}
        paletteName={
          palettes.find((p) => p.id === versionPaletteId)?.name ?? 'Palette'
        }
        onClose={() => setVersionPaletteId(null)}
        onRestore={(versionNumber) => {
          if (versionPaletteId) {
            handleRestoreVersion(versionPaletteId, versionNumber);
          }
        }}
      />

      {/* Comparison Modal */}
      <ComparisonModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
      />

      {/* Snackbar */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbar(null)}>
          {snackbar}
        </Alert>
      </Snackbar>

      {/* Error */}
      {error && (
        <Alert severity="error" onClose={() => usePaletteWorkspaceStore.getState().clearError()}>
          {error}
        </Alert>
      )}
    </>
  );
}
