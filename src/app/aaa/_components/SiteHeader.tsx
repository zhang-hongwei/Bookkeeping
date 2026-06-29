"use client";

import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Stack,
  Container,
} from "@mui/material";
import Link from "next/link";
import { BRAND, COLOR, GRADIENT, LAYOUT, SCROLL_ROOT_ID } from "../_config/site";

const NAV_ITEMS = [
  { label: "功能特性", href: "#features" },
  { label: "工具矩阵", href: "#tools" },
  { label: "沌联 Chat", href: "/chat" },
];

/**
 * Sticky glass header. Because the page scrolls inside #aaa-scroll-root (not the
 * window), the "solidify on scroll" effect listens on that element. If the
 * element is missing it gracefully stays in its default translucent state.
 */
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const root = document.getElementById(SCROLL_ROOT_ID);
    if (!root) return;
    const onScroll = () => setScrolled(root.scrollTop > 12);
    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: 1100,
        bgcolor: scrolled ? "rgba(10,10,18,0.72)" : "rgba(10,10,18,0.25)",
        backdropFilter: scrolled ? "blur(14px)" : "blur(6px)",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "blur(6px)",
        borderBottom: `1px solid ${scrolled ? COLOR.border : "transparent"}`,
        transition: "background-color .25s ease, backdrop-filter .25s ease, border-color .25s ease",
      }}
    >
      <Container
        maxWidth={false}
        sx={{ maxWidth: LAYOUT.maxWidth }}
        disableGutters
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: `${LAYOUT.headerHeight}px !important`,
            height: LAYOUT.headerHeight,
            gap: 2,
          }}
        >
          {/* Logo */}
          <Box
            component={Link}
            href="/aaa"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.5,
                background: GRADIENT.brand,
                boxShadow: "0 6px 20px rgba(100,61,255,0.45)",
                flexShrink: 0,
              }}
            />
            <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: COLOR.text, letterSpacing: "0.04em" }}
              >
                {BRAND.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: COLOR.textFaint, fontSize: 11 }}
              >
                {BRAND.nameZh}
              </Typography>
            </Box>
          </Box>

          {/* Center nav — hidden on small screens */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              ml: "auto",
              display: { xs: "none", md: "flex" },
            }}
          >
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                size="small"
                sx={{
                  color: COLOR.textDim,
                  textTransform: "none",
                  fontWeight: 500,
                  px: 1.5,
                  "&:hover": {
                    color: COLOR.text,
                    background: "transparent",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          {/* Primary CTA */}
          <Button
            component={Link}
            href={BRAND.primaryCta.href}
            variant="contained"
            disableElevation
            sx={{
              ml: { xs: "auto", md: 0 },
              px: 2.5,
              py: 1,
              borderRadius: 99,
              textTransform: "none",
              fontWeight: 600,
              background: GRADIENT.brand,
              boxShadow: "0 8px 24px rgba(100,61,255,0.4)",
              "&:hover": {
                boxShadow: "0 10px 30px rgba(100,61,255,0.55)",
                filter: "brightness(1.08)",
              },
            }}
          >
            {BRAND.primaryCta.label}
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
