"use client";

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface CanvasErrorBoundaryProps {
  children: ReactNode;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary that catches rendering errors from the Konva Canvas
 * and displays a fallback UI with a reload button.
 */
export class CanvasErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  constructor(props: CanvasErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): CanvasErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[CanvasErrorBoundary] Rendering error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            bgcolor: '#ffffff',
            gap: 2,
            p: 4,
          }}
        >
          <Typography variant="h5" color="text.primary">
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The canvas encountered an unexpected error.
          </Typography>
          <Button variant="contained" onClick={this.handleReload}>
            Reload Canvas
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
