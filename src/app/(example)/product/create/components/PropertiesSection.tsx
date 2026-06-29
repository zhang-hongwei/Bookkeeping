"use client";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Stack,
  Grid,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  FormControlLabel,
  Switch,
  Box,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Controller, Control } from "react-hook-form";
import type { ProductCreateFormData } from "../schema";

interface PropertiesSectionProps {
  control: Control<ProductCreateFormData>;
  expanded: boolean;
  onChange: (isExpanded: boolean) => void;
}

export function PropertiesSection({
  control,
  expanded,
  onChange,
}: PropertiesSectionProps) {
  const categories = ["T-shirts", "Hoodies", "Shoes", "Accessories"];
  const colorOptions = ["Red", "Blue", "Green", "Black", "White"];
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];

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
          Properties
        </Typography>
        <Typography variant="caption" color="grey.400">
          Additional functions and attributes...
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={3}>
          {/* Product Code and SKU */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="productCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    placeholder="Product code"
                    fullWidth
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
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="productSKU"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    placeholder="Product SKU"
                    fullWidth
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
            </Grid>
          </Grid>

          {/* Quantity and Category */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography
                  variant="caption"
                  color="grey.400"
                  sx={{ mb: 1, display: "block" }}
                >
                  Quantity
                </Typography>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      placeholder="0"
                      fullWidth
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
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography
                  variant="caption"
                  color="grey.400"
                  sx={{ mb: 1, display: "block" }}
                >
                  Category
                </Typography>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <Select
                        {...field}
                        sx={{
                          bgcolor: "grey.800",
                          color: "white",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "grey.700",
                          },
                        }}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category} value={category.toLowerCase()}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Colors and Sizes */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="colors"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <Select
                      {...field}
                      multiple
                      displayEmpty
                      renderValue={(selected) =>
                        Array.isArray(selected) && selected.length > 0
                          ? selected.join(", ")
                          : "Colors"
                      }
                      sx={{
                        bgcolor: "grey.800",
                        color: selected =>
                          Array.isArray(field.value) && field.value.length > 0
                            ? "white"
                            : "grey.500",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "grey.700",
                        },
                      }}
                    >
                      {colorOptions.map((color) => (
                        <MenuItem key={color} value={color}>
                          {color}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="sizes"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <Select
                      {...field}
                      multiple
                      displayEmpty
                      renderValue={(selected) =>
                        Array.isArray(selected) && selected.length > 0
                          ? selected.join(", ")
                          : "Sizes"
                      }
                      sx={{
                        bgcolor: "grey.800",
                        color: selected =>
                          Array.isArray(field.value) && field.value.length > 0
                            ? "white"
                            : "grey.500",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "grey.700",
                        },
                      }}
                    >
                      {sizeOptions.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

          {/* Tags */}
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="Tags"
                fullWidth
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

          {/* Gender */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Gender
            </Typography>
            <Stack direction="row" spacing={3}>
              <Controller
                name="gender.men"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        sx={{ color: "grey.500" }}
                      />
                    }
                    label="Men"
                  />
                )}
              />
              <Controller
                name="gender.women"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        sx={{ color: "grey.500" }}
                      />
                    }
                    label="Women"
                  />
                )}
              />
              <Controller
                name="gender.kids"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        sx={{ color: "grey.500" }}
                      />
                    }
                    label="Kids"
                  />
                )}
              />
            </Stack>
          </Box>

          {/* Sale Label */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Controller
              name="saleLabel.enabled"
              control={control}
              render={({ field }) => (
                <Switch {...field} checked={field.value} />
              )}
            />
            <Controller
              name="saleLabel.text"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Sale label"
                  fullWidth
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
          </Stack>

          {/* New Label */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Controller
              name="newLabel.enabled"
              control={control}
              render={({ field }) => (
                <Switch {...field} checked={field.value} />
              )}
            />
            <Controller
              name="newLabel.text"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="New label"
                  fullWidth
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
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
