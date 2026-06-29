import { themeConfig } from "./themeConfig";

// ----------------------------------------------------------------------

export function createClasses(className: string): string {
  return `${themeConfig.classesPrefix}__${className}`;
}
