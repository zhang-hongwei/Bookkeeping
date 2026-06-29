"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useChartStore } from "@/stores/charts/chart-store";

// Form validation schemas
const basicFormSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
  subtitle: z.string().optional(),
  animation: z.boolean().default(true),
});

const dataFormSchema = z.object({
  xAxisData: z.string().min(1, "X-axis data cannot be empty"),
  seriesData: z.string().min(1, "Series data cannot be empty"),
});

const advancedFormSchema = z.object({
  // Legend
  legendShow: z.boolean().default(true),
  legendOrient: z.enum(["horizontal", "vertical"]).default("horizontal"),
  legendPosition: z.enum(["top", "bottom", "left", "right"]).default("bottom"),

  // Grid
  gridLeft: z.string().default("3%"),
  gridRight: z.string().default("4%"),
  gridTop: z.string().default("10%"),
  gridBottom: z.string().default("15%"),
  gridContainLabel: z.boolean().default(true),

  // Tooltip
  tooltipShow: z.boolean().default(true),
  tooltipTrigger: z.enum(["item", "axis", "none"]).default("axis"),

  // Animation
  animation: z.boolean().default(true),
  animationDuration: z.number().min(0).max(10000).default(1000),
});

export type BasicFormData = z.infer<typeof basicFormSchema>;
export type DataFormData = z.infer<typeof dataFormSchema>;
export type AdvancedFormData = z.infer<typeof advancedFormSchema>;

export function useChartForms() {
  const { option, updateTitle, updateSeriesData, updateXAxisData, updateLegend, updateGrid, updateTooltip, updateAnimation } = useChartStore();

  // Basic configuration form
  const basicForm = useForm<BasicFormData>({
    resolver: zodResolver(basicFormSchema),
    defaultValues: {
      title:
        (option.title && !Array.isArray(option.title)
          ? option.title.text
          : "") || "",
      subtitle:
        (option.title && !Array.isArray(option.title)
          ? option.title.subtext
          : "") || "",
      animation: option.animation !== false,
    },
  });

  // Data configuration form
  const dataForm = useForm<DataFormData>({
    resolver: zodResolver(dataFormSchema),
    defaultValues: {
      xAxisData: "",
      seriesData: "",
    },
  });

  // Advanced configuration form
  const advancedForm = useForm<AdvancedFormData>({
    resolver: zodResolver(advancedFormSchema),
    defaultValues: {
      legendShow: true,
      legendOrient: "horizontal",
      legendPosition: "bottom",
      gridLeft: "3%",
      gridRight: "4%",
      gridTop: "10%",
      gridBottom: "15%",
      gridContainLabel: true,
      tooltipShow: true,
      tooltipTrigger: "axis",
      animation: option.animation !== false,
      animationDuration: 1000,
    },
  });

  const resetBasicForm = (title: string, subtitle: string, animation: boolean) => {
    basicForm.reset({ title, subtitle, animation });
  };

  return {
    basicForm,
    dataForm,
    advancedForm,
    resetBasicForm,
    schemas: {
      basicFormSchema,
      dataFormSchema,
      advancedFormSchema,
    }
  };
}