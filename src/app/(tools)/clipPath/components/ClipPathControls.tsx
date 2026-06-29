/**
 * Clip Path Controls Panel
 * Shape mode, presets, canvas settings, grid, image upload
 */

"use client";

import React, { useRef } from "react";
import {
  Box,
  Typography,
  Stack,
  Divider,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Button,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  ButtonGroup,
} from "@mui/material";
import {
  CenterFocusStrong,
  Add,
  RestartAlt,
  Upload,
  LinkOff,
} from "@mui/icons-material";
import { useClipPathStore, useClipPathActions } from "@/store/clip-path";
import type { ClipPathMode } from "@/store/clip-path/types";

const SHAPE_MODES: { value: ClipPathMode; label: string }[] = [
  { value: "polygon", label: "Polygon" },
  { value: "circle", label: "Circle" },
  { value: "ellipse", label: "Ellipse" },
  { value: "inset", label: "Inset" },
];

const ASPECT_RATIOS = [
  { label: "1:1", w: 450, h: 450 },
  { label: "16:9", w: 480, h: 270 },
  { label: "9:16", w: 270, h: 480 },
  { label: "4:3", w: 400, h: 300 },
  { label: "3:4", w: 300, h: 400 },
  { label: "2:1", w: 500, h: 250 },
];

