import type { Metadata } from "next";
import localFont from "next/font/local";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import GlobalProvider from "@/components/providers/GlobalProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import DifyChatbot from "@/components/DifyChatbot";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import "@/utils/suppress-warnings";

const geistSans = localFont({
  src: "./fonts/Geist.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMono.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Dev Tools - Enterprise Next.js SaaS Template",
  description:
    "Production-ready Next.js 16 full-stack template with MUI v7, TypeScript, PostgreSQL, Drizzle ORM, RBAC, and AI integration. Everything you need to launch your SaaS product.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Prevent dark mode flash - must be the first child of <body> */}
        <InitColorSchemeScript
          attribute="data-color-scheme"
          defaultMode="dark"
        />
        <AppRouterCacheProvider options={{ enableCssLayer: true, key: "mui" }}>
          <GlobalProvider>
            {/* <AuthProvider></AuthProvider> */}
            {children}
          </GlobalProvider>
        </AppRouterCacheProvider>
        {/* <DifyChatbot /> */}
      </body>
    </html>
  );
}
