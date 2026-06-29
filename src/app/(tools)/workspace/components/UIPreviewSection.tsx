/**
 * UIPreviewSection
 * Renders real UI components themed with the current palette
 */

'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Alert,
  Stack,
  Chip,
  IconButton,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  Tab,
  Tabs,
  Avatar,
  Badge,
  Tooltip,
  LinearProgress,
  Rating,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Mail as MailIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

export function UIPreviewSection() {
  return (
    <Stack spacing={3}>
      {/* Buttons */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Buttons
        </Typography>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <Button variant="contained">Primary</Button>
          <Button variant="contained" color="secondary">Secondary</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
          <Button variant="contained" startIcon={<CheckIcon />}>
            With Icon
          </Button>
          <Button variant="contained" disabled>Disabled</Button>
          <IconButton color="primary">
            <FavoriteIcon />
          </IconButton>
        </Stack>
      </Paper>

      {/* Card */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Card
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle2">Design System</Typography>
                <Typography variant="caption" color="text.secondary">
                  Updated 2 hours ago
                </Typography>
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ mb: 1 }}>
              This card demonstrates how your palette colors apply to the card component,
              including text, backgrounds, and interactive elements.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip label="UI Kit" size="small" />
              <Chip label="v2.0" size="small" variant="outlined" />
            </Stack>
            <LinearProgress variant="determinate" value={72} sx={{ mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              72% complete
            </Typography>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 1 }}>
            <Button size="small" startIcon={<EditIcon />}>Edit</Button>
            <Button size="small" startIcon={<ShareIcon />}>Share</Button>
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Delete">
              <IconButton size="small" color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </CardActions>
        </Card>
      </Paper>

      {/* Form Inputs */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Form Inputs
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Project Name"
            placeholder="Enter project name..."
            size="small"
            fullWidth
          />
          <TextField
            label="Description"
            placeholder="Describe your project..."
            size="small"
            multiline
            rows={2}
            fullWidth
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Search"
              placeholder="Search..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                },
              }}
              sx={{ flex: 1 }}
            />
            <Button variant="contained">Submit</Button>
          </Stack>
          <Stack direction="row" spacing={3} alignItems="center">
            <FormControlLabel control={<Switch defaultChecked />} label="Active" />
            <Rating defaultValue={4} precision={0.5} />
          </Stack>
        </Stack>
      </Paper>

      {/* Alerts */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Alerts
        </Typography>
        <Stack spacing={1.5}>
          <Alert severity="success">Palette saved successfully!</Alert>
          <Alert severity="info">This is how info messages look with your theme.</Alert>
          <Alert severity="warning">Contrast ratio is below WCAG AA standard.</Alert>
          <Alert severity="error">Failed to generate theme tokens.</Alert>
        </Stack>
      </Paper>

      {/* Navbar / Toolbar */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Navigation Bar
        </Typography>
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: 3,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              MyApp
            </Typography>
            <Tabs
              value={0}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{ minHeight: 0, '& .MuiTab-root': { minHeight: 0, py: 0.5, color: 'inherit', opacity: 0.8 } }}
            >
              <Tab label="Dashboard" sx={{ textTransform: 'none' }} />
              <Tab label="Projects" sx={{ textTransform: 'none' }} />
              <Tab label="Settings" sx={{ textTransform: 'none' }} />
            </Tabs>
            <Box sx={{ flex: 1 }} />
            <IconButton size="small" sx={{ color: 'inherit' }}>
              <SearchIcon />
            </IconButton>
            <IconButton size="small" sx={{ color: 'inherit' }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
            <IconButton size="small" sx={{ color: 'inherit' }}>
              <SettingsIcon fontSize="small" />
            </IconButton>
            <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', ml: 1 }}>
              <PersonIcon sx={{ fontSize: 16 }} />
            </Avatar>
          </Box>
        </Paper>
      </Paper>

      {/* Data Display */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Data Display
        </Typography>
        <Stack spacing={2}>
          {/* Stats Row */}
          <Stack direction="row" spacing={2}>
            {['12.4K', '$8.2K', '96.3%'].map((value, i) => (
              <Paper key={i} variant="outlined" sx={{ flex: 1, p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="primary">
                  {value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {['Users', 'Revenue', 'Uptime'][i]}
                </Typography>
              </Paper>
            ))}
          </Stack>
          {/* Chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="Brand" color="primary" />
            <Chip label="Project" color="secondary" />
            <Chip label="Inspiration" variant="outlined" />
            <Chip icon={<MailIcon />} label="Contact" variant="outlined" />
            <Chip label="Active" color="success" />
            <Chip label="Pending" color="warning" />
            <Chip label="Error" color="error" />
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
