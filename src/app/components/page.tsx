'use client';

import { Container } from '@mui/material';
import { ComponentEmptyState } from './shared/ComponentEmptyState';
import { allComponents } from './constants/componentData';

export default function ComponentsPage() {
  const muiCoreCount = allComponents.filter(c => c.category === 'mui').length;
  const muiXCount = allComponents.filter(c => c.category === 'mui-x').length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <ComponentEmptyState
        muiCoreCount={muiCoreCount}
        muiXCount={muiXCount}
      />
    </Container>
  );
}
