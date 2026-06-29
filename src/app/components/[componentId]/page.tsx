'use client';

import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import { useParams } from 'next/navigation';
import ComponentDemo from '../demos/ComponentDemo';
import { getComponentById } from '../constants/componentData';

export default function ComponentPage() {
  const params = useParams();
  const componentId = params?.componentId as string;

  const component = getComponentById(componentId);

  if (!component) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Component not found
          </Typography>
          <Typography color="text.secondary">
            The component you're looking for doesn't exist. Please select a component from the sidebar.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }} sx={{ mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {component.name}
          </Typography>
          {component.description && (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {component.description}
            </Typography>
          )}
          <Stack direction="row" spacing={1}>
            {component.badge && (
              <Chip label={component.badge} color="primary" size="small" />
            )}
            <Chip
              label={component.category === 'mui-x' ? 'MUI X' : 'MUI Core'}
              variant="outlined"
              size="small"
            />
          </Stack>
        </Box>
      </Stack>

      {/* Component Demo */}
      <ComponentDemo componentId={componentId} />
    </Container>
  );
}
