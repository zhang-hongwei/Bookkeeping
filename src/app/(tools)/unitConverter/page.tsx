/**
 * Unit Converter Page
 * px/rem/em/vw/vh unit conversion tool
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ContentCopy as CopyIcon, SwapHoriz as SwapIcon } from "@mui/icons-material";

type Unit = 'px' | 'rem' | 'em' | 'vw' | 'vh' | 'pt' | '%';

interface ConversionResult {
  value: number;
  unit: Unit;
  formatted: string;
}

// Base values for conversion
const BASE_FONT_SIZE = 16; // Default browser font size (px)
const VIEWPORT_WIDTH = 1440; // Default viewport width for vw
const VIEWPORT_HEIGHT = 900; // Default viewport height for vh

const UNIT_INFO: Record<Unit, { label: string; description: string }> = {
  px: { label: 'Pixels (px)', description: 'Absolute unit, 1px = 1/96 inch' },
  rem: { label: 'Root EM (rem)', description: 'Relative to root font size (16px default)' },
  em: { label: 'EM (em)', description: 'Relative to parent element font size' },
  vw: { label: 'Viewport Width (vw)', description: '1vw = 1% of viewport width' },
  vh: { label: 'Viewport Height (vh)', description: '1vh = 1% of viewport height' },
  pt: { label: 'Points (pt)', description: 'Print unit, 1pt = 1/72 inch' },
  '%': { label: 'Percent (%)', description: 'Relative to parent element' },
};

export default function UnitConverterPage() {
  const [inputValue, setInputValue] = useState(16);
  const [inputUnit, setInputUnit] = useState<Unit>('px');
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [viewportWidth, setViewportWidth] = useState(1440);
  const [viewportHeight, setViewportHeight] = useState(900);

  // Convert to px first (base unit)
  const toPixels = (value: number, fromUnit: Unit): number => {
    switch (fromUnit) {
      case 'px':
        return value;
      case 'rem':
        return value * baseFontSize;
      case 'em':
        return value * baseFontSize;
      case 'vw':
        return (value / 100) * viewportWidth;
      case 'vh':
        return (value / 100) * viewportHeight;
      case 'pt':
        return value * (96 / 72);
      case '%':
        return (value / 100) * baseFontSize;
      default:
        return value;
    }
  };

  // Convert from px to target unit
  const fromPixels = (px: number, toUnit: Unit): number => {
    switch (toUnit) {
      case 'px':
        return px;
      case 'rem':
        return px / baseFontSize;
      case 'em':
        return px / baseFontSize;
      case 'vw':
        return (px / viewportWidth) * 100;
      case 'vh':
        return (px / viewportHeight) * 100;
      case 'pt':
        return px * (72 / 96);
      case '%':
        return (px / baseFontSize) * 100;
      default:
        return px;
    }
  };

  // Calculate all conversions
  const conversions = useMemo(() => {
    const pxValue = toPixels(inputValue, inputUnit);
    const units: Unit[] = ['px', 'rem', 'em', 'vw', 'vh', 'pt', '%'];

    return units.map((unit) => ({
      unit,
      value: fromPixels(pxValue, unit),
      formatted: `${fromPixels(pxValue, unit).toFixed(4)}${unit}`,
    }));
  }, [inputValue, inputUnit, baseFontSize, viewportWidth, viewportHeight]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3}>
          {/* Page header */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              CSS Unit Converter
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Convert between px, rem, em, vw, vh, pt, and %
            </Typography>
          </Box>

          <Divider />

          {/* Input section */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={6}>
                <TextField
                  label="Value"
                  value={inputValue}
                  onChange={(e) => setInputValue(Number(e.target.value))}
                  type="number"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={inputUnit}
                    label="Unit"
                    onChange={(e) => setInputUnit(e.target.value as Unit)}
                  >
                    {Object.entries(UNIT_INFO).map(([unit, info]) => (
                      <MenuItem key={unit} value={unit}>
                        {info.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Settings section */}
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Base Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid size={4}>
                <TextField
                  label="Base Font Size (px)"
                  value={baseFontSize}
                  onChange={(e) => setBaseFontSize(Number(e.target.value))}
                  type="number"
                  size="small"
                  fullWidth
                  helperText="Default: 16px"
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Viewport Width (px)"
                  value={viewportWidth}
                  onChange={(e) => setViewportWidth(Number(e.target.value))}
                  type="number"
                  size="small"
                  fullWidth
                  helperText="For vw conversion"
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Viewport Height (px)"
                  value={viewportHeight}
                  onChange={(e) => setViewportHeight(Number(e.target.value))}
                  type="number"
                  size="small"
                  fullWidth
                  helperText="For vh conversion"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Conversions section */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Conversions
            </Typography>
            <Grid container spacing={1}>
              {conversions.map(({ unit, value, formatted }) => (
                <Grid size={6} key={unit}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      bgcolor: inputUnit === unit ? "primary.light" : "background.paper",
                      borderColor: inputUnit === unit ? "primary.main" : undefined,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {UNIT_INFO[unit].label}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formatted}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(formatted)}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Quick reference */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: "info.light",
              color: "info.contrastText",
            }}
          >
            <Typography variant="body2" gutterBottom fontWeight="bold">
              Quick Reference
            </Typography>
            <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
              <Typography component="li" variant="caption">
                <strong>1rem</strong> = 16px (default browser font size)
              </Typography>
              <Typography component="li" variant="caption">
                <strong>1em</strong> = Parent element&apos;s font size
              </Typography>
              <Typography component="li" variant="caption">
                <strong>1vw</strong> = 1% of viewport width
              </Typography>
              <Typography component="li" variant="caption">
                <strong>1vh</strong> = 1% of viewport height
              </Typography>
              <Typography component="li" variant="caption">
                <strong>1pt</strong> = 1/72 inch (print)
              </Typography>
            </Stack>
          </Paper>

          {/* Common values table */}
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Common Values (Base: {baseFontSize}px)
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96].map((px) => (
                <Chip
                  key={px}
                  label={`${px}px = ${(px / baseFontSize).toFixed(4)}rem`}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setInputValue(px);
                    setInputUnit('px');
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
