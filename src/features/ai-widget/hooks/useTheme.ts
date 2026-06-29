"use client";

import { useState, useCallback } from "react";
import type { ThemeConfig } from "@/types/ai-widget";

interface UseThemeReturn {
  theme: ThemeConfig;
  updateTheme: (theme: ThemeConfig) => void;
  resolvedMode: "light" | "dark";
}

export function useTheme(initialTheme?: ThemeConfig): UseThemeReturn {
  const [theme, setTheme] = useState<ThemeConfig>(
    initialTheme ?? { mode: "light" }
  );

  const updateTheme = useCallback((newTheme: ThemeConfig) => {
    setTheme((prev) => ({ ...prev, ...newTheme }));
  }, []);

  const resolvedMode = theme.mode ?? "light";

  return { theme, updateTheme, resolvedMode };
}
