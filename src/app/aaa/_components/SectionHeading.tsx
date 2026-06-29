"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Box, Typography, Stack } from "@mui/material";
import { COLOR } from "../_config/site";
import { fadeUp, viewportOnce } from "../_lib/motion";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "left";
};

/** Shared section heading: small eyebrow chip + bold title + dim subtitle. */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: Props) {
  const centered = align === "center";
  return (
    <Box sx={{ textAlign: centered ? "center" : "left", mb: { xs: 4, md: 6 } }}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
      >
        <Stack
          spacing={1.5}
          sx={{ alignItems: centered ? "center" : "flex-start" }}
        >
          {eyebrow && (
            <Box
              sx={{
                display: "inline-block",
                py: 0.4,
                px: 1.25,
                borderRadius: 99,
                border: "1px solid rgba(198,132,255,0.35)",
                bgcolor: "rgba(198,132,255,0.08)",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#C684FF",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}
              >
                {eyebrow}
              </Typography>
            </Box>
          )}
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: "1.9rem", md: "2.7rem" },
              fontWeight: 800,
              color: COLOR.text,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              sx={{
                maxWidth: 640,
                color: COLOR.textDim,
                lineHeight: 1.7,
                fontSize: { xs: "0.98rem", md: "1.08rem" },
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Stack>
      </motion.div>
    </Box>
  );
}
