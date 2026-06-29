/**
 * MUI OutlinedInput Theme Designer - Preview Component
 * Uses CSS variables for zero re-render style updates
 */

"use client";

import React, { useState } from "react";
import { Stack, Box, Typography, OutlinedInput, Paper } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";

const inputSx = {
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--oi-border-color)",
    borderWidth: "var(--oi-border-width)",
    borderRadius: "var(--oi-border-radius)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--oi-border-hover-color)",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--oi-border-focus-color)",
    borderWidth: 2,
  },
  "&.Mui-error .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--oi-border-error-color)",
  },
  "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--oi-border-disabled-color)",
  },
  "& .MuiOutlinedInput-input": {
    color: "var(--oi-input-color)",
    fontSize: "var(--oi-input-font-size)",
    fontWeight: "var(--oi-input-font-weight)",
    padding: "var(--oi-input-padding) 14px",
    height: "var(--oi-input-height)",
    backgroundColor: "var(--oi-input-bg)",
    "&::placeholder": {
      color: "var(--oi-input-placeholder-color)",
      opacity: 1,
    },
    "&.Mui-disabled": {
      color: "var(--oi-input-disabled-color)",
      WebkitTextFillColor: "var(--oi-input-disabled-color)",
    },
  },
  "& .MuiOutlinedInput-notchedOutline legend": {
    fontSize: "var(--oi-legend-font-size)",
    "& > span": {
      color: "var(--oi-legend-color)",
    },
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline legend > span": {
    color: "var(--oi-legend-focus-color)",
  },
  "& .MuiInputAdornment-root": {
    color: "var(--oi-adornment-color)",
    "&:hover": {
      color: "var(--oi-adornment-hover-color)",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "var(--oi-adornment-font-size)",
    },
  },
} as const;

export const OutlinedInputPreview = React.memo(function OutlinedInputPreview() {
  const [values, setValues] = useState({
    basic: "",
    search: "",
    password: "",
  });

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 4, overflow: 'auto', height: '500px' }}>
      <Stack spacing={3} sx={{ width: "100%", maxWidth: 400 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Basic
          </Typography>
          <OutlinedInput
            fullWidth
            placeholder="Enter text..."
            value={values.basic}
            onChange={handleChange("basic")}
            sx={inputSx}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            With Label (via FormControl)
          </Typography>
          <OutlinedInput fullWidth placeholder="Username" notched={false} sx={inputSx} />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            With Start Adornment
          </Typography>
          <OutlinedInput
            fullWidth
            placeholder="Search..."
            value={values.search}
            onChange={handleChange("search")}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            }
            sx={inputSx}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            With End Adornment
          </Typography>
          <OutlinedInput
            fullWidth
            type="password"
            placeholder="Enter password"
            value={values.password}
            onChange={handleChange("password")}
            endAdornment={
              <InputAdornment position="end">
                <VisibilityIcon fontSize="small" />
              </InputAdornment>
            }
            sx={inputSx}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Both Adornments
          </Typography>
          <OutlinedInput
            fullWidth
            placeholder="Password"
            startAdornment={
              <InputAdornment position="start">
                <LockIcon fontSize="small" />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <VisibilityIcon fontSize="small" />
              </InputAdornment>
            }
            sx={inputSx}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Error State
          </Typography>
          <OutlinedInput fullWidth error defaultValue="invalid input" sx={inputSx} />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Disabled State
          </Typography>
          <OutlinedInput fullWidth disabled defaultValue="Cannot edit" sx={inputSx} />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Multiline
          </Typography>
          <OutlinedInput fullWidth multiline rows={3} placeholder="Type your message here..." sx={inputSx} />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Small Size
          </Typography>
          <OutlinedInput fullWidth size="small" placeholder="Small input..." sx={inputSx} />
        </Box>

        <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Preview renders via CSS variables — zero React re-renders on token changes.
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
});
