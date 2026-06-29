import { Box } from "@mui/material";
import { COLOR, SCROLL_ROOT_ID } from "./_config/site";
import BackgroundFX from "./_components/BackgroundFX";
import SiteHeader from "./_components/SiteHeader";
import Hero from "./_components/Hero";
import Features from "./_components/Features";
import ToolsShowcase from "./_components/ToolsShowcase";
import CTASection from "./_components/CTASection";
import SiteFooter from "./_components/SiteFooter";

/**
 * Landing page for the Design Tool toolbox (/aaa).
 *
 * The global stylesheet sets `html, body { overflow: hidden }`, so this page
 * renders a full-viewport fixed scroll container (#aaa-scroll-root) that owns
 * the vertical scroll. The fixed header and anchor navigation both key off it.
 */
export default function AaaLandingPage() {
  return (
    <Box
      id={SCROLL_ROOT_ID}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        color: COLOR.text,
        scrollBehavior: "smooth",
        // keep anchored sections clear of the fixed header
        scrollPaddingTop: "84px",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <BackgroundFX />
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <SiteHeader />
        <main>
          <Hero />
          <Features />
          <ToolsShowcase />
          <CTASection />
        </main>
        <SiteFooter />
      </Box>
    </Box>
  );
}
