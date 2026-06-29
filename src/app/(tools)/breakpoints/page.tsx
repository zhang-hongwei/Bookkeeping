/**
 * Breakpoints Visualizer Page
 * Visualize and export responsive breakpoints
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Grid,
} from "@mui/material";
import { BreakpointVisualizer } from "./components/BreakpointVisualizer";
import { MediaQueryExportDialog } from "./components/MediaQueryExportDialog";
import { BREAKPOINT_PRESETS, getPresetByFramework } from "./breakpoints";
import type { Breakpoint, FrameworkType } from "./types";

export default function BreakpointsPage() {
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType>("tailwind");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const breakpoints: Breakpoint[] = useMemo(() => {
    const preset = getPresetByFramework(selectedFramework);
    return preset?.breakpoints || [];
  }, [selectedFramework]);

  const handleFrameworkChange = (
    _: React.MouseEvent<HTMLElement>,
    newFramework: FrameworkType | null
  ) => {
    if (newFramework) {
      setSelectedFramework(newFramework);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Page header */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Responsive Breakpoints
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Visualize and export responsive breakpoints for popular frameworks
            </Typography>
          </Box>

          <Divider />

          {/* Framework selector */}
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Framework Preset
            </Typography>
            <ToggleButtonGroup
              value={selectedFramework}
              exclusive
              onChange={handleFrameworkChange}
              size="small"
            >
              {BREAKPOINT_PRESETS.map((preset) => (
                <ToggleButton key={preset.framework} value={preset.framework}>
                  {preset.name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Paper>

          {/* Main content */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <BreakpointVisualizer breakpoints={breakpoints} />
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={3}>
                {/* Quick reference */}
                <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Quick Reference
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {breakpoints.map((bp) => (
                      <Chip
                        key={bp.name}
                        label={`${bp.name.toUpperCase()}: ${bp.minWidth}px`}
                        size="small"
                        onClick={() =>
                          navigator.clipboard.writeText(`@media (min-width: ${bp.minWidth}px)`)
                        }
                        sx={{
                          bgcolor: bp.color || "primary.main",
                          color: "white",
                          "&:hover": {
                            opacity: 0.9,
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Paper>

                {/* Common devices */}
                <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Common Device Widths
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Phones
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                        {[320, 375, 414, 428].map((w) => (
                          <Chip key={w} label={`${w}px`} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Tablets
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                        {[768, 834, 1024].map((w) => (
                          <Chip key={w} label={`${w}px`} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Desktops
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                        {[1280, 1440, 1920].map((w) => (
                          <Chip key={w} label={`${w}px`} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  </Stack>
                </Paper>

                {/* Export button */}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => setExportDialogOpen(true)}
                >
                  Export Media Queries
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {/* Tips */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: "info.light",
              color: "info.contrastText",
            }}
          >
            <Typography variant="body2" gutterBottom fontWeight="bold">
              Tips:
            </Typography>
            <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
              <Typography component="li" variant="caption">
                Mobile-first approach: Use min-width media queries for progressive enhancement
              </Typography>
              <Typography component="li" variant="caption">
                Click any breakpoint chip to copy the media query to clipboard
              </Typography>
              <Typography component="li" variant="caption">
                Tailwind uses sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px
              </Typography>
              <Typography component="li" variant="caption">
                Material UI uses xs:0, sm:600, md:900, lg:1200, xl:1536
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      {/* Export dialog */}
      <MediaQueryExportDialog
        open={exportDialogOpen}
        breakpoints={breakpoints}
        framework={selectedFramework}
        onClose={() => setExportDialogOpen(false)}
      />
    </Box>
  );
}
