"use client";

import { motion } from "framer-motion";
import { Box, Typography, Button, Container } from "@mui/material";
import Link from "next/link";
import { ArrowForwardOutlined } from "@mui/icons-material";
import { BRAND, COLOR, GRADIENT, LAYOUT } from "../_config/site";
import { fadeUp, viewportOnce } from "../_lib/motion";

/** Final call-to-action panel with a glowing glass background. */
export default function CTASection() {
  return (
    <Box
      component="section"
      sx={{ position: "relative", py: LAYOUT.sectionPy }}
    >
      <Container maxWidth={false} sx={{ maxWidth: LAYOUT.maxWidth }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
              borderRadius: 5,
              px: { xs: 4, md: 8 },
              py: { xs: 6, md: 9 },
              border: `1px solid ${COLOR.border}`,
              background:
                "radial-gradient(circle at 50% 0%, rgba(100,61,255,0.28), transparent 60%), rgba(255,255,255,0.03)",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* decorative glows */}
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                top: "-40%",
                left: "-10%",
                width: "40vw",
                height: "40vw",
                background:
                  "radial-gradient(circle, rgba(0,166,255,0.25), transparent 65%)",
                filter: "blur(60px)",
                pointerEvents: "none",
              }}
            />
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                bottom: "-50%",
                right: "-10%",
                width: "40vw",
                height: "40vw",
                background:
                  "radial-gradient(circle, rgba(198,132,255,0.22), transparent 65%)",
                filter: "blur(70px)",
                pointerEvents: "none",
              }}
            />

            <Box sx={{ position: "relative" }}>
              <Typography
                sx={{
                  fontSize: { xs: "2rem", md: "3rem" },
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  background: GRADIENT.brand,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                }}
              >
                让灵感，秒变设计
              </Typography>
              <Typography
                sx={{
                  mt: 2,
                  mx: "auto",
                  maxWidth: 520,
                  color: COLOR.textDim,
                  lineHeight: 1.7,
                  fontSize: { xs: "0.98rem", md: "1.1rem" },
                }}
              >
                打开即用，无需注册。现在就去体验你的 AI 设计工具箱。
              </Typography>
              <Button
                component={Link}
                href={BRAND.primaryCta.href}
                variant="contained"
                size="large"
                disableElevation
                endIcon={<ArrowForwardOutlined />}
                sx={{
                  mt: 3.5,
                  px: 4,
                  py: 1.5,
                  borderRadius: 99,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  background: GRADIENT.brand,
                  boxShadow: "0 14px 36px rgba(100,61,255,0.5)",
                  "&:hover": {
                    boxShadow: "0 16px 44px rgba(100,61,255,0.65)",
                    filter: "brightness(1.08)",
                  },
                }}
              >
                {BRAND.primaryCta.label}
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
