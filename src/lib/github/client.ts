import { Octokit } from '@octokit/rest';
import { GitHubRepository, GitHubCommit, GitHubUser } from '@/types/github';
import { CommitQueryParams } from '@/types/report';

export class GitHubClient {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
      userAgent: 'github-weekly-report/1.0.0',
    });
  }

  /**
   * 验证 GitHub Token 的有效性
   */
  async validateToken(): Promise<{ valid: boolean; user?: GitHubUser }> {
    try {
      const { data } = await this.octokit.rest.users.getAuthenticated();
      return {
        valid: true,
        user: {
          id: data.id,
          login: data.login,
          name: data.name,
          email: data.email,
          avatar_url: data.avatar_url,
          html_url: data.html_url,
        },
      };
    } catch (error) {
      console.error('Token validation failed:', error);
      return { valid: false };
    }
  }

  /**
   * 获取用户有权限的仓库列表
   */
  async getRepositories(options: {
    type?: 'all' | 'owner' | 'public' | 'private' | 'member';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  } = {}): Promise<GitHubRepository[]> {
    try {
      const {
        type = 'all',
        sort = 'updated',
        direction = 'desc',
        per_page = 100,
        page = 1,
      } = options;

      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        type,
        sort,
        direction,
        per_page,
        page,
      });

      return data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        html_url: repo.html_url,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
        owner: {
          id: repo.owner.id,
          login: repo.owner.login,
          name: repo.owner.name || null,
          email: repo.owner.email || null,
          avatar_url: repo.owner.avatar_url,
          html_url: repo.owner.html_url,
        },
      }));
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      throw new Error('获取仓库列表失败');
    }
  }

  /**
   * 获取指定仓库的提交记录
   */
  async getCommits(
    owner: string,
    repo: string,
    options: {
      since?: string;
      until?: string;
      author?: string;
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubCommit[]> {
    try {
      const { since, until, author, per_page = 100, page = 1 } = options;

      const { data } = await this.octokit.rest.repos.listCommits({
        owner,
        repo,
        since,
        until,
        author,
        per_page,
        page,
      });

      return data.map((commit) => ({
        sha: commit.sha,
        node_id: commit.node_id,
        commit: {
          author: {
            name: commit.commit.author?.name || 'Unknown',
            email: commit.commit.author?.email || '',
            date: commit.commit.author?.date || '',
          },
          committer: {
            name: commit.commit.committer?.name || 'Unknown',
            email: commit.commit.committer?.email || '',
            date: commit.commit.committer?.date || '',
          },
          message: commit.commit.message,
          tree: {
            sha: commit.commit.tree.sha,
          },
        },
        author: commit.author ? {
          id: commit.author.id,
          login: commit.author.login,
          name: commit.author.name || null,
          email: commit.author.email || null,
          avatar_url: commit.author.avatar_url,
          html_url: commit.author.html_url,
        } : null,
        committer: commit.committer ? {
          id: commit.committer.id,
          login: commit.committer.login,
          name: commit.committer.name || null,
          email: commit.committer.email || null,
          avatar_url: commit.committer.avatar_url,
          html_url: commit.committer.html_url,
        } : null,
        html_url: commit.html_url,
        parents: commit.parents.map((parent) => ({
          sha: parent.sha,
          html_url: parent.html_url,
        })),
      }));
    } catch (error) {
      console.error(`Failed to fetch commits for ${owner}/${repo}:`, error);
      throw new Error(`获取 ${owner}/${repo} 提交记录失败`);
    }
  }

  /**
   * 批量获取多个仓库的提交记录
   */
  async getBatchCommits(params: CommitQueryParams): Promise<Array<{
    repository: string;
    commits: GitHubCommit[];
    error?: string;
  }>> {
    const results = await Promise.allSettled(
      params.repos.map(async (repoFullName) => {
        const [owner, repo] = repoFullName.split('/');
        if (!owner || !repo) {
          throw new Error(`Invalid repository format: ${repoFullName}`);
        }

        const commits = await this.getCommits(owner, repo, {
          since: params.since,
          until: params.until,
          author: params.author,
          per_page: params.per_page || 100,
        });

        return {
          repository: repoFullName,
          commits,
        };
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          repository: params.repos[index],
          commits: [],
          error: result.reason.message,
        };
      }
    });
  }

  /**
   * 搜索仓库
   */
  async searchRepositories(query: string, options: {
    sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
    order?: 'desc' | 'asc';
    per_page?: number;
    page?: number;
  } = {}): Promise<GitHubRepository[]> {
    try {
      const { sort = 'updated', order = 'desc', per_page = 30, page = 1 } = options;

      const { data } = await this.octokit.rest.search.repos({
        q: query,
        sort,
        order,
        per_page,
        page,
      });

      return data.items.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        html_url: repo.html_url,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
        owner: {
          id: repo.owner.id,
          login: repo.owner.login,
          name: repo.owner.name || null,
          email: repo.owner.email || null,
          avatar_url: repo.owner.avatar_url,
          html_url: repo.owner.html_url,
        },
      }));
    } catch (error) {
      console.error('Failed to search repositories:', error);
      throw new Error('搜索仓库失败');
    }
  }

  /**
   * 获取 GitHub API 速率限制信息
   */
  async getRateLimit() {
    try {
      const { data } = await this.octokit.rest.rateLimit.get();
      return data;
    } catch (error) {
      console.error('Failed to get rate limit:', error);
      return null;
    }
  }
}