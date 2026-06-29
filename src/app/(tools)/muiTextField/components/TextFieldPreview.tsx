/**
 * MUI TextField Theme Designer - Preview Component
 * Live preview of the TextField with current theme configuration
 */

"use client";

import React from "react";
import { Stack, Box, Typography, TextField, Paper, OutlinedInput } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

export interface TextFieldPreviewProps {
  variant?: 'outlined' | 'filled' | 'standard';
}

export function TextFieldPreview({ variant = 'outlined' }: TextFieldPreviewProps) {
  const [values, setValues] = React.useState({
    text: '',
    email: '',
    password: '',
    search: '',
  });

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [field]: event.target.value });
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
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 400 }}>
        {/* Default TextField */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Default TextField
          </Typography>
          <TextField
            variant={variant}
            fullWidth
            label="Username"
            value={values.text}
            onChange={handleChange('text')}
            placeholder="Enter your username"
          />
        </Box>

        {/* TextField with Icon (Adornment) */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            With Start Adornment
          </Typography>
          <TextField
            variant={variant}
            fullWidth
            label="Email"
            type="email"
            value={values.email}
            onChange={handleChange('email')}
            placeholder="your@email.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Password TextField */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            With End Adornment
          </Typography>
          <TextField
            variant={variant}
            fullWidth
            label="Password"
            type="password"
            value={values.password}
            onChange={handleChange('password')}
            placeholder="Enter password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <LockIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Search TextField */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Search Field
          </Typography>
          <TextField
            variant={variant}
            fullWidth
            label="Search"
            value={values.search}
            onChange={handleChange('search')}
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Required TextField */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Required Field
          </Typography>
          <TextField
            variant={variant}
            fullWidth
            label="Full Name"
            required
            placeholder="John Doe"
          />
        </Box>

        {/* Error State */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Error State
          </Typography>
          <TextField
            variant={variant}
            fullWidth
            label="Email"
            error
            helperText="Please enter a valid email address"
            defaultValue="invalid-email"
          />
        </Box>

        {/* Disabled State */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Disabled State
          </Typography>
          <TextField
            variant={variant}
            fullWidth
            label="Disabled Field"
            disabled
            defaultValue="Cannot edit"
          />
        </Box>

        {/* Multiline */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Multiline
          </Typography>
          <TextField
            variant={variant}
            fullWidth
            label="Message"
            multiline
            rows={3}
            placeholder="Type your message here..."
          />
        </Box>

        {/* OutlinedInput Section */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ mt: 1 }}>
            ── OutlinedInput (standalone) ──
          </Typography>
        </Box>

        {/* Basic OutlinedInput */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Basic OutlinedInput
          </Typography>
          <OutlinedInput
            fullWidth
            placeholder="Standalone OutlinedInput"
          />
        </Box>

        {/* OutlinedInput with Adornment */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            With Start Adornment
          </Typography>
          <OutlinedInput
            fullWidth
            placeholder="Search..."
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            }
          />
        </Box>

        {/* OutlinedInput with End Adornment */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            With End Adornment
          </Typography>
          <OutlinedInput
            fullWidth
            type="password"
            placeholder="Enter password"
            endAdornment={
              <InputAdornment position="end">
                <LockIcon fontSize="small" />
              </InputAdornment>
            }
          />
        </Box>

        {/* OutlinedInput Error State */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Error State
          </Typography>
          <OutlinedInput
            fullWidth
            error
            defaultValue="invalid input"
          />
        </Box>

        {/* OutlinedInput Disabled State */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Disabled State
          </Typography>
          <OutlinedInput
            fullWidth
            disabled
            defaultValue="Cannot edit"
          />
        </Box>

        {/* OutlinedInput Multiline */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Multiline
          </Typography>
          <OutlinedInput
            fullWidth
            multiline
            rows={3}
            placeholder="Type your message here..."
          />
        </Box>
      </Stack>
    </Box>
  );
}
