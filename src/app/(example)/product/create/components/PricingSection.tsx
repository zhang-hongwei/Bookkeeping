"use client";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Stack,
  Switch,
  Box,
  InputAdornment,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Controller, Control } from "react-hook-form";
import type { ProductCreateFormData } from "../schema";

interface PricingSectionProps {
  control: Control<ProductCreateFormData>;
  expanded: boolean;
  onChange: (isExpanded: boolean) => void;
}

export function PricingSection({
  control,
  expanded,
  onChange,
}: PricingSectionProps) {
  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => onChange(isExpanded)}
      sx={{
        bgcolor: "grey.900",
        color: "white",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore sx={{ color: "white" }} />}
        sx={{
          "& .MuiAccordionSummary-content": {
            flexDirection: "column",
          },
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Pricing
        </Typography>
        <Typography variant="caption" color="grey.400">
          Price related inputs
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={3}>
          {/* Regular Price */}
          <Box>
            <Typography
              variant="caption"
              color="grey.400"
              sx={{ mb: 1, display: "block" }}
            >
              Regular price
            </Typography>
            <Controller
              name="regularPrice"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  placeholder="0.00"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography color="grey.500">$</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      bgcolor: "grey.800",
                      color: "white",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "grey.700",
                    },
                  }}
                />
              )}
            />
          </Box>

          {/* Sale Price */}
          <Box>
            <Typography
              variant="caption"
              color="grey.400"
              sx={{ mb: 1, display: "block" }}
            >
              Sale price
            </Typography>
            <Controller
              name="salePrice"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  placeholder="0.00"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography color="grey.500">$</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      bgcolor: "grey.800",
                      color: "white",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "grey.700",
                    },
                  }}
                />
              )}
            />
          </Box>

          {/* Price includes taxes */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Controller
              name="priceIncludesTaxes"
              control={control}
              render={({ field }) => (
                <Switch {...field} checked={field.value} />
              )}
            />
            <Typography>Price includes taxes</Typography>
          </Stack>

          {/* Tax Percent */}
          <Box>
            <Typography
              variant="caption"
              color="grey.400"
              sx={{ mb: 1, display: "block" }}
            >
              Tax (%)
            </Typography>
            <Controller
              name="taxPercent"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  placeholder="0.00"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography color="grey.500">%</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      bgcolor: "grey.800",
                      color: "white",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "grey.700",
                    },
                  }}
                />
              )}
            />
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
