"use client";

import {
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Control, FieldValues, FieldPath } from "react-hook-form";
import {
  FormSwitch,
  FormSelect,
  FormSlider,
  FormNumberFields,
} from "../form-fields";

interface SymbolStyleSectionProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  onFieldChange: (field: FieldPath<TFieldValues>, value: any) => void;
}

export function SymbolStyleSection<TFieldValues extends FieldValues>({
  control,
  onFieldChange,
}: SymbolStyleSectionProps<TFieldValues>) {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="subtitle2">Symbol Style</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {/* Show Symbol */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <FormSwitch
                name={"showSymbol" as FieldPath<TFieldValues>}
                control={control}
                label="Show Symbol"
                onFieldChange={onFieldChange}
              />
            </Grid>
          </Grid>

          {/* Show All Symbol */}
          <FormSelect
            name={"showAllSymbol" as FieldPath<TFieldValues>}
            control={control}
            label="Show All Symbol"
            options={[
              { value: "auto", label: "Auto" },
              { value: "true", label: "Always Show" },
              { value: "false", label: "Follow Strategy" },
            ]}
            onFieldChange={onFieldChange}
            native={false}
          />

          {/* Symbol Type */}
          <FormSelect
            name={"symbol" as FieldPath<TFieldValues>}
            control={control}
            label="Symbol Type"
            options={[
              { value: "emptyCircle", label: "Empty Circle" },
              { value: "circle", label: "Circle" },
              { value: "rect", label: "Rectangle" },
              { value: "roundRect", label: "Round Rectangle" },
              { value: "triangle", label: "Triangle" },
              { value: "diamond", label: "Diamond" },
              { value: "pin", label: "Pin" },
              { value: "arrow", label: "Arrow" },
              { value: "none", label: "None" },
            ]}
            onFieldChange={onFieldChange}
            native={false}
          />

          {/* Symbol Size */}
          <FormSlider
            name={"symbolSize" as FieldPath<TFieldValues>}
            control={control}
            label="Symbol Size"
            min={1}
            max={50}
            step={1}
            unit="px"
            onFieldChange={onFieldChange}
          />

          {/* Symbol Rotate */}
          <FormSlider
            name={"symbolRotate" as FieldPath<TFieldValues>}
            control={control}
            label="Symbol Rotate"
            min={0}
            max={360}
            step={15}
            unit="°"
            onFieldChange={onFieldChange}
          />

          {/* Keep Aspect Ratio */}
          <FormSwitch
            name={"symbolKeepAspect" as FieldPath<TFieldValues>}
            control={control}
            label="Keep Aspect Ratio"
            onFieldChange={onFieldChange}
          />

          {/* Symbol Offset */}
          <Typography variant="caption" color="text.secondary">
            Symbol Offset
          </Typography>
          <FormNumberFields
            nameX={"symbolOffsetX" as FieldPath<TFieldValues>}
            nameY={"symbolOffsetY" as FieldPath<TFieldValues>}
            control={control}
            labelX="Offset X"
            labelY="Offset Y"
            min={-100}
            max={100}
            onFieldChange={onFieldChange}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
