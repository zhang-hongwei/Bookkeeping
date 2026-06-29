// ================== GitHub Store相关类型 ==================

import { GitHubRepository } from "@/types/github";
import { WeeklyReport, CommitData, ProcessedCommitData, ReportConfig } from "@/types/report";

// ================== Auth Store ==================

export interface AuthState {
  token: string | null;
  user: any | null;
  isValidating: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthActions {
  setToken: (token: string) => void;
  validateToken: (token: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;

// ================== Repo Store ==================

export interface RepoState {
  repositories: GitHubRepository[];
  selectedRepos: string[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filteredRepos: GitHubRepository[];
}

export interface RepoActions {
  fetchRepositories: (token: string) => Promise<void>;
  searchRepositories: (token: string, query: string) => Promise<void>;
  selectRepo: (repoFullName: string) => void;
  unselectRepo: (repoFullName: string) => void;
  selectAllRepos: () => void;
  clearSelectedRepos: () => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
}

export type RepoStore = RepoState & RepoActions;

// ================== Report Store ==================

export interface ReportState {
  currentReport: WeeklyReport | null;
  reports: WeeklyReport[];
  commits: CommitData[];
  processedData: ProcessedCommitData | null;
  isGenerating: boolean;
  isFetching: boolean;
  error: string | null;
  config: ReportConfig;
}

export interface ReportActions {
  setConfig: (config: Partial<ReportConfig>) => void;
  fetchCommits: (token: string) => Promise<void>;
  generateReport: () => Promise<void>;
  updateReportContent: (content: string) => void;
  saveReport: () => void;
  loadReport: (reportId: string) => void;
  deleteReport: (reportId: string) => void;
  exportReport: (format: "markdown" | "pdf" | "docx") => Promise<void>;
  clearError: () => void;
  resetReport: () => void;
}

export type ReportStore = ReportState & ReportActions;

// ================== Combined GitHub Store ==================

export type GitHubStore = AuthStore & RepoStore & ReportStore;