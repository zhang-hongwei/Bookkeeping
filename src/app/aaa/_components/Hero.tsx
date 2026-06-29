"use client";

import { motion } from "framer-motion";
import { Box, Typography, Button, Stack, Container } from "@mui/material";
import Link from "next/link";
import {
  AutoAwesomeOutlined,
  ArrowForwardOutlined,
  ContentCopyOutlined,
} from "@mui/icons-material";
import {
  BRAND,
  COLOR,
  GRADIENT,
  HERO_STATS,
  LAYOUT,
} from "../_config/site";
import { fadeUp, staggerContainer } from "../_lib/motion";

/** Decorative floating glass "preview" panel shown beside the hero copy. */
function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: "100%" }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "100%" }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: 4,
            p: { xs: 2, sm: 2.5 },
            bgcolor: "rgba(255,255,255,0.04)",
            border: `1px solid ${COLOR.border}`,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.02) inset",
            overflow: "hidden",
          }}
        >
          {/* window chrome */}
          <Stack direction="row" spacing={0.75} sx={{ mb: 2 }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.18)",
                }}
              />
            ))}
          </Stack>

          {/* gradient swatch */}
          <Box
            sx={{
              height: 120,
              borderRadius: 2.5,
              background: GRADIENT.brand,
              mb: 2,
              boxShadow: "0 14px 40px rgba(100,61,255,0.4)",
            }}
          />

          {/* faux code lines */}
          <Stack spacing={1.1}>
            {[
              { w: "45%", c: "rgba(198,132,255,0.9)" },
              { w: "82%", c: "rgba(236,236,246,0.35)" },
              { w: "65%", c: "rgba(0,166,255,0.8)" },
              { w: "72%", c: "rgba(236,236,246,0.35)" },
              { w: "38%", c: "rgba(41,204,176,0.8)" },
            ].map((line, i) => (
              <Box
                key={i}
                sx={{
                  height: 9,
                  width: line.w,
                  borderRadius: 0.5,
                  bgcolor: line.c,
                }}
              />
            ))}
          </Stack>

          {/* copy pill */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{
              mt: 2.5,
              display: "inline-flex",
              py: 0.5,
              px: 1.25,
              borderRadius: 99,
              border: `1px solid ${COLOR.border}`,
              bgcolor: "rgba(255,255,255,0.05)",
            }}
          >
            <ContentCopyOutlined sx={{ fontSize: 14, color: COLOR.textDim }} />
            <Typography variant="caption" sx={{ color: COLOR.textDim }}>
              一键复制可用代码
            </Typography>
          </Stack>
        </Box>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        pt: { xs: `${LAYOUT.headerHeight + 56}px`, md: `${LAYOUT.headerHeight + 88}px` },
        pb: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: LAYOUT.maxWidth }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 5, md: 6 }}
          alignItems="center"
        >
          {/* Left: copy */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{ flex: 1.15, minWidth: 0 }}
          >
            {/* eyebrow */}
            <motion.div variants={fadeUp}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  display: "inline-flex",
                  py: 0.6,
                  px: 1.5,
                  borderRadius: 99,
                  border: `1px solid ${COLOR.border}`,
                  bgcolor: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <AutoAwesomeOutlined sx={{ fontSize: 16, color: "#C684FF" }} />
                <Typography variant="caption" sx={{ color: COLOR.textDim }}>
                  AI · 设计工具集合
                </Typography>
              </Stack>
            </motion.div>

            {/* headline */}
            <motion.div variants={fadeUp}>
              <Typography
                sx={{
                  mt: 2.5,
                  fontSize: { xs: "3rem", sm: "3.6rem", md: "4.6rem" },
                  fontWeight: 800,
                  lineHeight: 1.02,
                  letterSpacing: "-0.02em",
                  background: GRADIENT.brand,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                }}
              >
                DESIGN · TOOL
              </Typography>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: { xs: "1.5rem", sm: "1.9rem", md: "2.4rem" },
                  fontWeight: 700,
                  color: COLOR.text,
                  letterSpacing: "-0.01em",
                }}
              >
                {BRAND.tagline}
              </Typography>
            </motion.div>

            {/* description */}
            <motion.div variants={fadeUp}>
              <Typography
                sx={{
                  mt: 2.5,
                  maxWidth: 520,
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  lineHeight: 1.7,
                  color: COLOR.textDim,
                }}
              >
                {BRAND.description}
              </Typography>
            </motion.div>

            {/* CTAs */}
            <motion.div variants={fadeUp}>
              <Stack direction="row" spacing={2} sx={{ mt: 3.5, flexWrap: "wrap", gap: 2 }}>
                <Button
                  component={Link}
                  href={BRAND.primaryCta.href}
                  variant="contained"
                  size="large"
                  disableElevation
                  endIcon={<ArrowForwardOutlined />}
                  sx={{
                    px: 3,
                    py: 1.4,
                    borderRadius: 99,
                    textTransform: "none",
                    fontWeight: 600,
                    background: GRADIENT.brand,
                    boxShadow: "0 12px 32px rgba(100,61,255,0.45)",
                    "&:hover": {
                      boxShadow: "0 14px 40px rgba(100,61,255,0.6)",
                      filter: "brightness(1.08)",
                    },
                  }}
                >
                  {BRAND.primaryCta.label}
                </Button>
                <Button
                  component={Link}
                  href={BRAND.secondaryCta.href}
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 3,
                    py: 1.4,
                    borderRadius: 99,
                    textTransform: "none",
                    fontWeight: 600,
                    color: COLOR.text,
                    borderColor: COLOR.border,
                    bgcolor: "rgba(255,255,255,0.03)",
                    "&:hover": {
                      borderColor: COLOR.borderHover,
                      bgcolor: "rgba(255,255,255,0.06)",
                    },
                  }}
                >
                  {BRAND.secondaryCta.label}
                </Button>
              </Stack>
            </motion.div>

            {/* stats */}
            <motion.div variants={fadeUp}>
              <Stack
                direction="row"
                spacing={{ xs: 3, sm: 5 }}
                sx={{ mt: 5, flexWrap: "wrap", rowGap: 2 }}
              >
                {HERO_STATS.map((s) => (
                  <Box key={s.label}>
                    <Typography
                      sx={{
                        fontSize: { xs: "1.6rem", md: "2rem" },
                        fontWeight: 800,
                        lineHeight: 1,
                        background: GRADIENT.brand,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {s.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: COLOR.textFaint, mt: 0.5, display: "block" }}
                    >
                      {s.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </motion.div>
          </motion.div>

          {/* Right: preview card */}
          <Box sx={{ flex: 0.85, minWidth: 0, width: "100%" }}>
            <HeroPreview />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
