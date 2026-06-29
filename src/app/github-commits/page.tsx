'use client';

import { Box, Container, Typography, Divider, Paper, alpha } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import SearchIcon from '@mui/icons-material/Search';
import CommitQueryForm from '@/features/github-commits/components/CommitQueryForm';
import CommitList from '@/features/github-commits/components/CommitList';
import GitHubSettingsCard from '@/features/github-commits/components/GitHubSettingsCard';
import { useGitHubSettings } from '@/features/github-commits/hooks/useGitHubSettings';
import { useCommitQuery } from '@/features/github-commits/hooks/useCommitQuery';

export default function GitHubCommitsPage() {
  const { settings } = useGitHubSettings();
  const { commits, totalCount, hasMore, loading, error, loadMore } =
    useCommitQuery();

  const isConfigured = settings?.configured ?? false;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <GitHubIcon fontSize="large" sx={{ color: 'text.primary' }} />
          <Typography variant="h4" fontWeight={700}>
            GitHub Commits
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Browse commit history across repositories and branches
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Settings — collapsible when configured */}
        <GitHubSettingsCard />

        {/* Query Form — always visible, disabled when not configured */}
        <Divider />
        <CommitQueryForm isConfigured={isConfigured} />

        {/* Results or Placeholder */}
        {isConfigured ? (
          <CommitList
            commits={commits}
            totalCount={totalCount}
            hasMore={hasMore}
            loading={loading}
            error={error}
            onLoadMore={loadMore}
          />
        ) : (
          <Paper
            variant="outlined"
            sx={{
              py: 8,
              px: 4,
              textAlign: 'center',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
              borderColor: 'divider',
            }}
          >
            <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Configure your GitHub API key to get started
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Save a Personal Access Token above to query commit history from any
              repository
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}
