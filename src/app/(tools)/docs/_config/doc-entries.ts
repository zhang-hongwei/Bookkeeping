export interface DocEntry {
  slug: string;
  title: string;
  description: string;
}

export const muiDocs: DocEntry[] = [
  {
    slug: "theme-scope-overview",
    title: "Theme Scope Overview",
    description: "All theme properties global usage statistics",
  },
  {
    slug: "theme-structure",
    title: "Theme Structure",
    description: "Complete Theme object structure reference",
  },
  {
    slug: "palette-usage",
    title: "Palette Usage",
    description: "Per-component palette path usage details",
  },
  {
    slug: "typography-usage",
    title: "Typography Usage",
    description: "Typography variant and property usage patterns",
  },
  {
    slug: "spacing-usage",
    title: "Spacing Usage",
    description: "theme.spacing() usage patterns across components",
  },
  {
    slug: "shadows-elevation",
    title: "Shadows & Elevation",
    description: "Shadows array usage in components",
  },
  {
    slug: "shape-borderRadius",
    title: "Shape & Border Radius",
    description: "BorderRadius application across components",
  },
  {
    slug: "transitions-usage",
    title: "Transitions Usage",
    description: "Transitions system usage patterns",
  },
  {
    slug: "z-index-stacking",
    title: "Z-Index Stacking",
    description: "Component stacking order and z-index values",
  },
  {
    slug: "component-theme-matrix",
    title: "Component Theme Matrix",
    description: "Complete component × theme property cross-reference",
  },
];
