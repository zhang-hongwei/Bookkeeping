import { StateCreator } from 'zustand';
import { GitHubStore } from './types';
import { githubInitialState } from './initialState';
import { createGitHubClient, processCommitsForReport, parseRepositoryFullName, generateMarkdownReport } from '@/lib/github/api';
import {
  getThisWeekRange,
  getLastWeekRange,
} from '@/lib/github/api';
import { WeeklyReport, ProcessedCommitData, ReportConfig } from '@/types/report';
import { GitHubCommit } from '@/types/github';
import dayjs from 'dayjs';

export const createGitHubActions = (): StateCreator<
  GitHubStore,
  [],
  [],
  GitHubStore
> => (set, get) => ({
  // Initial state
  ...githubInitialState,

  // ==================== Auth Actions ====================
  setToken: (token: string) => {
    set({ token, error: null });
    if (typeof window !== 'undefined') {
      localStorage.setItem('github_token', token);
    }
  },

  validateToken: async (token: string) => {
    set({ isValidating: true, error: null });

    try {
      const client = createGitHubClient(token);
      const result = await client.validateToken();

      if (result.valid && result.user) {
        set({
          user: result.user,
          isAuthenticated: true,
          isValidating: false,
          error: null,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isValidating: false,
          error: 'Invalid token',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token validation failed';
      set({
        user: null,
        isAuthenticated: false,
        isValidating: false,
        error: errorMessage,
      });
    }
  },

  logout: () => {
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null,
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('github_token');
    }
  },

  // ==================== Repo Actions ====================
  fetchRepositories: async (token: string) => {
    set({ isLoading: true, error: null });

    try {
      const client = createGitHubClient(token);
      const repos = await client.getRepositories({
        type: "all",
        sort: "updated",
        direction: "desc",
        per_page: 100,
      });

      set({
        repositories: repos,
        filteredRepos: repos,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch repositories";
      set({
        error: errorMessage,
        isLoading: false,
        repositories: [],
        filteredRepos: [],
      });
    }
  },

  searchRepositories: async (token: string, query: string) => {
    if (!query.trim()) {
      const { repositories } = get();
      set({ filteredRepos: repositories, searchQuery: query });
      return;
    }

    set({ isLoading: true, error: null, searchQuery: query });

    try {
      const client = createGitHubClient(token);
      const { repositories } = get();

      // Local search first
      const localMatches = repositories.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query.toLowerCase()) ||
          repo.full_name.toLowerCase().includes(query.toLowerCase()) ||
          (repo.description &&
            repo.description.toLowerCase().includes(query.toLowerCase()))
      );

      // Online search if local results < 10
      if (localMatches.length < 10) {
        const searchResults = await client.searchRepositories(query, {
          sort: "updated",
          order: "desc",
          per_page: 30,
        });

        const allRepos = [...localMatches];
        searchResults.forEach((searchRepo) => {
          if (!allRepos.some((localRepo) => localRepo.id === searchRepo.id)) {
            allRepos.push(searchRepo);
          }
        });

        set({
          filteredRepos: allRepos,
          isLoading: false,
        });
      } else {
        set({
          filteredRepos: localMatches,
          isLoading: false,
        });
      }
    } catch (error) {
      const { repositories } = get();
      const localMatches = repositories.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query.toLowerCase()) ||
          repo.full_name.toLowerCase().includes(query.toLowerCase()) ||
          (repo.description &&
            repo.description.toLowerCase().includes(query.toLowerCase()))
      );

      set({
        filteredRepos: localMatches,
        isLoading: false,
        error: "Online search failed, showing local results only",
      });
    }
  },

  selectRepo: (repoFullName: string) => {
    const { selectedRepos } = get();
    if (!selectedRepos.includes(repoFullName)) {
      set({ selectedRepos: [...selectedRepos, repoFullName] });
    }
  },

  unselectRepo: (repoFullName: string) => {
    const { selectedRepos } = get();
    set({
      selectedRepos: selectedRepos.filter((repo) => repo !== repoFullName),
    });
  },

  selectAllRepos: () => {
    const { filteredRepos } = get();
    const allRepoNames = filteredRepos.map((repo) => repo.full_name);
    set({ selectedRepos: allRepoNames });
  },

  clearSelectedRepos: () => {
    set({ selectedRepos: [] });
  },

  setSearchQuery: (query: string) => {
    const { repositories } = get();

    if (!query.trim()) {
      set({ searchQuery: query, filteredRepos: repositories });
      return;
    }

    const filtered = repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(query.toLowerCase()) ||
        (repo.description &&
          repo.description.toLowerCase().includes(query.toLowerCase()))
    );

    set({ searchQuery: query, filteredRepos: filtered });
  },

  // ==================== Report Actions ====================
  setConfig: (configUpdate: any) => {
    const { config } = get();
    set({ config: { ...config, ...configUpdate } });
  },

  fetchCommits: async (token: string) => {
    const { config } = get();
    set({ isFetching: true, error: null });

    try {
      const client = createGitHubClient(token);

      // Use batch commit fetching which handles repository parsing internally
      const repoCommits = await client.getBatchCommits({
        repos: config.repositories,
        since: config.timeRange.startDate,
        until: config.timeRange.endDate,
      });

      // Flatten all commits for storage
      const allCommits = repoCommits.reduce((acc, { commits }) => {
        acc.push(...commits);
        return acc;
      }, [] as GitHubCommit[]);

      // Process commits for report generation
      const processedData = processCommitsForReport(repoCommits, {
        includeMergeCommits: config.includeMergeCommits,
        groupByAuthor: config.groupByAuthor,
        groupByDate: config.groupByDate,
      });

      set({
        commits: allCommits,
        processedData,
        isFetching: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch commits";
      set({
        error: errorMessage,
        isFetching: false,
      });
    }
  },

  generateReport: async () => {
    const { processedData, config, commits } = get();
    if (!processedData) return;

    set({ isGenerating: true, error: null });

    try {
      const reportContent = generateMarkdownReport(processedData, config);

      const report: WeeklyReport = {
        id: `report-${Date.now()}`,
        title: `GitHub 周报 - ${config.timeRange.startDate} 至 ${config.timeRange.endDate}`,
        week: `${dayjs(config.timeRange.startDate).format('YYYY年第ww周')}`,
        content: reportContent,
        timeRange: config.timeRange,
        repositories: config.repositories,
        commits: commits,
        config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        summary: {
          totalCommits: processedData.totalCommits,
          totalAuthors: processedData.authorGroups.length,
          totalRepositories: processedData.repositoryGroups.length,
        },
      };

      const { reports } = get();
      set({
        currentReport: report,
        reports: [...reports, report],
        isGenerating: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate report";
      set({
        error: errorMessage,
        isGenerating: false,
      });
    }
  },

  updateReportContent: (content: string) => {
    const { currentReport } = get();
    if (currentReport) {
      const updatedReport = {
        ...currentReport,
        content,
        updatedAt: new Date().toISOString(),
      };
      set({ currentReport: updatedReport });
    }
  },

  saveReport: () => {
    const { currentReport, reports } = get();
    if (currentReport) {
      const updatedReports = reports.map((report) =>
        report.id === currentReport.id ? currentReport : report
      );
      set({ reports: updatedReports });

      if (typeof window !== 'undefined') {
        localStorage.setItem('github_reports', JSON.stringify(updatedReports));
      }
    }
  },

  loadReport: (reportId: string) => {
    const { reports } = get();
    const report = reports.find((r) => r.id === reportId);
    if (report) {
      set({ currentReport: report });
    }
  },

  deleteReport: (reportId: string) => {
    const { reports } = get();
    const updatedReports = reports.filter((report) => report.id !== reportId);
    set({ reports: updatedReports });

    if (typeof window !== 'undefined') {
      localStorage.setItem('github_reports', JSON.stringify(updatedReports));
    }
  },

  exportReport: async (format: "markdown" | "pdf" | "docx") => {
    const { currentReport } = get();
    if (!currentReport) return;

    try {
      // Implementation would depend on export library
      console.log(`Exporting report as ${format}:`, currentReport);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Failed to export report as ${format}`;
      set({ error: errorMessage });
    }
  },

  resetReport: () => {
    set({
      currentReport: null,
      commits: [],
      processedData: null,
      isGenerating: false,
      isFetching: false,
    });
  },

  clearError: () => {
    set({ error: null });
  },
});