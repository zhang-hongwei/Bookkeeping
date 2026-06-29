'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  Stack,
  Chip,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useGitHubSettings } from '../hooks/useGitHubSettings';

export default function GitHubSettingsCard() {
  const { settings, loading, error, saveToken, deleteToken } =
    useGitHubSettings();
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!token.trim()) return;
    setSaving(true);
    await saveToken(token.trim());
    setToken('');
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteToken();
    setDeleting(false);
  };

  const isConfigured = settings?.configured ?? false;

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GitHubIcon fontSize="medium" />
            <Typography variant="h6">GitHub API Key</Typography>
            {isConfigured && (
              <Chip label="Configured" color="success" size="small" />
            )}
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {isConfigured && settings?.validatedUsername && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">
                Authenticated as:{' '}
                <strong>{settings.validatedUsername}</strong>
              </Typography>
              {settings.tokenPreview && (
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  ({settings.tokenPreview})
                </Typography>
              )}
            </Box>
          )}

          {!isConfigured && (
            <Alert severity="info">
              Enter a GitHub Personal Access Token with `repo` read scope to
              enable commit queries.
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              size="small"
              type={showToken ? 'text' : 'password'}
              label="GitHub Personal Access Token"
              placeholder="ghp_xxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={loading}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowToken(!showToken)}
                        edge="end"
                      >
                        {showToken ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!token.trim() || saving || loading}
              startIcon={<SaveIcon />}
              sx={{ minWidth: 100 }}
            >
              {saving ? 'Validating...' : 'Save'}
            </Button>
            {isConfigured && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                disabled={deleting || loading}
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
