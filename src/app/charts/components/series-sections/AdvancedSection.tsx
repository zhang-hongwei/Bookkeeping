"use client";

import {
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Control, FieldValues, FieldPath, UseFormWatch } from "react-hook-form";
import {
  FormSwitch,
  FormSelect,
  FormTextField,
  OptimizedColorPicker,
} from "../form-fields";

interface AdvancedSectionProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  watch: UseFormWatch<TFieldValues>;
  onFieldChange: (field: FieldPath<TFieldValues>, value: any) => void;
}

export function AdvancedSection<TFieldValues extends FieldValues>({
  control,
  watch,
  onFieldChange,
}: AdvancedSectionProps<TFieldValues>) {
  const stackValue = watch("stack" as FieldPath<TFieldValues>);

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="subtitle2">Advanced</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {/* Stack Group */}
          <FormTextField
            name={"stack" as FieldPath<TFieldValues>}
            control={control}
            label="Stack Group"
            placeholder="Leave empty for no stack"
            onFieldChange={onFieldChange}
          />

          {/* Stack Strategy - 仅在设置了 stack 时显示 */}
          {stackValue && (
            <FormSelect
              name={"stackStrategy" as FieldPath<TFieldValues>}
              control={control}
              label="Stack Strategy"
              options={[
                { value: "samesign", label: "Same Sign (Default)" },
                { value: "all", label: "All Values" },
                { value: "positive", label: "Positive Only" },
                { value: "negative", label: "Negative Only" },
              ]}
              onFieldChange={onFieldChange}
              native={false}
            />
          )}

          {/* Data Sampling */}
          <FormSelect
            name={"sampling" as FieldPath<TFieldValues>}
            control={control}
            label="Data Sampling"
            options={[
              { value: "none", label: "None" },
              { value: "average", label: "Average" },
              { value: "max", label: "Max" },
              { value: "min", label: "Min" },
              { value: "sum", label: "Sum" },
              { value: "lttb", label: "LTTB" },
            ]}
            onFieldChange={onFieldChange}
            native={false}
          />

          {/* Show Label */}
          <FormSwitch
            name={"labelShow" as FieldPath<TFieldValues>}
            control={control}
            label="Show Label"
            onFieldChange={onFieldChange}
          />

          {/* Label Position */}
          <FormSelect
            name={"labelPosition" as FieldPath<TFieldValues>}
            control={control}
            label="Label Position"
            options={[
              { value: "top", label: "Top" },
              { value: "bottom", label: "Bottom" },
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
              { value: "inside", label: "Inside" },
            ]}
            onFieldChange={onFieldChange}
            native={false}
          />

          {/* Interaction Settings */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            Interaction Settings
          </Typography>

          <FormSwitch
            name={"legendHoverLink" as FieldPath<TFieldValues>}
            control={control}
            label="Legend Hover Link"
            onFieldChange={onFieldChange}
          />

          <FormSwitch
            name={"triggerLineEvent" as FieldPath<TFieldValues>}
            control={control}
            label="Trigger Line Event"
            onFieldChange={onFieldChange}
          />

          <FormSelect
            name={"cursor" as FieldPath<TFieldValues>}
            control={control}
            label="Mouse Cursor"
            options={[
              { value: "pointer", label: "Pointer" },
              { value: "default", label: "Default" },
              { value: "crosshair", label: "Crosshair" },
              { value: "move", label: "Move" },
              { value: "not-allowed", label: "Not Allowed" },
              { value: "help", label: "Help" },
            ]}
            onFieldChange={onFieldChange}
            native={false}
          />

          {/* Color */}
          <Divider sx={{ my: 2 }} />

          <OptimizedColorPicker
            name={"color" as FieldPath<TFieldValues>}
            control={control}
            label="Color"
            onFieldChange={onFieldChange}
            defaultValue="#5470c6"
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
