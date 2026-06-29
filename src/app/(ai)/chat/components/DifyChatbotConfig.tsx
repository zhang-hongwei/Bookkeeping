"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function DifyChatbotConfig() {
  const pathname = usePathname();

  // Update inputs on SPA route changes — mutate in place so Dify sees changes
  useEffect(() => {
    if (!window.difyChatbotConfig) return;
    window.difyChatbotConfig.inputs = {
      page_url: window.location.href,
      page_path: pathname,
      page_title: document.title,
    };
  }, [pathname]);

  return null;
}

declare global {
  interface Window {
    difyChatbotConfig?: {
      token: string;
      baseUrl: string;
      inputs?: Record<string, string>;
      systemVariables?: Record<string, string>;
      userVariables?: Record<string, string>;
    };
  }
}
