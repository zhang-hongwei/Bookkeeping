'use client';

import { useCallback } from 'react';
import { useGithubStore } from '../store/github-store';
import type { CommitQueryResult } from '../types';

export function useCommitQuery() {
  const store = useGithubStore();

  const fetchCommits = useCallback(
    async (isLoadMore = false) => {
      if (!store.selectedRepo) return;

      const page = isLoadMore ? store.page + 1 : 1;
      store.setLoading(true);
      store.setError(null);

      if (!isLoadMore) {
        store.setCommits([], 0, false);
      }

      try {
        const params = new URLSearchParams({ repo: store.selectedRepo, page: String(page), perPage: '30' });
        if (store.selectedBranch) params.set('branch', store.selectedBranch);
        if (store.since) params.set('since', store.since);
        if (store.until) params.set('until', store.until);

        const res = await fetch(`/api/github/commits?${params}`);
        const data = (await res.json()) as {
          success: boolean;
          data?: CommitQueryResult;
          error?: string;
        };

        if (data.success && data.data) {
          if (isLoadMore) {
            store.appendCommits(
              data.data.items,
              data.data.totalCount,
              data.data.hasMore,
            );
          } else {
            store.setCommits(
              data.data.items,
              data.data.totalCount,
              data.data.hasMore,
            );
          }
          store.setPage(page);
        } else {
          store.setError(data.error ?? 'Failed to fetch commits');
        }
      } catch {
        store.setError('Network error');
      } finally {
        store.setLoading(false);
      }
    },
    [
      store.selectedRepo,
      store.selectedBranch,
      store.since,
      store.until,
      store.page,
    ],
  );

  const loadMore = useCallback(() => {
    if (store.hasMore && !store.loading) {
      fetchCommits(true);
    }
  }, [store.hasMore, store.loading, fetchCommits]);

  return {
    commits: store.commits,
    totalCount: store.totalCount,
    hasMore: store.hasMore,
    loading: store.loading,
    error: store.error,
    fetchCommits: () => fetchCommits(false),
    loadMore,
  };
}
