import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "AI Assistant",
  description: "AI Chat Widget",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function EmbedChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: '#fff',
        margin: 0,
        padding: 0,
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {children}
    </div>
  );
}
