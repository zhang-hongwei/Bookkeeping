import { type ComponentInfo } from "@/app/components/constants/componentData";

// Component tree node structure
export interface ComponentNode {
  id: string;
  componentId: string;
  componentInfo: ComponentInfo;
  children: ComponentNode[];
}
