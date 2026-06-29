export interface Commit {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  authorAvatar: string;
  date: string;
  branch: string;
  url: string;
}

export interface Repository {
  fullName: string;
  name: string;
  owner: string;
  description: string;
  avatarUrl: string;
  url: string;
}

export interface Branch {
  name: string;
  isDefault: boolean;
}

export interface CommitQueryParams {
  repo: string;
  branch?: string;
  since?: string;
  until?: string;
  page?: number;
  perPage?: number;
}

export interface GithubSettingsInfo {
  configured: boolean;
  validatedUsername: string | null;
  validatedAt: string | null;
  tokenPreview: string | null;
}

export interface CommitQueryResult {
  items: Commit[];
  totalCount: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface RepoSearchResult {
  items: Repository[];
  totalCount: number;
}

export interface BranchListResult {
  items: Branch[];
  totalCount: number;
}

export type DateRangePreset = '1d' | '3d' | '1w' | '2w' | '1m' | 'custom';
