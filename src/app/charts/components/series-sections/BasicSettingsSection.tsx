"use client";

import {
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  TextField,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Control, Controller, FieldValues, FieldPath } from "react-hook-form";
import { FormSwitch, FormSelect } from "../form-fields";

interface BasicSettingsSectionProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  onFieldChange: (field: FieldPath<TFieldValues>, value: any) => void;
  defaultExpanded?: boolean;
}

export function BasicSettingsSection<TFieldValues extends FieldValues>({
  control,
  onFieldChange,
  defaultExpanded = true,
}: BasicSettingsSectionProps<TFieldValues>) {
  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="subtitle2">Basic Settings</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {/* Series Name - with error handling */}
          <Controller
            name={"name" as FieldPath<TFieldValues>}
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  onFieldChange("name" as FieldPath<TFieldValues>, e.target.value);
                }}
                label="Series Name"
                fullWidth
                size="small"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* Chart Type */}
          <FormSelect
            name={"type" as FieldPath<TFieldValues>}
            control={control}
            label="Chart Type"
            options={[
              { value: "line", label: "Line" },
              { value: "bar", label: "Bar" },
              { value: "scatter", label: "Scatter" },
              { value: "area", label: "Area" },
            ]}
            onFieldChange={onFieldChange}
            native={false}
          />

          {/* Show Series & Clip Overflow */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <FormSwitch
                name={"show" as FieldPath<TFieldValues>}
                control={control}
                label="Show Series"
                onFieldChange={onFieldChange}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormSwitch
                name={"clip" as FieldPath<TFieldValues>}
                control={control}
                label="Clip Overflow"
                onFieldChange={onFieldChange}
              />
            </Grid>
          </Grid>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