export function ClipPathControls() {
  const mode = useClipPathStore((s) => s.mode);
  const polygonPoints = useClipPathStore((s) => s.polygonPoints);
  const circle = useClipPathStore((s) => s.circle);
  const ellipse = useClipPathStore((s) => s.ellipse);
  const inset = useClipPathStore((s) => s.inset);
  const canvasSize = useClipPathStore((s) => s.canvasSize);
  const scale = useClipPathStore((s) => s.scale);
  const imageFit = useClipPathStore((s) => s.imageFit);
  const imageUrl = useClipPathStore((s) => s.imageUrl);
  const backgroundColor = useClipPathStore((s) => s.backgroundColor);
  const showGrid = useClipPathStore((s) => s.showGrid);
  const snapToGrid = useClipPathStore((s) => s.snapToGrid);
  const gridSize = useClipPathStore((s) => s.gridSize);
  const showOutside = useClipPathStore((s) => s.showOutside);
  const selectedPointIndex = useClipPathStore((s) => s.selectedPointIndex);

  const {
    setMode,
    updateCircle,
    updateEllipse,
    updateInset,
    applyPreset,
    addPolygonPoint,
    movePolygonPoint,
    removePolygonPoint,
    setScale,
    setCanvasSize,
    setImageFit,
    setBackgroundColor,
    toggleGrid,
    toggleSnap,
    setGridSize,
    toggleOutside,
    uploadImage,
    centerShape,
    reset,
  } = useClipPathActions();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
      e.target.value = "";
    }
  };

  return (
    <Stack spacing={2.5} sx={{
      p: 2,
      // border: '1px solid red',
      overflowY: 'auto',
      '&::-webkit-scrollbar': { display: 'none' },
      scrollbarWidth: 'none',
    }}>
      {/* Shape Mode */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Shape Mode
        </Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, value: ClipPathMode | null) => {
            if (value) setMode(value);
          }}
          size="small"
          fullWidth
        >
          {SHAPE_MODES.map((m) => (
            <ToggleButton key={m.value} value={m.value} sx={{ typography: "caption" }}>
              {m.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Add Point button (polygon) */}
      {mode === "polygon" && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<Add />}
          onClick={() => {
            const last = polygonPoints[polygonPoints.length - 1];
            const first = polygonPoints[0];
            addPolygonPoint(polygonPoints.length - 1, {
              x: (last.x + first.x) / 2,
              y: (last.y + first.y) / 2,
            });
          }}
          fullWidth
        >
          Add Point
        </Button>
      )}

      {/* Mode-specific controls */}
      {mode === "circle" && (
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Radius: {circle.radius.toFixed(1)}%
            </Typography>
            <Slider
              value={circle.radius}
              onChange={(_, v) => updateCircle({ radius: v as number })}
              min={1}
              max={100}
              size="small"
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Center X: {circle.centerX.toFixed(1)}%
            </Typography>
            <Slider
              value={circle.centerX}
              onChange={(_, v) => updateCircle({ centerX: v as number })}
              min={0}
              max={100}
              size="small"
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Center Y: {circle.centerY.toFixed(1)}%
            </Typography>
            <Slider
              value={circle.centerY}
              onChange={(_, v) => updateCircle({ centerY: v as number })}
              min={0}
              max={100}
              size="small"
            />
          </Box>
        </Stack>
      )}

      {mode === "ellipse" && (
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Radius X: {ellipse.radiusX.toFixed(1)}%
            </Typography>
            <Slider
              value={ellipse.radiusX}
              onChange={(_, v) => updateEllipse({ radiusX: v as number })}
              min={1}
              max={100}
              size="small"
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Radius Y: {ellipse.radiusY.toFixed(1)}%
            </Typography>
            <Slider
              value={ellipse.radiusY}
              onChange={(_, v) => updateEllipse({ radiusY: v as number })}
              min={1}
              max={100}
              size="small"
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Center X: {ellipse.centerX.toFixed(1)}%
            </Typography>
            <Slider
              value={ellipse.centerX}
              onChange={(_, v) => updateEllipse({ centerX: v as number })}
              min={0}
              max={100}
              size="small"
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Center Y: {ellipse.centerY.toFixed(1)}%
            </Typography>
            <Slider
              value={ellipse.centerY}
              onChange={(_, v) => updateEllipse({ centerY: v as number })}
              min={0}
              max={100}
              size="small"
            />
          </Box>
        </Stack>
      )}

      {mode === "inset" && (
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Top: {inset.top}%
            </Typography>
            <Slider
              value={inset.top}
              onChange={(_, v) => updateInset({ top: v as number })}
              min={0}
              max={49}
              size="small"
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Right: {inset.right}%
            </Typography>
            <Slider
              value={inset.right}
              onChange={(_, v) => updateInset({ right: v as number })}
              min={0}
              max={49}
              size="small"
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Bottom: {inset.bottom}%
            </Typography>
            <Slider
              value={inset.bottom}
              onChange={(_, v) => updateInset({ bottom: v as number })}
              min={0}
              max={49}
              size="small"
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Left: {inset.left}%
            </Typography>
            <Slider
              value={inset.left}
              onChange={(_, v) => updateInset({ left: v as number })}
              min={0}
              max={49}
              size="small"
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Border Radius: {inset.borderRadius}px
            </Typography>
            <Slider
              value={inset.borderRadius}
              onChange={(_, v) => updateInset({ borderRadius: v as number })}
              min={0}
              max={50}
              size="small"
            />
          </Box>
        </Stack>
      )}

      {/* Selected polygon point nudge controls */}
      {mode === "polygon" && selectedPointIndex !== null && polygonPoints[selectedPointIndex] && (
        <>
          <Divider />
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Point {selectedPointIndex + 1}
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                label="X"
                type="number"
                size="small"
                value={polygonPoints[selectedPointIndex].x.toFixed(1)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    movePolygonPoint(selectedPointIndex, val, polygonPoints[selectedPointIndex].y);
                  }
                }}
                inputProps={{ min: 0, max: 100, step: 0.5 }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Y"
                type="number"
                size="small"
                value={polygonPoints[selectedPointIndex].y.toFixed(1)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    movePolygonPoint(selectedPointIndex, polygonPoints[selectedPointIndex].x, val);
                  }
                }}
                inputProps={{ min: 0, max: 100, step: 0.5 }}
                sx={{ flex: 1 }}
              />
            </Stack>
            <Button
              size="small"
              color="error"
              disabled={polygonPoints.length <= 3}
              onClick={() => removePolygonPoint(selectedPointIndex)}
              sx={{ mt: 1 }}
              fullWidth
            >
              Delete Point
            </Button>
          </Box>
        </>
      )}

      <Divider />

      {/* Center button */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Center shape">
          <IconButton size="small" onClick={centerShape}>
            <CenterFocusStrong />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" sx={{ alignSelf: "center" }}>
          SCALE {scale.toFixed(1)}x
        </Typography>
        <Slider
          value={scale}
          onChange={(_, v) => setScale(v as number)}
          min={0.5}
          max={2}
          step={0.1}
          size="small"
          sx={{ flex: 1 }}
        />
      </Box>

      <Divider />

      {/* Canvas Size */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Canvas Size
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            label="Width"
            size="small"
            type="number"
            value={canvasSize.width}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (val > 0) setCanvasSize({ width: val });
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Height"
            size="small"
            type="number"
            value={canvasSize.height}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (val > 0) setCanvasSize({ height: val });
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
            sx={{ flex: 1 }}
          />
        </Stack>
        {/* Aspect ratio presets */}
        <ButtonGroup size="small" sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}>
          {ASPECT_RATIOS.map((ar) => (
            <Button
              key={ar.label}
              variant={
                canvasSize.width === ar.w && canvasSize.height === ar.h
                  ? "contained"
                  : "outlined"
              }
              size="small"
              onClick={() => setCanvasSize({ width: ar.w, height: ar.h })}
              sx={{ minWidth: 30, typography: "caption", px: '0' }}
            >
              {ar.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Image Fit */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Image Fit
        </Typography>
        <ToggleButtonGroup
          value={imageFit}
          exclusive
          onChange={(_, v) => { if (v) setImageFit(v); }}
          size="small"
          fullWidth
        >
          <ToggleButton value="stretch" sx={{ typography: "caption" }}>
            Stretch
          </ToggleButton>
          <ToggleButton value="cover" sx={{ typography: "caption" }}>
            Cover
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider />

      {/* Grid & Snap */}
      <Box>
        <FormControlLabel
          control={<Checkbox size="small" checked={showGrid} onChange={toggleGrid} />}
          label={<Typography variant="caption">Show Grid</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" checked={snapToGrid} onChange={toggleSnap} />}
          label={<Typography variant="caption">Snap to Grid</Typography>}
        />
        {snapToGrid && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Grid Density: {gridSize}%
            </Typography>
            <Slider
              value={gridSize}
              onChange={(_, v) => setGridSize(v as number)}
              min={1}
              max={20}
              size="small"
            />
          </Box>
        )}
        <FormControlLabel
          control={<Checkbox size="small" checked={showOutside} onChange={toggleOutside} />}
          label={<Typography variant="caption">Show Outside Area</Typography>}
        />
      </Box>

      <Divider />

      {/* Image Upload */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Background
        </Typography>
        <Stack spacing={1}>
          <TextField
            label="Preview Color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            size="small"
            type="color"
            fullWidth
            disabled={!!imageUrl}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
          >
            Upload Image
          </Button>
          {imageUrl && (
            <Button
              size="small"
              color="error"
              variant="text"
              startIcon={<LinkOff />}
              onClick={() => useClipPathStore.getState().setImageUrl(null)}
              fullWidth
            >
              Remove Image
            </Button>
          )}
        </Stack>
      </Box>

      <Divider />

      {/* Reset */}
      <Button
        size="small"
        variant="outlined"
        startIcon={<RestartAlt />}
        onClick={reset}
        fullWidth
      >
        Reset
      </Button>
    </Stack>
  );
}
