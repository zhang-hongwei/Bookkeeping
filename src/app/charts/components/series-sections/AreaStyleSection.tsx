"use client";

import {
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Control, FieldValues, FieldPath, UseFormWatch } from "react-hook-form";
import { FormSwitch, FormSelect, FormSlider } from "../form-fields";
import { SmartColorPicker } from "../form-fields/SmartColorPicker";

interface AreaStyleSectionProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  watch: UseFormWatch<TFieldValues>;
  onFieldChange: (field: FieldPath<TFieldValues>, value: any) => void;
}

export function AreaStyleSection<TFieldValues extends FieldValues>({
  control,
  watch,
  onFieldChange,
}: AreaStyleSectionProps<TFieldValues>) {
  const areaStyleEnabled = watch("areaStyleEnabled" as FieldPath<TFieldValues>);

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="subtitle2">Area Style</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {/* Enable Area Style */}
          <FormSwitch
            name={"areaStyleEnabled" as FieldPath<TFieldValues>}
            control={control}
            label="Enable Area Style"
            onFieldChange={onFieldChange}
          />

          {/* Opacity */}
          <FormSlider
            name={"areaStyleOpacity" as FieldPath<TFieldValues>}
            control={control}
            label="Opacity"
            min={0}
            max={1}
            step={0.1}
            onFieldChange={onFieldChange}
          />

          {/* Area Color - 支持渐变色 */}
          {areaStyleEnabled && (
            <SmartColorPicker
              name={"areaColor" as FieldPath<TFieldValues>}
              control={control}
              label="Area Color"
              onFieldChange={onFieldChange}
              defaultValue="rgba(84, 112, 198, 0.3)"
              supportGradient={true}
              supportAlpha={true}
            />
          )}

          {/* Area Style Origin - 仅在启用区域样式时显示 */}
          {areaStyleEnabled && (
            <FormSelect
              name={"areaStyleOrigin" as FieldPath<TFieldValues>}
              control={control}
              label="Area Origin"
              options={[
                { value: "auto", label: "Auto" },
                { value: "start", label: "Start (Min Value)" },
                { value: "end", label: "End (Max Value)" },
              ]}
              onFieldChange={onFieldChange}
              native={false}
            />
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
