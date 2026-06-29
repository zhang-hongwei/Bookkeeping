"use client";

import { motion } from "framer-motion";
import { Box, Grid, Typography, Container, Stack } from "@mui/material";
import {
  AutoAwesomeOutlined,
  TuneOutlined,
  CodeOutlined,
  WidgetsOutlined,
  LensBlurOutlined,
  BoltOutlined,
} from "@mui/icons-material";
import type { ReactNode } from "react";
import { COLOR, FEATURES, LAYOUT } from "../_config/site";
import { EASE_OUT, viewportOnce } from "../_lib/motion";
import SectionHeading from "./SectionHeading";

// Map the string keys in FEATURES to actual icon nodes.
const ICONS: Record<string, ReactNode> = {
  auto: <AutoAwesomeOutlined />,
  tune: <TuneOutlined />,
  code: <CodeOutlined />,
  widgets: <WidgetsOutlined />,
  glass: <LensBlurOutlined />,
  bolt: <BoltOutlined />,
};

export default function Features() {
  return (
    <Box
      component="section"
      id="features"
      sx={{ position: "relative", py: LAYOUT.sectionPy }}
    >
      <Container maxWidth={false} sx={{ maxWidth: LAYOUT.maxWidth }}>
        <SectionHeading
          eyebrow="核心能力"
          title="为什么选择 Design Tool"
          subtitle="从灵感构思到可用代码，全流程在线完成 —— 专为设计师与前端工程师打造。"
        />
        <Grid container spacing={2.5}>
          {FEATURES.map((f, i) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: (i % 3) * 0.08 }}
                style={{ height: "100%" }}
              >
                <Box
                  sx={{
                    height: "100%",
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.035)",
                    border: `1px solid ${COLOR.border}`,
                    backdropFilter: "blur(8px)",
                    transition:
                      "transform .25s ease, border-color .25s ease, background-color .25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: COLOR.borderHover,
                      bgcolor: "rgba(255,255,255,0.06)",
                    },
                  }}
                >
                  <Stack
                    sx={{
                      alignItems: "center",
                      justifyContent: "center",
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      mb: 2,
                      color: "#fff",
                      background: f.accent,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                      "& .MuiSvgIcon-root": { fontSize: 24 },
                    }}
                  >
                    {ICONS[f.icon]}
                  </Stack>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ color: COLOR.text, mb: 1 }}
                  >
                    {f.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: COLOR.textDim, lineHeight: 1.7 }}
                  >
                    {f.desc}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
