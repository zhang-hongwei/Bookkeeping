import { GitHubStore } from "./types";

export const githubInitialState: Omit<GitHubStore, keyof (import("./types").AuthActions & import("./types").RepoActions & import("./types").ReportActions)> = {
  // Auth state
  token: null,
  user: null,
  isValidating: false,
  isAuthenticated: false,

  // Repo state
  repositories: [],
  selectedRepos: [],
  isLoading: false,
  searchQuery: "",
  filteredRepos: [],

  // Report state
  currentReport: null,
  reports: [],
  commits: [],
  processedData: null,
  isGenerating: false,
  isFetching: false,
  error: null,

  // Report config
  config: {
    repositories: [],
    timeRange: {
      startDate: "",
      endDate: "",
      type: "this_week",
    },
    includeAuthor: true,
    includeMergeCommits: false,
    groupByAuthor: true,
    groupByDate: false,
  },
};