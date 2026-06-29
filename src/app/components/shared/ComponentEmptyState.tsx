import {
  Box,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import {
  Widgets as WidgetsIcon,
  Category as CategoryIcon,
  Star as StarIcon,
} from '@mui/icons-material';

interface ComponentEmptyStateProps {
  muiCoreCount: number;
  muiXCount: number;
}

export const ComponentEmptyState = ({
  muiCoreCount,
  muiXCount,
}: ComponentEmptyStateProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
      }}
    >
      <WidgetsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h4" fontWeight={600} gutterBottom>
        MUI Components Gallery
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Select a component from the sidebar to view interactive demos
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
        <Chip
          icon={<CategoryIcon />}
          label={`${muiCoreCount} MUI Core Components`}
        />
        <Chip
          icon={<StarIcon />}
          color="primary"
          label={`${muiXCount} MUI X Components`}
        />
      </Stack>
    </Box>
  );
};
