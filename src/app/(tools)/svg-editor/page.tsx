'use client';

import dynamic from 'next/dynamic';
import { CircularProgress, Box } from '@mui/material';

const SvgEditorApp = dynamic(() => import('./components/SvgEditorApp'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  ),
});

export default function SvgEditorPage() {
  return <SvgEditorApp />;
}
