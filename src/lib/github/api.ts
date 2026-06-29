import { GitHubClient } from './client';
import { ProcessedCommitData } from '@/types/report';
import { GitHubCommit } from '@/types/github';
import dayjs from 'dayjs';

/**
 * 获取本周的时间范围
 */
export function getThisWeekRange(): { since: string; until: string } {
  const startOfWeek = dayjs().startOf('week').add(1, 'day'); // 从周一开始
  const endOfWeek = dayjs().endOf('week').add(1, 'day'); // 到周日结束

  return {
    since: startOfWeek.toISOString(),
    until: endOfWeek.toISOString(),
  };
}

/**
 * 获取上周的时间范围
 */
export function getLastWeekRange(): { since: string; until: string } {
  const startOfLastWeek = dayjs().subtract(1, 'week').startOf('week').add(1, 'day');
  const endOfLastWeek = dayjs().subtract(1, 'week').endOf('week').add(1, 'day');

  return {
    since: startOfLastWeek.toISOString(),
    until: endOfLastWeek.toISOString(),
  };
}

/**
 * 获取自定义时间范围
 */
export function getCustomRange(startDate: string, endDate: string): { since: string; until: string } {
  return {
    since: dayjs(startDate).startOf('day').toISOString(),
    until: dayjs(endDate).endOf('day').toISOString(),
  };
}

/**
 * 过滤合并提交
 */
export function filterMergeCommits(commits: GitHubCommit[]): GitHubCommit[] {
  return commits.filter(commit =>
    !commit.commit.message.toLowerCase().startsWith('merge') &&
    commit.parents.length <= 1
  );
}

/**
 * 按作者分组提交记录
 */
export function groupCommitsByAuthor(commits: GitHubCommit[]): Map<string, GitHubCommit[]> {
  const groups = new Map<string, GitHubCommit[]>();

  commits.forEach(commit => {
    const authorName = commit.commit.author.name;
    if (!groups.has(authorName)) {
      groups.set(authorName, []);
    }
    groups.get(authorName)!.push(commit);
  });

  return groups;
}

/**
 * 按日期分组提交记录
 */
export function groupCommitsByDate(commits: GitHubCommit[]): Map<string, GitHubCommit[]> {
  const groups = new Map<string, GitHubCommit[]>();

  commits.forEach(commit => {
    const date = dayjs(commit.commit.author.date).format('YYYY-MM-DD');
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)!.push(commit);
  });

  return groups;
}

/**
 * 按仓库分组提交记录
 */
export function groupCommitsByRepository(
  repoCommits: Array<{ repository: string; commits: GitHubCommit[] }>
): Map<string, GitHubCommit[]> {
  const groups = new Map<string, GitHubCommit[]>();

  repoCommits.forEach(({ repository, commits }) => {
    groups.set(repository, commits);
  });

  return groups;
}

/**
 * 处理提交数据，生成报告所需的结构化数据
 */
export function processCommitsForReport(
  repoCommits: Array<{ repository: string; commits: GitHubCommit[]; error?: string }>,
  options: {
    includeMergeCommits?: boolean;
    groupByAuthor?: boolean;
    groupByDate?: boolean;
  } = {}
): ProcessedCommitData {
  const { includeMergeCommits = false, groupByAuthor = true } = options;

  // 合并所有仓库的提交记录
  let allCommits: Array<GitHubCommit & { repository: string }> = [];

  repoCommits.forEach(({ repository, commits, error }) => {
    if (error) {
      console.warn(`Error fetching commits for ${repository}:`, error);
      return;
    }

    const filteredCommits = includeMergeCommits ? commits : filterMergeCommits(commits);
    const commitsWithRepo = filteredCommits.map(commit => ({
      ...commit,
      repository,
    }));

    allCommits.push(...commitsWithRepo);
  });

  // 按提交时间排序
  allCommits.sort((a, b) =>
    dayjs(a.commit.author.date).valueOf() - dayjs(b.commit.author.date).valueOf()
  );

  // 按作者分组
  const authorGroups: ProcessedCommitData['authorGroups'] = [];

  if (groupByAuthor) {
    const authorCommitsMap = new Map<string, typeof allCommits>();

    allCommits.forEach(commit => {
      const authorKey = `${commit.commit.author.name}|${commit.commit.author.email}`;
      if (!authorCommitsMap.has(authorKey)) {
        authorCommitsMap.set(authorKey, []);
      }
      authorCommitsMap.get(authorKey)!.push(commit);
    });

    authorCommitsMap.forEach((commits, authorKey) => {
      const [name, email] = authorKey.split('|');
      authorGroups.push({
        author: name,
        email,
        commits: commits.map(commit => ({
          date: dayjs(commit.commit.author.date).format('YYYY-MM-DD'),
          message: commit.commit.message.split('\n')[0], // 只取第一行
          sha: commit.sha.substring(0, 7), // 短 SHA
          url: commit.html_url,
          repository: commit.repository,
        })),
      });
    });
  }

  // 按仓库分组统计
  const repositoryGroups: ProcessedCommitData['repositoryGroups'] = [];
  const repoCommitCounts = new Map<string, number>();

  allCommits.forEach(commit => {
    const count = repoCommitCounts.get(commit.repository) || 0;
    repoCommitCounts.set(commit.repository, count + 1);
  });

  repoCommitCounts.forEach((commits, repository) => {
    repositoryGroups.push({ repository, commits });
  });

  // 按提交数量排序
  repositoryGroups.sort((a, b) => b.commits - a.commits);
  authorGroups.sort((a, b) => b.commits.length - a.commits.length);

  return {
    totalCommits: allCommits.length,
    authorGroups,
    repositoryGroups,
  };
}

