"use client";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Stack,
  Box,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Controller, Control } from "react-hook-form";
import type { ProductCreateFormData } from "../schema";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { ProductImageUpload } from "./ProductImageUpload";

interface DetailsSectionProps {
  control: Control<ProductCreateFormData>;
  expanded: boolean;
  onChange: (isExpanded: boolean) => void;
}

export function DetailsSection({
  control,
  expanded,
  onChange,
}: DetailsSectionProps) {
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
          Details
        </Typography>
        <Typography variant="caption" color="grey.400">
          Title, short description, image...
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={3}>
          {/* Product Name */}
          <Controller
            name="productName"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                placeholder="Product name"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
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

          {/* Sub Description */}
          <Controller
            name="subDescription"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="Sub description"
                fullWidth
                multiline
                rows={4}
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

          {/* Content Label */}
          <Typography variant="subtitle2" color="grey.300">
            Content
          </Typography>

          {/* Rich Text Editor */}
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <Box sx={{ display: 'block' }}>
                <RichTextEditor
                  value={field.value}
                  onChange={(value) => {
                    console.log('Change')
                  }}
                  placeholder="Write your content here..."
                  emptyEditor={!field.value}
                />
              </Box>
            )}
          />

          {/* Images Label */}
          <Typography variant="subtitle2" color="grey.300">
            Images
          </Typography>

          {/* Image Upload */}
          <ProductImageUpload
            onChange={(files) => {
              // Handle file upload
              console.log("Files:", files);
            }}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
