// 直接导出 GitHub store
export { default as useGitHubStore } from './github/store';
export * from './github/types';

// 初始化函数
export const initializeStore = () => {
  if (typeof window === 'undefined') return;

  const token = localStorage.getItem('github_token');
  if (token) {
    const { useGitHubStore } = require('./github/store');
    useGitHubStore.getState().setToken(token);
  }

  const savedReports = localStorage.getItem('github_reports');
  if (savedReports) {
    try {
      const reports = JSON.parse(savedReports);
      const { useGitHubStore } = require('./github/store');
      useGitHubStore.setState({ reports });
    } catch (error) {
      console.warn('Failed to load saved reports:', error);
    }
  }
};