import { z } from 'zod';

export const GitHubUserSchema = z.object({
  id: z.number(),
  login: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  avatar_url: z.string(),
  html_url: z.string(),
});

export const GitHubRepositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  private: z.boolean(),
  html_url: z.string(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  updated_at: z.string(),
  owner: GitHubUserSchema,
});

export const GitHubCommitAuthorSchema = z.object({
  name: z.string(),
  email: z.string(),
  date: z.string(),
});

export const GitHubCommitSchema = z.object({
  sha: z.string(),
  node_id: z.string(),
  commit: z.object({
    author: GitHubCommitAuthorSchema,
    committer: GitHubCommitAuthorSchema,
    message: z.string(),
    tree: z.object({
      sha: z.string(),
    }),
  }),
  author: GitHubUserSchema.nullable(),
  committer: GitHubUserSchema.nullable(),
  html_url: z.string(),
  parents: z.array(z.object({
    sha: z.string(),
    html_url: z.string(),
  })),
});

export const GitHubApiResponseSchema = z.object({
  data: z.array(GitHubCommitSchema),
  status: z.number(),
  headers: z.record(z.string(), z.string()),
});

// Inferred types
export type GitHubUser = z.infer<typeof GitHubUserSchema>;
export type GitHubRepository = z.infer<typeof GitHubRepositorySchema>;
export type GitHubCommit = z.infer<typeof GitHubCommitSchema>;
export type GitHubCommitAuthor = z.infer<typeof GitHubCommitAuthorSchema>;
export type GitHubApiResponse = z.infer<typeof GitHubApiResponseSchema>;

// Additional types for our app
export interface RepoCommitGroup {
  repository: string;
  commits: GitHubCommit[];
}

export interface DailyCommitGroup {
  date: string;
  commits: GitHubCommit[];
}

export interface AuthorCommitGroup {
  author: string;
  dailyGroups: DailyCommitGroup[];
  totalCommits: number;
}