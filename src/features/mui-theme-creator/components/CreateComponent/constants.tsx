import React from "react";
import {
  ViewQuilt as LayoutIcon,
  Input as FormIcon,
  TableChart as DataDisplayIcon,
  Notifications as FeedbackIcon,
  Menu as NavigationIcon,
  Layers as SurfaceIcon,
} from "@mui/icons-material";
import { type ComponentType } from "@/app/components/constants/componentData";

// Type icons
export const typeIcons: Record<ComponentType, React.ReactNode> = {
  layout: <LayoutIcon fontSize="small" />,
  form: <FormIcon fontSize="small" />,
  "data-display": <DataDisplayIcon fontSize="small" />,
  feedback: <FeedbackIcon fontSize="small" />,
  navigation: <NavigationIcon fontSize="small" />,
  surface: <SurfaceIcon fontSize="small" />,
};