/**
 * 获取周数字符串
 */
export function getWeekString(date: Date = new Date()): string {
  const year = dayjs(date).year();
  const week = dayjs(date).week();
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

/**
 * 创建 GitHub API 客户端实例
 */
export function createGitHubClient(token: string): GitHubClient {
  if (!token) {
    throw new Error('GitHub token is required');
  }

  return new GitHubClient(token);
}

/**
 * 验证仓库名称格式
 */
export function validateRepositoryName(repoName: string): boolean {
  const repoRegex = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
  return repoRegex.test(repoName);
}

/**
 * 解析仓库全名
 */
export function parseRepositoryFullName(fullName: string): { owner: string; repo: string } | null {
  const match = fullName.match(/^([^/]+)\/([^/]+)$/);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2],
  };
}

/**
 * 生成提交记录的摘要统计
 */
export function generateCommitSummary(data: ProcessedCommitData) {
  const authorCount = data.authorGroups.length;
  const repoCount = data.repositoryGroups.length;
  const avgCommitsPerAuthor = authorCount > 0 ? Math.round(data.totalCommits / authorCount) : 0;

  return {
    totalCommits: data.totalCommits,
    authorCount,
    repoCount,
    avgCommitsPerAuthor,
    topAuthor: data.authorGroups[0]?.author || 'N/A',
    topRepository: data.repositoryGroups[0]?.repository || 'N/A',
  };
}

/**
 * 生成 Markdown 格式的周报
 */
export function generateMarkdownReport(data: ProcessedCommitData, config: any): string {
  const { startDate, endDate } = config.timeRange;
  const summary = generateCommitSummary(data);

  let markdown = '';

  // 标题
  markdown += `# GitHub 周报\n\n`;
  markdown += `**时间范围**: ${startDate} 至 ${endDate}\n`;
  markdown += `**生成时间**: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}\n\n`;

  // 摘要
  markdown += `## 📊 摘要\n\n`;
  markdown += `- **总提交数**: ${summary.totalCommits}\n`;
  markdown += `- **参与人数**: ${summary.authorCount}\n`;
  markdown += `- **涉及仓库**: ${summary.repoCount}\n`;
  markdown += `- **平均每人提交**: ${summary.avgCommitsPerAuthor}\n`;
  markdown += `- **最活跃作者**: ${summary.topAuthor}\n`;
  markdown += `- **最活跃仓库**: ${summary.topRepository}\n\n`;

  // 按仓库统计
  if (data.repositoryGroups.length > 0) {
    markdown += `## 📦 按仓库统计\n\n`;
    data.repositoryGroups.forEach(({ repository, commits }, index) => {
      markdown += `${index + 1}. **${repository}**: ${commits} 次提交\n`;
    });
    markdown += '\n';
  }

  // 按作者统计
  if (data.authorGroups.length > 0) {
    markdown += `## 👥 按作者统计\n\n`;
    data.authorGroups.forEach(({ author, commits }, index) => {
      markdown += `### ${index + 1}. ${author}\n\n`;
      markdown += `**提交数**: ${commits.length}\n\n`;

      if (commits.length > 0) {
        markdown += `**提交记录**:\n\n`;
        commits.forEach(commit => {
          markdown += `- \`${commit.sha}\` [${commit.repository}] ${commit.message} *(${commit.date})*\n`;
        });
        markdown += '\n';
      }
    });
  }

  // 配置信息
  markdown += `## ⚙️ 生成配置\n\n`;
  markdown += `- **包含合并提交**: ${config.includeMergeCommits ? '是' : '否'}\n`;
  markdown += `- **按作者分组**: ${config.groupByAuthor ? '是' : '否'}\n`;
  markdown += `- **按日期分组**: ${config.groupByDate ? '是' : '否'}\n\n`;

  markdown += `---\n`;
  markdown += `*本报告由 GitHub 周报生成器自动生成*\n`;

  return markdown;
}