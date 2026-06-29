"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Head from "next/head";

const DIFY_TOKEN = "Hy201VJJpWH0A7Yp";
const DIFY_BASE_URL = "http://192.168.3.211";
const DIFY_EMBED_SRC = `${DIFY_BASE_URL}/embed.min.js`;

export default function DifyChatbot() {
  const pathname = usePathname();
  const isChatPage = pathname === "/chat";

  useEffect(() => {
    if (!isChatPage) return;
    if (typeof window === "undefined") return;

    // Already loaded
    if (document.getElementById("dify-chatbot-script")) return;

    // Set config before script loads
    (window as unknown as Record<string, unknown>).difyChatbotConfig = {
      token: DIFY_TOKEN,
      baseUrl: DIFY_BASE_URL,
      inputs: {},
      systemVariables: {},
      userVariables: {},
    };

    const script = document.createElement("script");
    script.src = DIFY_EMBED_SRC;
    script.id = "dify-chatbot-script";
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Keep alive across route changes
    };
  }, [isChatPage]);

  if (!isChatPage) return null;

  return (
    <style>{`
      #dify-chatbot-bubble-button {
        background-color: #1C64F2 !important;
        left: 20px !important;
        right: auto !important;
      }
      #dify-chatbot-bubble-window {
        width: 24rem !important;
        height: 40rem !important;
        left: 20px !important;
        right: auto !important;
        bottom: 90px !important;
      }
    `}</style>
  );
}
