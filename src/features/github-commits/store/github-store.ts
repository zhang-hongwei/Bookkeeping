import { create } from 'zustand';
import type {
  Commit,
  DateRangePreset,
} from '../types';

interface GithubState {
  selectedRepo: string;
  selectedBranch: string;
  dateRangePreset: DateRangePreset;
  since: string | null;
  until: string | null;
  commits: Commit[];
  totalCount: number;
  page: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;

  setRepo: (repo: string) => void;
  setBranch: (branch: string) => void;
  setDateRange: (preset: DateRangePreset, since?: string, until?: string) => void;
  setCommits: (commits: Commit[], totalCount: number, hasMore: boolean) => void;
  appendCommits: (commits: Commit[], totalCount: number, hasMore: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  resetQuery: () => void;
}

function getDefaultSince(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString();
}

export const useGithubStore = create<GithubState>((set) => ({
  selectedRepo: '',
  selectedBranch: '',
  dateRangePreset: '1w',
  since: getDefaultSince(),
  until: null,
  commits: [],
  totalCount: 0,
  page: 1,
  hasMore: false,
  loading: false,
  error: null,

  setRepo: (repo) =>
    set({ selectedRepo: repo, page: 1, commits: [], error: null }),
  setBranch: (branch) =>
    set({ selectedBranch: branch, page: 1, commits: [], error: null }),
  setDateRange: (preset, since, until) =>
    set({
      dateRangePreset: preset,
      since: preset === 'custom' ? (since ?? null) : computeSince(preset),
      until: preset === 'custom' ? (until ?? null) : null,
      page: 1,
      commits: [],
      error: null,
    }),
  setCommits: (commits, totalCount, hasMore) =>
    set({ commits, totalCount, hasMore }),
  appendCommits: (newCommits, totalCount, hasMore) =>
    set((state) => ({
      commits: [...state.commits, ...newCommits],
      totalCount,
      hasMore,
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ page }),
  resetQuery: () =>
    set({
      selectedRepo: '',
      selectedBranch: '',
      dateRangePreset: '1w',
      since: getDefaultSince(),
      until: null,
      commits: [],
      totalCount: 0,
      page: 1,
      hasMore: false,
      loading: false,
      error: null,
    }),
}));

function computeSince(preset: DateRangePreset): string {
  const d = new Date();
  switch (preset) {
    case '1d':
      d.setDate(d.getDate() - 1);
      break;
    case '3d':
      d.setDate(d.getDate() - 3);
      break;
    case '1w':
      d.setDate(d.getDate() - 7);
      break;
    case '2w':
      d.setDate(d.getDate() - 14);
      break;
    case '1m':
      d.setMonth(d.getMonth() - 1);
      break;
    default:
      d.setDate(d.getDate() - 7);
  }
  return d.toISOString();
}
