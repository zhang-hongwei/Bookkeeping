"use client";

export default function SdkPreviewPage() {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: 40, fontFamily: "sans-serif" }}>
          <h1>SmartAI SDK Preview</h1>
          <p>
            This page simulates a host website embedding the AI Chat Widget.
            The floating button should appear in the bottom-right corner.
          </p>

          <h2>Configuration</h2>
          <pre
            style={{
              background: "#f5f5f5",
              padding: 16,
              borderRadius: 8,
              overflow: "auto",
              fontSize: 13,
            }}
          >
            {JSON.stringify(
              {
                appId: "preview-app",
                apiBase: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
                user: { id: "test-user", name: "Preview User" },
                theme: {
                  primaryColor: "#1677ff",
                  mode: "light",
                  position: "right-bottom",
                },
                debug: true,
              },
              null,
              2
            )}
          </pre>

          <h2>Test Actions</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => window.SmartAI?.open()}
              style={{ padding: "8px 16px", cursor: "pointer" }}
            >
              Open Widget
            </button>
            <button
              type="button"
              onClick={() => window.SmartAI?.close()}
              style={{ padding: "8px 16px", cursor: "pointer" }}
            >
              Close Widget
            </button>
            <button
              type="button"
              onClick={() => window.SmartAI?.toggle()}
              style={{ padding: "8px 16px", cursor: "pointer" }}
            >
              Toggle Widget
            </button>
            <button
              type="button"
              onClick={() =>
                window.SmartAI?.updateContext({
                  currentPage: "/sdk-preview",
                  activeModule: "testing",
                })
              }
              style={{ padding: "8px 16px", cursor: "pointer" }}
            >
              Update Context
            </button>
            <button
              type="button"
              onClick={() =>
                window.SmartAI?.setTheme({ mode: "dark" })
              }
              style={{ padding: "8px 16px", cursor: "pointer" }}
            >
              Dark Mode
            </button>
            <button
              type="button"
              onClick={() =>
                window.SmartAI?.setTheme({ mode: "light" })
              }
              style={{ padding: "8px 16px", cursor: "pointer" }}
            >
              Light Mode
            </button>
          </div>

          <h2>SDK State</h2>
          <div id="sdk-state" style={{ fontFamily: "monospace", fontSize: 13 }}>
            Checking...
          </div>

          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.smartAIConfig = {
                  appId: "preview-app",
                  apiBase: window.location.origin,
                  token: "dev-test-token",
                  user: { id: "test-user", name: "Preview User" },
                  theme: { primaryColor: "#1677ff", mode: "light" },
                  debug: true,
                  preload: true,
                };

                // Update state display
                setInterval(function() {
                  var el = document.getElementById("sdk-state");
                  if (el && window.SmartAI) {
                    el.textContent = "State: " + window.SmartAI.getState();
                  }
                }, 1000);
              `,
            }}
          />
          {/* SDK script would be loaded from CDN in production */}
          {/* For preview, the SDK is loaded from the built bundle */}
          {/* <script src="/sdk.js" async></script> */}
        </div>
      </body>
    </html>
  );
}
