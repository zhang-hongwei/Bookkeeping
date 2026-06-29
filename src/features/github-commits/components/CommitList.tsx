'use client';

import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Typography,
  Box,
  Button,
  Skeleton,
  Alert,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/OpenInNew';
import type { Commit } from '../types';

interface CommitListProps {
  commits: Commit[];
  totalCount: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  onLoadMore: () => void;
}

export default function CommitList({
  commits,
  totalCount,
  hasMore,
  loading,
  error,
  onLoadMore,
}: CommitListProps) {
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (loading && commits.length === 0) {
    return (
      <Box>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={64} sx={{ mb: 1 }} animation="wave" />
        ))}
      </Box>
    );
  }

  if (commits.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        No commits found for the selected criteria.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {totalCount} commit{totalCount !== 1 ? 's' : ''} found
      </Typography>
      <List disablePadding>
        {commits.map((commit) => (
          <ListItem
            key={commit.sha}
            divider
            sx={{ py: 1.5, gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
          >
            <ListItemAvatar sx={{ minWidth: 40 }}>
              <Avatar
                src={commit.authorAvatar}
                alt={commit.author}
                sx={{ width: 32, height: 32 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={commit.shortSha}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                    component="a"
                    href={commit.url}
                    target="_blank"
                    clickable
                    icon={<LinkIcon sx={{ fontSize: 14 }} />}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {commit.message.length > 100
                      ? commit.message.slice(0, 100) + '...'
                      : commit.message}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography variant="caption">{commit.author}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(commit.date)}
                  </Typography>
                  <Chip label={commit.branch} size="small" variant="filled" sx={{ fontSize: '0.7rem', height: 20 }} />
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {loading && commits.length > 0 && (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Skeleton width={120} sx={{ mx: 'auto' }} />
        </Box>
      )}

      {hasMore && !loading && (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Button variant="outlined" size="small" onClick={onLoadMore}>
            Load More
          </Button>
        </Box>
      )}
    </Box>
  );
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}
