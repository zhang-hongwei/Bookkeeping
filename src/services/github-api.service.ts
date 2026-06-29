import { githubSettingsService } from './github-settings.service';
import type {
  Commit,
  Repository,
  Branch,
  CommitQueryResult,
  RepoSearchResult,
  BranchListResult,
} from '@/features/github-commits/types';
import type { ServiceResponse } from '@/types/palette';

const GITHUB_API = 'https://api.github.com';

class GithubApiService {
  private async getToken(): Promise<string> {
    const token = await githubSettingsService.getToken();
    if (!token) {
      throw new Error('GitHub API key is not configured');
    }
    return token;
  }

  private async fetchWithAuth(path: string, token: string): Promise<Response> {
    const res = await fetch(`${GITHUB_API}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return res;
  }

  private mapError(status: number, statusText: string): string {
    switch (status) {
      case 401:
        return 'GitHub API key is invalid or has been revoked';
      case 403:
        return 'GitHub API rate limit exceeded. Please try again later.';
      case 404:
        return 'Repository not found or access denied';
      case 422:
        return 'Invalid query parameters';
      default:
        if (status >= 500) {
          return 'GitHub service temporarily unavailable';
        }
        return `GitHub API error: ${status} ${statusText}`;
    }
  }

  async listUserRepos(
    page = 1,
    perPage = 30,
  ): Promise<ServiceResponse<RepoSearchResult>> {
    try {
      const token = await this.getToken();
      const res = await this.fetchWithAuth(
        `/user/repos?type=all&page=${page}&per_page=${perPage}&sort=updated`,
        token,
      );

      if (!res.ok) {
        return {
          success: false,
          error: this.mapError(res.status, res.statusText),
          code: res.status === 403 ? 503 : res.status,
        };
      }

      const data = (await res.json()) as Array<{
        full_name: string;
        name: string;
        owner: { login: string; avatar_url: string };
        description: string;
        html_url: string;
      }>;

      return {
        success: true,
        data: {
          items: data.map((repo) => ({
            fullName: repo.full_name,
            name: repo.name,
            owner: repo.owner.login,
            description: repo.description ?? '',
            avatarUrl: repo.owner.avatar_url,
            url: repo.html_url,
          })),
          totalCount: data.length,
        },
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, error: msg, code: 500 };
    }
  }

  async searchRepos(
    query: string,
    page = 1,
    perPage = 10,
  ): Promise<ServiceResponse<RepoSearchResult>> {
    try {
      const token = await this.getToken();
      const q = encodeURIComponent(query);
      const res = await this.fetchWithAuth(
        `/search/repositories?q=${q}&page=${page}&per_page=${perPage}`,
        token,
      );

      if (!res.ok) {
        return {
          success: false,
          error: this.mapError(res.status, res.statusText),
          code: res.status === 403 ? 503 : res.status,
        };
      }

      const data = (await res.json()) as {
        items: Array<{
          full_name: string;
          name: string;
          owner: { login: string; avatar_url: string };
          description: string;
          html_url: string;
        }>;
        total_count: number;
      };

      return {
        success: true,
        data: {
          items: data.items.map((repo) => ({
            fullName: repo.full_name,
            name: repo.name,
            owner: repo.owner.login,
            description: repo.description ?? '',
            avatarUrl: repo.owner.avatar_url,
            url: repo.html_url,
          })),
          totalCount: data.total_count,
        },
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, error: msg, code: 500 };
    }
  }

  async listBranches(
    repo: string,
    page = 1,
    perPage = 100,
  ): Promise<ServiceResponse<BranchListResult>> {
    try {
      const token = await this.getToken();
      const res = await this.fetchWithAuth(
        `/repos/${repo}/branches?page=${page}&per_page=${perPage}`,
        token,
      );

      if (!res.ok) {
        return {
          success: false,
          error: this.mapError(res.status, res.statusText),
          code: res.status,
        };
      }

      const data = (await res.json()) as Array<{
        name: string;
        default?: boolean;
      }>;

      // GitHub doesn't return isDefault in branch list; get default from repo
      let defaultBranch = 'main';
      try {
        const repoRes = await this.fetchWithAuth(`/repos/${repo}`, token);
        if (repoRes.ok) {
          const repoData = (await repoRes.json()) as {
            default_branch: string;
          };
          defaultBranch = repoData.default_branch;
        }
      } catch {
        // ignore — default to 'main'
      }

      return {
        success: true,
        data: {
          items: data.map((b) => ({
            name: b.name,
            isDefault: b.name === defaultBranch,
          })),
          totalCount: data.length,
        },
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, error: msg, code: 500 };
    }
  }

  async listCommits(
    repo: string,
    branch: string,
    since?: string,
    until?: string,
    page = 1,
    perPage = 100,
  ): Promise<ServiceResponse<CommitQueryResult>> {
    try {
      const token = await this.getToken();
      const params = new URLSearchParams({
        sha: branch,
        page: String(page),
        per_page: String(perPage),
      });
      if (since) params.set('since', since);
      if (until) params.set('until', until);

      const res = await this.fetchWithAuth(
        `/repos/${repo}/commits?${params}`,
        token,
      );

      if (!res.ok) {
        return {
          success: false,
          error: this.mapError(res.status, res.statusText),
          code: res.status === 403 ? 503 : res.status,
        };
      }

      const data = (await res.json()) as Array<{
        sha: string;
        commit: {
          message: string;
          author: {
            name: string;
            date: string;
          };
        };
        author: {
          login: string;
          avatar_url: string;
        } | null;
        html_url: string;
      }>;

      return {
        success: true,
        data: {
          items: data.map((c) => ({
            sha: c.sha,
            shortSha: c.sha.slice(0, 7),
            message: c.commit.message.split('\n')[0],
            author: c.commit.author.name,
            authorAvatar: c.author?.avatar_url ?? '',
            date: c.commit.author.date,
            branch,
            url: c.html_url,
          })),
          totalCount: data.length,
          page,
          perPage,
          hasMore: data.length === perPage,
        },
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, error: msg, code: 500 };
    }
  }

  async listAllBranchCommits(
    repo: string,
    since?: string,
    until?: string,
    page = 1,
    perPage = 30,
  ): Promise<ServiceResponse<CommitQueryResult>> {
    try {
      const branchesResult = await this.listBranches(repo);
      if (!branchesResult.success) {
        return {
          success: false,
          error: branchesResult.error ?? 'Failed to list branches',
          code: branchesResult.code,
        } as ServiceResponse<CommitQueryResult>;
      }

      const branches = branchesResult.data!.items;
      const allCommitsResults = await Promise.all(
        branches.map((b) =>
          this.listCommits(repo, b.name, since, until, 1, 100),
        ),
      );

      const allCommits: Commit[] = [];
      for (const result of allCommitsResults) {
        if (result.success && result.data) {
          allCommits.push(...result.data.items);
        }
      }

      // Deduplicate by SHA
      const seen = new Set<string>();
      const unique = allCommits.filter((c) => {
        if (seen.has(c.sha)) return false;
        seen.add(c.sha);
        return true;
      });

      // Sort by date descending
      unique.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      // Paginate
      const start = (page - 1) * perPage;
      const paged = unique.slice(start, start + perPage);

      return {
        success: true,
        data: {
          items: paged,
          totalCount: unique.length,
          page,
          perPage,
          hasMore: start + perPage < unique.length,
        },
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, error: msg, code: 500 };
    }
  }
}

export const githubApiService = new GithubApiService();
