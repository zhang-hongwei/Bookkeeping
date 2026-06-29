/**
 * VersionTimeline Component
 * Dialog showing palette version history with restore capability
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Stack,
  Typography,
  Box,
  Paper,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Restore as RestoreIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import type { DbPaletteVersion } from '@/types/palette';

interface VersionTimelineProps {
  open: boolean;
  versions: DbPaletteVersion[];
  loading: boolean;
  paletteName: string;
  onClose: () => void;
  onRestore: (versionNumber: number) => void;
}

export function VersionTimeline({
  open,
  versions,
  loading,
  paletteName,
  onClose,
  onRestore,
}: VersionTimelineProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <HistoryIcon />
            <Typography variant="h6">Version History</Typography>
          </Stack>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {paletteName}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : versions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No version history yet</Typography>
            <Typography variant="caption" color="text.secondary">
              Versions are created when you update palette colors
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {versions.map((version, index) => {
              const colors = [
                version.themeData.semantic.primary,
                version.themeData.semantic.secondary,
                version.themeData.semantic.accent,
              ];

              return (
                <React.Fragment key={version.id}>
                  <ListItem
                    sx={{ px: 0, py: 1.5 }}
                    secondaryAction={
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<RestoreIcon />}
                        onClick={() => onRestore(version.versionNumber)}
                      >
                        Restore
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip
                            label={`v${version.versionNumber}`}
                            size="small"
                            color={index === 0 ? 'primary' : 'default'}
                          />
                          <Typography variant="body2">
                            {version.changeNote ?? `Version ${version.versionNumber}`}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(version.createdAt).toLocaleString()}
                          </Typography>
                          {/* Color preview strip */}
                          <Stack direction="row" spacing={0.5}>
                            {colors.map((color, i) => (
                              <Box
                                key={i}
                                sx={{
                                  width: 20,
                                  height: 14,
                                  borderRadius: 0.5,
                                  bgcolor: color,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                }}
                              />
                            ))}
                          </Stack>
                        </Stack>
                      }
                    />
                  </ListItem>
                  {index < versions.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
