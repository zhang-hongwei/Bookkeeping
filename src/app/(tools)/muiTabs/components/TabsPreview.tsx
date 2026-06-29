/**
 * MUI Tabs Theme Designer - Preview Component
 * Live preview of the Tabs with current theme configuration
 */

"use client";

import React from "react";
import { Box, Typography, Tab, Tabs, Paper, Stack } from "@mui/material";

export interface TabsPreviewProps {
  variant?: 'standard' | 'scrollable' | 'fullWidth';
}

export function TabsPreview({ variant = 'standard' }: TabsPreviewProps) {
  const [value1, setValue1] = React.useState(0);
  const [value2, setValue2] = React.useState(0);
  const [value3, setValue3] = React.useState(0);

  const tabs1 = [
    { label: 'Overview', icon: '📊' },
    { label: 'Analytics', icon: '📈' },
    { label: 'Reports', icon: '📄' },
    { label: 'Settings', icon: '⚙️' },
  ];

  const tabs2 = [
    { label: 'Home' },
    { label: 'Profile' },
    { label: 'Messages' },
    { label: 'Notifications' },
    { label: 'Settings' },
  ];

  const tabs3 = [
    { label: 'Dashboard' },
    { label: 'Projects' },
    { label: 'Team' },
  ];

  const handleChange1 = (_: React.SyntheticEvent, newValue: number) => setValue1(newValue);
  const handleChange2 = (_: React.SyntheticEvent, newValue: number) => setValue2(newValue);
  const handleChange3 = (_: React.SyntheticEvent, newValue: number) => setValue3(newValue);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Stack spacing={4} sx={{ width: '100%', maxWidth: 500 }}>
        {/* Tabs with Icons */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Standard Tabs with Icons
          </Typography>
          <Tabs
            value={value1}
            onChange={handleChange1}
            variant={variant}
            scrollButtons={variant === 'scrollable' ? 'auto' : false}
          >
            {tabs1.map((tab, index) => (
              <Tab key={index} label={tab.label} icon={tab.icon} iconPosition="start" />
            ))}
          </Tabs>
        </Box>

        {/* Standard Text Tabs */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Standard Text Tabs
          </Typography>
          <Tabs
            value={value2}
            onChange={handleChange2}
            variant={variant}
            scrollButtons={variant === 'scrollable' ? 'auto' : false}
          >
            {tabs2.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {/* Full Width Tabs */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Full Width Tabs
          </Typography>
          <Tabs
            value={value3}
            onChange={handleChange3}
            variant="fullWidth"
          >
            {tabs3.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {/* Disabled State Example */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            With Disabled Tab
          </Typography>
          <Tabs
            value={0}
            variant={variant}
            scrollButtons={variant === 'scrollable' ? 'auto' : false}
          >
            <Tab label="Active" />
            <Tab label="Disabled" disabled />
            <Tab label="Another Active" />
          </Tabs>
        </Box>
      </Stack>
    </Box>
  );
}
