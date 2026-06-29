"use client";

import Script from "next/script";
import { useEffect } from "react";
import { DIFY_TOKEN, DIFY_BASE_URL } from "@/store/ai-context/config";

export function DifyChatbot() {
  useEffect(() => {
    if (document.getElementById("dify-chatbot-styles")) return;

    const style = document.createElement("style");
    style.id = "dify-chatbot-styles";
    style.textContent = `
      #dify-chatbot-bubble-button {
        background-color: #1C64F2 !important;
        z-index: 99999 !important;
      }
      #dify-chatbot-bubble-window {
        width: 24rem !important;
        height: 40rem !important;
        z-index: 99999 !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <>
      {/* Set config BEFORE embed.min.js loads — synchronous execution */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.difyChatbotConfig = {
            token: '${DIFY_TOKEN}',
            baseUrl: '${DIFY_BASE_URL}',
            inputs: {
              page_url: window.location.href,
              page_path: window.location.pathname,
              page_title: document.title,
            },
            systemVariables: {},
            userVariables: {},
          }`,
        }}
      />
      <Script
        src={`${DIFY_BASE_URL}/embed.min.js`}
        id={DIFY_TOKEN}
        strategy="afterInteractive"
      />
    </>
  );
}
