"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SmartAI: any;
    smartAIConfig?: Record<string, unknown>;
  }
}

const SDK_SRC = `/sdk/sdk.global.js?v=${Date.now()}`;

export default function SmartAIWidget() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already initialized
    if (window.SmartAI && window.SmartAI.getState() !== "IDLE") return;

    // Set global config before SDK loads
    window.smartAIConfig = {
      appId: "design-tool-local",
      apiBase: window.location.origin,
      token: "local-dev-token",
      user: { id: "guest", name: "Guest" },
      position: "right-bottom",
      debug: process.env.NODE_ENV === "development",
      theme: {
        mode: document.documentElement.getAttribute("data-color-scheme") === "dark" ? "dark" : "light",
        primaryColor: "#1677ff",
      },
    };

    // SDK script already loaded by a previous mount
    if (window.SmartAI) {
      window.SmartAI.init();
      return;
    }

    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => {
      // SDK auto-inits when window.smartAIConfig is present
    };
    document.body.appendChild(script);

    return () => {
      // Don't destroy on unmount — keep SDK alive across route changes
    };
  }, []);

  return null;
}
