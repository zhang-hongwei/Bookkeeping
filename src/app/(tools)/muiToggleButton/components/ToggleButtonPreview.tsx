/**
 * MUI ToggleButton Theme Designer - Preview Component
 * Live preview of the ToggleButton with current theme configuration
 */

"use client";

import React from "react";
import { Box, Typography, ToggleButton, ToggleButtonGroup, Paper, Stack } from "@mui/material";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import ViewDayIcon from "@mui/icons-material/ViewDay";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";

export function ToggleButtonPreview() {
  const [alignment, setAlignment] = React.useState<string | null>('left');
  const [formats, setFormats] = React.useState<string | []>([]);
  const [view, setView] = React.useState<string | null>('week');

  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null,
  ) => {
    setAlignment(newAlignment);
  };

  const handleFormat = (
    event: React.MouseEvent<HTMLElement>,
    newFormats: string | [],
  ) => {
    setFormats(newFormats);
  };

  const handleView = (
    event: React.MouseEvent<HTMLElement>,
    newView: string | null,
  ) => {
    setView(newView);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Stack spacing={4} sx={{ width: '100%', maxWidth: 400 }}>
        {/* Single Selection */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Text Alignment (Single Selection)
          </Typography>
          <ToggleButtonGroup
            value={alignment}
            exclusive
            onChange={handleAlignment}
            aria-label="text alignment"
            fullWidth
          >
            <ToggleButton value="left" aria-label="left aligned">
              <FormatAlignLeftIcon />
            </ToggleButton>
            <ToggleButton value="center" aria-label="centered">
              <FormatAlignCenterIcon />
            </ToggleButton>
            <ToggleButton value="right" aria-label="right aligned">
              <FormatAlignRightIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Multiple Selection */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Text Format (Multiple Selection)
          </Typography>
          <ToggleButtonGroup
            value={formats}
            onChange={handleFormat}
            aria-label="text formatting"
            fullWidth
          >
            <ToggleButton value="bold" aria-label="bold">
              <FormatBoldIcon />
            </ToggleButton>
            <ToggleButton value="italic" aria-label="italic">
              <FormatItalicIcon />
            </ToggleButton>
            <ToggleButton value="underlined" aria-label="underlined">
              <FormatUnderlinedIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Vertical Orientation */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ mr: 2 }}>
            View (Vertical)
          </Typography>
          <ToggleButtonGroup
            orientation="vertical"
            value={view}
            exclusive
            onChange={handleView}
            aria-label="view"
          >
            <ToggleButton value="week" aria-label="week">
              <ViewWeekIcon />
            </ToggleButton>
            <ToggleButton value="day" aria-label="day">
              <ViewDayIcon />
            </ToggleButton>
            <ToggleButton value="agenda" aria-label="agenda">
              <ViewAgendaIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* With Labels */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            With Labels
          </Typography>
          <ToggleButtonGroup
            value={alignment}
            exclusive
            onChange={handleAlignment}
            aria-label="device"
            fullWidth
          >
            <ToggleButton value="laptop" aria-label="laptop">
              💻 Laptop
            </ToggleButton>
            <ToggleButton value="phone" aria-label="phone">
              📱 Phone
            </ToggleButton>
            <ToggleButton value="tablet" aria-label="tablet">
              📱 Tablet
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Three States */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Size Options
          </Typography>
          <ToggleButtonGroup
            value={alignment}
            exclusive
            onChange={handleAlignment}
            aria-label="size"
            fullWidth
          >
            <ToggleButton value="small" aria-label="small">
              S
            </ToggleButton>
            <ToggleButton value="medium" aria-label="medium">
              M
            </ToggleButton>
            <ToggleButton value="large" aria-label="large">
              L
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Stack>
    </Box>
  );
}
