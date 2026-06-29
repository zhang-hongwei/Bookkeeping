import { WeeklyReport } from '@/types/report';

/**
 * 导出 Markdown 文件
 */
export function exportMarkdown(report: WeeklyReport): void {
  const filename = `${report.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-_]/g, '_')}.md`;

  const blob = new Blob([report.content], {
    type: 'text/markdown;charset=utf-8',
  });

  downloadBlob(blob, filename);
}

/**
 * 导出纯文本文件
 */
export function exportText(report: WeeklyReport): void {
  const filename = `${report.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-_]/g, '_')}.txt`;

  // 将 Markdown 转换为纯文本
  const textContent = report.content
    .replace(/#{1,6}\s/g, '') // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接，保留文字
    .replace(/`(.*?)`/g, '$1') // 移除代码标记
    .replace(/^[\s]*[-*+]\s/gm, '• ') // 转换列表标记
    .replace(/^\d+\.\s/gm, '• '); // 转换有序列表

  const blob = new Blob([textContent], {
    type: 'text/plain;charset=utf-8',
  });

  downloadBlob(blob, filename);
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
      return true;
    } else {
      // 回退方案：使用传统的方法
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const success = document.execCommand('copy');
      document.body.removeChild(textArea);

      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * 生成分享链接数据
 */
export function generateShareData(report: WeeklyReport): {
  url: string;
  title: string;
  text: string;
} {
  const summary = `
📊 ${report.title}

🗓️ 时间: ${report.timeRange.startDate} ~ ${report.timeRange.endDate}
📦 仓库: ${report.repositories.length} 个
👥 贡献者: ${report.commits.length > 0 ? new Set(report.commits.map(c => c.commit.author.name)).size : 0} 人
💻 总提交: ${report.commits.length} 次

#GitHubWeeklyReport #开源 #团队协作
  `.trim();

  return {
    url: window.location.href,
    title: report.title,
    text: summary,
  };
}

/**
 * 分享到社交平台
 */
export function shareToSocial(platform: 'twitter' | 'linkedin' | 'facebook', report: WeeklyReport): void {
  const shareData = generateShareData(report);
  let url = '';

  switch (platform) {
    case 'twitter':
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
      break;
    case 'linkedin':
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(shareData.text)}`;
      break;
    case 'facebook':
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`;
      break;
  }

  if (url) {
    window.open(url, '_blank', 'width=600,height=400');
  }
}

/**
 * 使用 Web Share API 分享（移动端友好）
 */
export async function shareNative(report: WeeklyReport): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    const shareData = generateShareData(report);
    await navigator.share({
      title: shareData.title,
      text: shareData.text,
      url: shareData.url,
    });
    return true;
  } catch (error) {
    console.error('Failed to share:', error);
    return false;
  }
}

/**
 * 下载文件的通用函数
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 清理 URL 对象
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * 生成报告摘要
 */
export function generateReportSummary(report: WeeklyReport): string {
  const authorCount = new Set(report.commits.map(c => c.commit.author.name)).size;
  const repoCount = report.repositories.length;
  const commitCount = report.commits.length;

  const avgCommitsPerDay = Math.round(commitCount / 7 * 10) / 10;
  const avgCommitsPerAuthor = authorCount > 0 ? Math.round(commitCount / authorCount * 10) / 10 : 0;

  return `
📊 **${report.title}**

**📅 时间范围:** ${report.timeRange.startDate} ~ ${report.timeRange.endDate}

**📈 统计概览:**
• 总提交数: ${commitCount} 次
• 参与人数: ${authorCount} 人
• 涉及仓库: ${repoCount} 个
• 日均提交: ${avgCommitsPerDay} 次
• 人均提交: ${avgCommitsPerAuthor} 次

**📦 涉及仓库:** ${report.repositories.join(', ')}

---
*由 GitHub 周报生成器自动生成*
  `.trim();
}