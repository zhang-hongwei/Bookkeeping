'use client';

import { useState, useCallback, useEffect } from 'react';
import type { GithubSettingsInfo } from '../types';

interface UseGitHubSettingsReturn {
  settings: GithubSettingsInfo | null;
  loading: boolean;
  error: string | null;
  saveToken: (token: string) => Promise<boolean>;
  deleteToken: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const DEFAULT_SETTINGS: GithubSettingsInfo = {
  configured: false,
  validatedUsername: null,
  validatedAt: null,
  tokenPreview: null,
};

export function useGitHubSettings(): UseGitHubSettingsReturn {
  const [settings, setSettings] = useState<GithubSettingsInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/github/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      } else {
        setError(data.error ?? 'Failed to load settings');
        setSettings(DEFAULT_SETTINGS);
      }
    } catch {
      setError('Network error');
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveToken = useCallback(
    async (token: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/github/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ githubToken: token }),
        });
        const data = await res.json();
        if (data.success) {
          setSettings(data.data);
          return true;
        }
        setError(data.error ?? 'Failed to save token');
        return false;
      } catch {
        setError('Network error');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteToken = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/github/settings', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSettings(DEFAULT_SETTINGS);
        return true;
      }
      setError(data.error ?? 'Failed to delete token');
      return false;
    } catch {
      setError('Network error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { settings, loading, error, saveToken, deleteToken, refresh };
}
