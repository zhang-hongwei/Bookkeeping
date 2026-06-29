/**
 * CSS Grid Generator Page
 * Main page - integrated grid layout tool
 */

"use client";

import React from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import CSSGridGenerator from "@/components/features/css-grid-generator";

/**
 * CSS Grid Generator main page
 */
export default function GridGeneratorPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Page header */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              CSS Grid Generator
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Visually create CSS Grid layouts with drag-and-drop areas. Customize columns, rows, and gaps.
            </Typography>
          </Box>

          <Divider />

          {/* Main editing area */}
          <Paper
            elevation={2}
            sx={{
              p: 0,
              overflow: "hidden",
            }}
          >
            <CSSGridGenerator />
          </Paper>

        </Stack>
      </Container>
    </Box>
  );
}
