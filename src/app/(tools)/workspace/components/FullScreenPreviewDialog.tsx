/**
 * FullScreenPreviewDialog
 * Full-screen dialog for previewing palette on real example pages
 */

'use client';

import React, { useState, Suspense, ComponentType } from 'react';
import {
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Chip,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  AccountBalance as BankingIcon,
  Person as UserIcon,
  Description as InvoiceIcon,
  School as CourseIcon,
  Analytics as AnalyticsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { deriveUITheme } from './smartTheme';

// Placeholder components (example pages were removed during refactor)
const PlaceholderPage: ComponentType = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
    <Typography variant="h6" color="text.secondary">
      Preview page coming soon
    </Typography>
  </Box>
);
const AppPage = PlaceholderPage;
const BankingPage = PlaceholderPage;
const InvoicePage = PlaceholderPage;
const UserPage = PlaceholderPage;
const CoursePage = PlaceholderPage;
const AnalyticsPage = PlaceholderPage;

interface PreviewPage {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: ComponentType;
}

const PREVIEW_PAGES: PreviewPage[] = [
  { id: 'dashboard', name: 'Dashboard', icon: <DashboardIcon />, component: AppPage },
  { id: 'banking', name: 'Banking', icon: <BankingIcon />, component: BankingPage },
  { id: 'analytics', name: 'Analytics', icon: <AnalyticsIcon />, component: AnalyticsPage },
  { id: 'course', name: 'E-Learning', icon: <CourseIcon />, component: CoursePage },
  { id: 'invoice', name: 'Invoice', icon: <InvoiceIcon />, component: InvoicePage },
  { id: 'user', name: 'User Profile', icon: <UserIcon />, component: UserPage },
];

interface FullScreenPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  semanticColors: Record<string, string>;
  paletteName: string;
}

export function FullScreenPreviewDialog({
  open,
  onClose,
  semanticColors,
  paletteName,
}: FullScreenPreviewDialogProps) {
  const [activePage, setActivePage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  // Create dynamic theme — derive proper UI colors from palette
  const dynamicTheme = React.useMemo(() => {
    return deriveUITheme(semanticColors, darkMode);
  }, [semanticColors, darkMode]);

  const currentPage = PREVIEW_PAGES.find((p) => p.id === activePage);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      sx={{ zIndex: 9999 }}
    >
      <ThemeProvider theme={dynamicTheme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
          {/* Sidebar */}
          <Drawer
            variant="permanent"
            sx={{
              width: 220,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 220,
                boxSizing: 'border-box',
                bgcolor: 'background.paper',
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper' }}>
              <Toolbar sx={{ minHeight: 56 }}>
                <Typography variant="subtitle2" color="text.secondary" noWrap>
                  Preview Pages
                </Typography>
              </Toolbar>
            </AppBar>

            {/* Page List */}
            <List sx={{ pt: 1 }}>
              {PREVIEW_PAGES.map((page) => (
                <ListItemButton
                  key={page.id}
                  selected={activePage === page.id}
                  onClick={() => setActivePage(page.id)}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                    {page.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={page.name}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItemButton>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Dark Mode Toggle */}
            <Box sx={{ px: 2 }}>
              <Chip
                icon={darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                label={darkMode ? 'Light Mode' : 'Dark Mode'}
                onClick={() => setDarkMode(!darkMode)}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Box>
          </Drawer>

          {/* Main Content */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <AppBar
              position="sticky"
              elevation={0}
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <Toolbar sx={{ minHeight: 56 }}>
                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                  {paletteName} — {currentPage?.name}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
                  <Chip
                    label="Preview Mode"
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' }}
                  />
                </Stack>
                <IconButton color="inherit" onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              </Toolbar>
            </AppBar>

            {/* Page Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              <Suspense
                fallback={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <CircularProgress />
                  </Box>
                }
              >
                {currentPage && <currentPage.component />}
              </Suspense>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </Dialog>
  );
}
