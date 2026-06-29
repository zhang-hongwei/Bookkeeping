/**
 * FormPreview Component
 * Preview form elements using extracted colors
 */

'use client';

import React from 'react';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  Switch,
  Slider,
  Box,
  Typography,
} from '@mui/material';
import type { UIPreviewTheme } from '../../types';

interface FormPreviewProps {
  previewTheme: UIPreviewTheme;
}

export function FormPreview({ previewTheme }: FormPreviewProps) {
  return (
    <Stack spacing={2} sx={{ maxWidth: 400 }}>
      {/* Text Input */}
      <TextField
        label="Text Input"
        placeholder="Enter text..."
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: previewTheme.border },
            '&:hover fieldset': { borderColor: previewTheme.primary },
            '&.Mui-focused fieldset': { borderColor: previewTheme.primary },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: previewTheme.primary },
        }}
      />

      {/* Select */}
      <FormControl size="small">
        <InputLabel>Select Option</InputLabel>
        <Select
          label="Select Option"
          defaultValue=""
          sx={{
            '& .MuiOutlinedInput-notchedOutline': { borderColor: previewTheme.border },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: previewTheme.primary },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: previewTheme.primary },
          }}
        >
          <MenuItem value="1">Option 1</MenuItem>
          <MenuItem value="2">Option 2</MenuItem>
          <MenuItem value="3">Option 3</MenuItem>
        </Select>
      </FormControl>

      {/* Checkboxes */}
      <Stack direction="row" spacing={2}>
        <FormControlLabel
          control={
            <Checkbox
              defaultChecked
              sx={{
                color: previewTheme.primary,
                '&.Mui-checked': { color: previewTheme.primary },
              }}
            />
          }
          label="Checkbox"
        />
        <FormControlLabel
          control={
            <Checkbox
              sx={{
                color: previewTheme.primary,
                '&.Mui-checked': { color: previewTheme.primary },
              }}
            />
          }
          label="Unchecked"
        />
      </Stack>

      {/* Radio Group */}
      <FormControl>
        <FormLabel sx={{ color: previewTheme.text, '&.Mui-focused': { color: previewTheme.primary } }}>
          Radio Group
        </FormLabel>
        <RadioGroup row defaultValue="option1">
          <FormControlLabel
            value="option1"
            control={<Radio sx={{ '&.Mui-checked': { color: previewTheme.primary } }} />}
            label="Option 1"
          />
          <FormControlLabel
            value="option2"
            control={<Radio sx={{ '&.Mui-checked': { color: previewTheme.primary } }} />}
            label="Option 2"
          />
        </RadioGroup>
      </FormControl>

      {/* Switch */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Switch
          defaultChecked
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': { color: previewTheme.primary },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: previewTheme.primary,
            },
          }}
        />
        <Typography variant="body2">Toggle Switch</Typography>
      </Stack>

      {/* Slider */}
      <Box>
        <Typography variant="body2" sx={{ color: previewTheme.textSecondary, mb: 1 }}>
          Slider
        </Typography>
        <Slider
          defaultValue={50}
          sx={{
            color: previewTheme.primary,
            '& .MuiSlider-thumb': { bgcolor: previewTheme.primary },
            '& .MuiSlider-track': { bgcolor: previewTheme.primary },
            '& .MuiSlider-rail': { bgcolor: previewTheme.border },
          }}
        />
      </Box>
    </Stack>
  );
}
